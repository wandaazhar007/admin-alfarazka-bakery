// src/pages/login/LoginPage.tsx
import styles from "./LoginPage.module.scss";

const LoginPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: panggil /api/auth/login, simpan token, redirect ke /products
    console.log("Login submit");
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>
          Masuk untuk mengelola produk dan pesanan Alfarazka Bakery.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Email</span>
            <input type="email" placeholder="admin@alfarazka.com" required />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input type="password" placeholder="••••••••" required />
          </label>

          <button type="submit" className={styles.submitButton}>
            Masuk
          </button>
        </form>

        <p className={styles.hint}>
          Tips: jangan bagikan akun admin ke orang yang tidak kamu percaya.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;