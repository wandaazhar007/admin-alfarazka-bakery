import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faMagnifyingGlass,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./SnackPackagePage.module.scss";
import {
  fetchSnackPackages,
  deleteSnackPackage,
  type SnackPackage,
} from "../../services/snackPackageService";

const PAGE_SIZE = 10;
const SKELETON_ROWS = 6;
const ARTIFICIAL_DELAY_MS = 700;

type StatusFilter = "all" | "active" | "inactive";

const SnackPackagePage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<SnackPackage[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const loadPackages = async (opts?: { pageOverride?: number }) => {
    const targetPage = opts?.pageOverride ?? page;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const dataPromise = fetchSnackPackages({
        page: targetPage,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status: statusFilter,
      });

      const [data] = await Promise.all([
        dataPromise,
        new Promise((resolve) => setTimeout(resolve, ARTIFICIAL_DELAY_MS)),
      ]);

      setItems(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (err: any) {
      console.error("Gagal memuat paket snack:", err);
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat paket snack. Coba beberapa saat lagi."
      );
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  // initial + on filter/search change
  useEffect(() => {
    loadPackages({ pageOverride: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    loadPackages({ pageOverride: newPage });
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
  };

  const handleClickAdd = () => {
    navigate("/snack-packages/new");
  };

  const handleEdit = (id: string) => {
    navigate(`/snack-packages/${id}/edit`);
  };

  const handleDelete = async (id: string, name: string) => {
    // akan kita ganti dengan modal custom nanti kalau mau
    const ok = window.confirm(
      `Yakin ingin menghapus paket "${name}"? Paket akan dinonaktifkan / dihapus.`
    );
    if (!ok) return;

    try {
      setIsDeletingId(id);
      await deleteSnackPackage(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Gagal menghapus paket:", err);
      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menghapus paket snack."
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  const pageInfoText = useMemo(() => {
    if (totalItems === 0) return "Belum ada paket snack yang tersimpan.";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, totalItems);
    return `Menampilkan ${start}–${end} dari ${totalItems} paket snack`;
  }, [page, totalItems]);

  const renderSkeletonRows = () =>
    Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
      <tr key={idx} className={styles.skeletonRow}>
        <td>
          <div className={styles.skeletonLine} />
        </td>
        <td>
          <div className={styles.skeletonLine} />
        </td>
        <td>
          <div className={styles.skeletonLine} />
        </td>
        <td>
          <div className={styles.skeletonStatus} />
        </td>
        <td>
          <div className={styles.skeletonActions} />
        </td>
      </tr>
    ));

  const formatPrice = (value: number) =>
    `Rp ${value.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Paket Snack Acara</h1>
          <p>
            Kelola paket snack pengajian, arisan, ulang tahun, dan rapat kantor
            untuk ditampilkan di website utama Alfarazka Bakery.
          </p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="Cari paket berdasarkan nama..."
              value={search}
              onChange={handleChangeSearch}
              className={styles.searchInput}
            />
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={handleClickAdd}
          >
            + Tambah Paket
          </button>
        </div>
      </header>

      {/* FILTER STATUS */}
      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>Status:</span>
        <div className={styles.filterChips}>
          <button
            type="button"
            className={`${styles.filterChip} ${statusFilter === "all" ? styles.filterChipActive : ""
              }`}
            onClick={() => handleFilterChange("all")}
          >
            Semua
          </button>
          <button
            type="button"
            className={`${styles.filterChip} ${statusFilter === "active" ? styles.filterChipActive : ""
              }`}
            onClick={() => handleFilterChange("active")}
          >
            Aktif
          </button>
          <button
            type="button"
            className={`${styles.filterChip} ${statusFilter === "inactive" ? styles.filterChipActive : ""
              }`}
            onClick={() => handleFilterChange("inactive")}
          >
            Non-aktif
          </button>
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableCard}>
          {errorMessage && (
            <div className={styles.errorBanner}>{errorMessage}</div>
          )}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama Paket</th>
                  <th>Deskripsi</th>
                  <th>Harga</th>
                  <th>Status</th>
                  <th className={styles.thAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && renderSkeletonRows()}

                {!isLoading && items.length === 0 && !isInitialLoad && (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Belum ada paket snack yang cocok dengan filter / pencarian.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  items.length > 0 &&
                  items.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.packageName}>{pkg.name}</span>
                          {pkg.fitFor && (
                            <span className={styles.fitFor}>{pkg.fitFor}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={styles.shortDesc}>
                          {pkg.shortDescription}
                        </span>
                      </td>
                      <td>
                        <span className={styles.price}>
                          {formatPrice(pkg.price)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${pkg.isActive
                            ? styles.statusActive
                            : styles.statusInactive
                            }`}
                        >
                          <FontAwesomeIcon
                            icon={pkg.isActive ? faCircleCheck : faCircleXmark}
                          />
                          <span>{pkg.isActive ? "Aktif" : "Non-aktif"}</span>
                        </span>
                      </td>
                      <td className={styles.tdAction}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => handleEdit(pkg.id)}
                          aria-label="Edit paket"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          disabled={isDeletingId === pkg.id}
                          aria-label="Hapus paket"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className={styles.paginationBar}>
            <div className={styles.pageInfo}>{pageInfoText}</div>

            {totalPages > 1 && (
              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || isLoading}
                >
                  Prev
                </button>

                <span className={styles.pageIndicator}>
                  Halaman {page} dari {totalPages}
                </span>

                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || isLoading}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SnackPackagePage;