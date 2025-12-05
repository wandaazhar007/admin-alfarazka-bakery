// src/pages/product/ProductPage.tsx
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./ProductPage.module.scss";
import { fetchProducts, type Product } from "../../services/productService";

const SKELETON_ROWS = 6;
const PAGE_SIZE = 5;
const ARTIFICIAL_DELAY_MS = 700; // biar skeleton kelihatan

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounce untuk live search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // setiap ganti search, reset ke halaman 1
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

      // Tambah delay supaya skeleton kelihatan
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

  // Load pertama kali dan ketika debouncedSearch berubah
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

  const handleClickEdit = (product: Product) => {
    console.log("Edit produk:", product.id);
    // TODO: nanti arahkan ke /products/:id/edit
  };

  const handleClickDelete = (product: Product) => {
    console.log("Hapus produk:", product.id);
    // TODO: nanti panggil API DELETE dan refresh list
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
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Products</h1>
          <p>Kelola daftar produk roti & pastry Alfarazka Bakery.</p>
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

          <button className={styles.addButton} type="button">
            + Tambah Produk
          </button>
        </div>
      </header>

      {/* TABLE WRAPPER */}
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
                          onClick={() => handleClickEdit(product)}
                          aria-label="Edit produk"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                          onClick={() => handleClickDelete(product)}
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

export default ProductPage;