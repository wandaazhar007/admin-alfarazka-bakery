// src/pages/category/CategoryPage.tsx
import styles from "./CategoryPage.module.scss";

const CategoryPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <h1>Category</h1>
      <p>Kelola kategori produk (misalnya: Roti Unyil 1K, Roti Unyil 2K, dll).</p>
    </div>
  );
};

export default CategoryPage;