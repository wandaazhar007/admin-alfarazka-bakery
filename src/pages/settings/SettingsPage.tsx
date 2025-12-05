// src/pages/settings/SettingsPage.tsx
import styles from "./SettingsPage.module.scss";

const SettingsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <h1>Settings</h1>
      <p>Pengaturan umum untuk sistem admin Alfarazka Bakery.</p>
    </div>
  );
};

export default SettingsPage;