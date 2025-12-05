// src/pages/analytics/AnalyticsPage.tsx
import styles from "./AnalyticsPage.module.scss";

const AnalyticsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <h1>Analytics</h1>
      <p>
        Ringkasan performa penjualan, jumlah pesanan, dan produk favorit
        pelanggan.
      </p>
    </div>
  );
};

export default AnalyticsPage;