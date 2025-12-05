// src/pages/product/ProductPage.tsx
import styles from "./ProductPage.module.scss";

const ProductPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Products</h1>
          <p>Kelola daftar produk roti & pastry Alfarazka Bakery.</p>
        </div>
        <button className={styles.addButton}>+ Tambah Produk</button>
      </header>

      <div className={styles.content}>
        <p>
          Nanti di sini akan ada tabel / grid produk, pencarian, filter, dan
          pagination yang terhubung ke backend.
        </p>
      </div>
    </div>
  );
};

export default ProductPage;