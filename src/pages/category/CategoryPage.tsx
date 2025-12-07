import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPenToSquare,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./CategoryPage.module.scss";
import {
  fetchCategories,
  type Category,
} from "../../services/categoryService";
import apiClient from "../../lib/apiClient";

const PAGE_SIZE = 5;
const SKELETON_ROWS = 5;
const ARTIFICIAL_DELAY_MS = 700;

type FormMode = "create" | "edit";

const CategoryPage: React.FC = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // pagination + search
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // modal form (create/edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // modal delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
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

  // ---------- load categories once ----------
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const dataPromise = fetchCategories(); // ambil semua kategori
        const [list] = await Promise.all([
          dataPromise,
          new Promise((resolve) =>
            setTimeout(resolve, ARTIFICIAL_DELAY_MS)
          ),
        ]);

        setAllCategories(list);
      } catch (err: any) {
        console.error("Gagal memuat kategori:", err);
        setErrorMessage(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat daftar kategori. Coba lagi nanti."
        );
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    load();
  }, []);

  // ---------- derived: filtered + paged ----------
  const filteredCategories = useMemo(() => {
    if (!debouncedSearch) return allCategories;

    const s = debouncedSearch.toLowerCase();
    return allCategories.filter((cat) =>
      (cat.name || "").toLowerCase().includes(s)
    );
  }, [allCategories, debouncedSearch]);

  const totalItems = filteredCategories.length;
  const totalPages =
    totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentItems = filteredCategories.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const pageInfoText = useMemo(() => {
    if (totalItems === 0) return "Tidak ada kategori.";
    const start = startIndex + 1;
    const end = Math.min(startIndex + PAGE_SIZE, totalItems);
    return `Menampilkan ${start}–${end} dari ${totalItems} kategori`;
  }, [totalItems, startIndex]);

  // ---------- helpers ----------
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
  const openCreateModal = () => {
    setFormMode("create");
    setEditingCategory(null);
    setFormName("");
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setFormMode("edit");
    setEditingCategory(category);
    setFormName(category.name || "");
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setFormName("");
    setEditingCategory(null);
    setFormError(null);
  };

  // ---------- create / update ----------
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formName.trim();

    if (!trimmed) {
      setFormError("Nama kategori wajib diisi.");
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      if (formMode === "create") {
        const res = await apiClient.post("/categories", { name: trimmed });
        const raw =
          res.data?.data?.category ||
          res.data?.data ||
          res.data?.category ||
          res.data;
        const created = raw as Category;

        setAllCategories((prev) => [...prev, created]);
      } else if (formMode === "edit" && editingCategory) {
        const res = await apiClient.put(
          `/categories/${editingCategory.id}`,
          { name: trimmed }
        );
        const raw =
          res.data?.data?.category ||
          res.data?.data ||
          res.data?.category ||
          res.data;
        const updated = raw as Category;

        setAllCategories((prev) =>
          prev.map((cat) => (cat.id === updated.id ? updated : cat))
        );
      }

      closeFormModal();
    } catch (err: any) {
      console.error("Gagal menyimpan kategori:", err);
      setFormError(
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat menyimpan kategori."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- delete modal ----------
  const openDeleteModal = (category: Category) => {
    setCategoryToDelete({ id: category.id, name: category.name || "" });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    const { id } = categoryToDelete;

    try {
      setIsDeletingId(id);
      await apiClient.delete(`/categories/${id}`);

      setAllCategories((prev) => prev.filter((cat) => cat.id !== id));
      closeDeleteModal();
    } catch (err: any) {
      console.error("Gagal menghapus kategori:", err);
      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menghapus kategori."
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
          <h1>Categories</h1>
          <p>Kelola kategori produk roti &amp; pastry Alfarazka Bakery.</p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={search}
              onChange={handleChangeSearch}
              className={styles.searchInput}
            />
          </div>

          <button
            className={styles.addButton}
            type="button"
            onClick={openCreateModal}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Tambah Kategori</span>
          </button>
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
                        Belum ada kategori yang tersimpan.
                      </td>
                    </tr>
                  )}

                {!isLoading &&
                  currentItems.length > 0 &&
                  currentItems.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <span className={styles.categoryName}>
                          {cat.name}
                        </span>
                      </td>
                      <td>
                        <span className={styles.categoryDate}>
                          {formatDate(
                            (cat as any).createdAt ||
                            (cat as any).created_at
                          )}
                        </span>
                      </td>
                      <td className={styles.tdAction}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => openEditModal(cat)}
                          aria-label="Edit kategori"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          onClick={() => openDeleteModal(cat)}
                          aria-label="Hapus kategori"
                          disabled={isDeletingId === cat.id}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
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

      {/* ---------- MODAL: CREATE / EDIT CATEGORY ---------- */}
      {isFormModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2>
              {formMode === "create"
                ? "Tambah Kategori"
                : "Edit Kategori"}
            </h2>

            <form onSubmit={handleSubmitForm}>
              <div className={styles.modalField}>
                <label htmlFor="categoryName">Nama Kategori</label>
                <input
                  id="categoryName"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={formError ? styles.inputError : ""}
                  placeholder="Contoh: Roti Unyil 1K"
                />
                {formError && (
                  <p className={styles.errorText}>{formError}</p>
                )}
              </div>

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
                  {isSaving
                    ? "Menyimpan…"
                    : formMode === "create"
                      ? "Tambah"
                      : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- MODAL: DELETE CONFIRM ---------- */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2>Hapus Kategori?</h2>
            <p>
              Yakin ingin menghapus kategori{" "}
              <strong>"{categoryToDelete.name}"</strong>? Kategori yang
              dihapus tidak akan tampil lagi di daftar.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={closeDeleteModal}
                disabled={isDeletingId === categoryToDelete.id}
              >
                Batal
              </button>
              <button
                type="button"
                className={styles.modalDeleteButton}
                onClick={confirmDelete}
                disabled={isDeletingId === categoryToDelete.id}
              >
                {isDeletingId === categoryToDelete.id
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

export default CategoryPage;