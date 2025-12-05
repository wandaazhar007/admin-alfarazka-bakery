// src/pages/users/UsersPage.tsx
import styles from "./UsersPage.module.scss";

const UsersPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <h1>Users</h1>
      <p>Kelola akun admin & staff yang punya akses ke dashboard.</p>
    </div>
  );
};

export default UsersPage;