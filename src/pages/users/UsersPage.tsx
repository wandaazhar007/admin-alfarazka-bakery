// src/pages/users/UsersPage.tsx
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./UsersPage.module.scss";
import {
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  type AdminUser,
} from "../../services/userService";

const PAGE_SIZE = 10;
const SKELETON_ROWS = 6;
const ARTIFICIAL_DELAY_MS = 700;

type FormMode = "edit";

const UsersPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // pagination + search
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // modal form (edit user)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode] = useState<FormMode>("edit");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("admin");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // modal delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // ---------- debounce search ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ---------- load users ----------
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const dataPromise = fetchAdminUsers();
        const [users] = await Promise.all([
          dataPromise,
          new Promise((resolve) =>
            setTimeout(resolve, ARTIFICIAL_DELAY_MS)
          ),
        ]);

        setAllUsers(users);
      } catch (err: any) {
        console.error("Gagal memuat users:", err);
        setErrorMessage(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat daftar pengguna. Coba lagi nanti."
        );
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    load();
  }, []);

  // ---------- derived: filtered + paged ----------
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return allUsers;

    const s = debouncedSearch.toLowerCase();
    return allUsers.filter((user) => {
      const name = user.name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const role = user.role?.toLowerCase() || "";
      return (
        name.includes(s) ||
        email.includes(s) ||
        role.includes(s)
      );
    });
  }, [allUsers, debouncedSearch]);

  const totalItems = filteredUsers.length;
  const totalPages =
    totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentItems = filteredUsers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const pageInfoText = useMemo(() => {
    if (totalItems === 0) return "Tidak ada pengguna.";
    const start = startIndex + 1;
    const end = Math.min(startIndex + PAGE_SIZE, totalItems);
    return `Menampilkan ${start}–${end} dari ${totalItems} pengguna`;
  }, [totalItems, startIndex]);

  const formatDate = (value?: string | null): string => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setPage(newPage);
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // ---------- modal form: open/close ----------
  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormName(user.name || "");
    setFormRole(user.role || "admin");
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingUser(null);
    setFormName("");
    setFormRole("admin");
    setFormError(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const trimmed = formName.trim();
    if (!trimmed) {
      setFormError("Nama user wajib diisi.");
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      const updated = await updateAdminUser(editingUser.id, {
        name: trimmed,
        role: formRole,
      });

      setAllUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );

      closeFormModal();
    } catch (err: any) {
      console.error("Gagal menyimpan user:", err);
      setFormError(
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat menyimpan data user."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- delete modal ----------
  const openDeleteModal = (user: AdminUser) => {
    setUserToDelete({ id: user.id, name: user.name || "" });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const { id } = userToDelete;

    try {
      setIsDeletingId(id);
      await deleteAdminUser(id);
      setAllUsers((prev) => prev.filter((u) => u.id !== id));
      closeDeleteModal();
    } catch (err: any) {
      console.error("Gagal menghapus user:", err);
      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menghapus user."
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
      <tr key={idx} className={styles.skeletonRow}>
        <td>
          <div className={styles.skeletonBox} />
        </td>
        <td>
          <div className={styles.skeletonBoxShort} />
        </td>
        <td>
          <div className={styles.skeletonBoxAction} />
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Users</h1>
          <p>Kelola akun admin &amp; staf yang memiliki akses ke dashboard.</p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="Cari user berdasarkan nama, email, atau role..."
              value={search}
              onChange={handleChangeSearch}
              className={styles.searchInput}
            />
          </div>
        </div>
      </header>

      <section className={styles.tableSection}>
        <div className={styles.tableCard}>
          {errorMessage && (
            <div className={styles.errorBanner}>{errorMessage}</div>
          )}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Tanggal Dibuat</th>
                  <th className={styles.thAction}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && renderSkeletonRows()}

                {!isLoading &&
                  !isInitialLoad &&
                  currentItems.length === 0 && (
                    <tr>
                      <td colSpan={3} className={styles.emptyState}>
                        Belum ada user yang tersimpan.
                      </td>
                    </tr>
                  )}

                {!isLoading &&
                  currentItems.length > 0 &&
                  currentItems.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userInfo}>
                          <div className={styles.avatarCircle}>
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <div className={styles.userName}>
                              {user.name}
                            </div>
                            <div className={styles.userMeta}>
                              {user.email} ·{" "}
                              <span className={styles.userRole}>
                                {user.role || "admin"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.userDate}>
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td className={styles.tdAction}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => openEditModal(user)}
                          aria-label="Edit user"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          onClick={() => openDeleteModal(user)}
                          aria-label="Hapus user"
                          disabled={isDeletingId === user.id}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* pagination bar */}
          <div className={styles.paginationBar}>
            <div className={styles.pageInfo}>{pageInfoText}</div>

            {totalItems > 0 && totalPages > 1 && (
              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                >
                  Prev
                </button>

                <span className={styles.pageIndicator}>
                  Halaman {currentPage} dari {totalPages}
                </span>

                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- MODAL: EDIT USER ---------- */}
      {isFormModalOpen && editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2>Edit User</h2>

            <form onSubmit={handleSubmitForm}>
              <div className={styles.modalField}>
                <label htmlFor="userName">Nama</label>
                <input
                  id="userName"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={formError ? styles.inputError : ""}
                  placeholder="Nama lengkap user"
                />
              </div>

              <div className={styles.modalField}>
                <label htmlFor="userRole">Role</label>
                <select
                  id="userRole"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <p className={styles.modalHint}>
                Email tidak bisa diubah di sini. Jika perlu mengubah email,
                bisa dibuat fitur terpisah.
              </p>

              {formError && (
                <p className={styles.errorText}>{formError}</p>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancelButton}
                  onClick={closeFormModal}
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={styles.modalPrimaryButton}
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan…" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- MODAL: DELETE CONFIRM ---------- */}
      {isDeleteModalOpen && userToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2>Hapus User?</h2>
            <p>
              Yakin ingin menghapus user{" "}
              <strong>"{userToDelete.name}"</strong>? User ini tidak akan
              bisa mengakses dashboard lagi.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={closeDeleteModal}
                disabled={isDeletingId === userToDelete.id}
              >
                Batal
              </button>
              <button
                type="button"
                className={styles.modalDeleteButton}
                onClick={confirmDelete}
                disabled={isDeletingId === userToDelete.id}
              >
                {isDeletingId === userToDelete.id
                  ? "Menghapus…"
                  : "Ya, hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;