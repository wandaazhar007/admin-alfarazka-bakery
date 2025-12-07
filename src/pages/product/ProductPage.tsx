import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./ProductPage.module.scss";
import {
  fetchProducts,
  deleteProduct,
  type Product,
} from "../../services/productService";

const SKELETON_ROWS = 6;
const PAGE_SIZE = 5;
const ARTIFICIAL_DELAY_MS = 700;

const ProductPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // ----- STATE UNTUK MODAL DELETE -----
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Debounce untuk live search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = async (opts?: { pageOverride?: number }) => {
    const targetPage = opts?.pageOverride ?? page;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const dataPromise = fetchProducts({
        page: targetPage,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });

      const [data] = await Promise.all([
        dataPromise,
        new Promise((resolve) =>
          setTimeout(resolve, ARTIFICIAL_DELAY_MS)
        ),
      ]);

      setProducts(data.products);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat data produk. Coba lagi nanti."
      );
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadProducts({ pageOverride: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    loadProducts({ pageOverride: newPage });
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (id: string) => {
    navigate(`/products/${id}/edit`);
  };

  // ----- BUKA / TUTUP MODAL DELETE -----
  const openDeleteModal = (product: Product) => {
    setProductToDelete({ id: product.id, name: product.name });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // ----- KONFIRMASI DELETE (dipanggil dari modal) -----
  const confirmDelete = async () => {
    if (!productToDelete) return;
    const { id } = productToDelete;

    try {
      setIsDeletingId(id);
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      closeDeleteModal();
    } catch (err: any) {
      console.error("Gagal menghapus produk:", err);
      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menghapus produk."
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleClickAdd = () => {
    navigate("/products/new");
  };

  const pageInfoText = useMemo(() => {
    if (totalItems === 0) return "Tidak ada data produk.";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, totalItems);
    return `Menampilkan ${start}–${end} dari ${totalItems} produk`;
  }, [page, totalItems]);

  const renderSkeletonRows = () => {
    return Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
      <tr key={idx} className={styles.skeletonRow}>
        <td>
          <div className={styles.skeletonBoxSmall} />
        </td>
        <td>
          <div className={styles.skeletonBox} />
        </td>
        <td>
          <div className={styles.skeletonBoxShort} />
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
          <h1>Products</h1>
          <p>Kelola daftar produk roti &amp; pastry Alfarazka Bakery.</p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama..."
              value={search}
              onChange={handleChangeSearch}
              className={styles.searchInput}
            />
          </div>

          <button
            className={styles.addButton}
            type="button"
            onClick={handleClickAdd}
          >
            + Tambah Produk
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
                  <th>Foto</th>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th className={styles.thAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && renderSkeletonRows()}

                {!isLoading && products.length === 0 && !isInitialLoad && (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Belum ada produk yang tersimpan.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  products.length > 0 &&
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        {product.imageUrl ? (
                          <div className={styles.imageCellWrapper}>
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className={styles.productImage}
                            />
                          </div>
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <span>
                              {product.name
                                ? product.name.charAt(0).toUpperCase()
                                : "R"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.productName}>
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.badge}>
                          {product.category || "Tanpa kategori"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.price}>
                          Rp{" "}
                          {product.price.toLocaleString("id-ID", {
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </td>
                      <td className={styles.tdAction}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => handleEdit(product.id)}
                          aria-label="Edit produk"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          onClick={() => openDeleteModal(product)}
                          disabled={isDeletingId === product.id}
                          aria-label="Hapus produk"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

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

      {/* ----- MODAL KONFIRMASI DELETE ----- */}
      {isDeleteModalOpen && productToDelete && (
        <div className={styles.deleteModalOverlay}>
          <div className={styles.deleteModal}>
            <h2>Hapus Produk?</h2>
            <p>
              Yakin ingin menghapus produk{" "}
              <strong>"{productToDelete.name}"</strong>? Produk akan
              dinonaktifkan dan tidak tampil di daftar.
            </p>
            <div className={styles.deleteModalActions}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={closeDeleteModal}
                disabled={isDeletingId === productToDelete.id}
              >
                Batal
              </button>
              <button
                type="button"
                className={styles.modalDeleteButton}
                onClick={confirmDelete}
                disabled={isDeletingId === productToDelete.id}
              >
                {isDeletingId === productToDelete.id
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

export default ProductPage;