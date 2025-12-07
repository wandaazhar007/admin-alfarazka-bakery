import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.scss";
import logoAlfarazka from "../../assets/images/logo-alfarazka-bakery.png";
import { loginAdmin } from "../../services/authService";

type LoginPageProps = {
  onLoginSuccess?: () => void;
};

const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@alfarazka.com");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // reset error
    setEmailError(null);
    setPasswordError(null);
    setLoginError(null);

    let hasError = false;

    // Validasi Email
    if (!email.trim()) {
      setEmailError("Masukan Email Anda");
      hasError = true;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Format email tidak diketahui");
      hasError = true;
    }

    // Validasi Password
    if (!password.trim()) {
      setPasswordError("Masukan Password Anda");
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const data = await loginAdmin(email.trim(), password);

      localStorage.setItem("alfarazka_admin_token", data.token);
      localStorage.setItem("alfarazka_admin_name", data.admin.name);
      localStorage.setItem("alfarazka_admin_email", data.admin.email);

      if (onLoginSuccess) onLoginSuccess?.();

      navigate("/products", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);

      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      setLoginError(
        backendMsg || "Email atau password salah. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <img
            src={logoAlfarazka}
            alt="Alfarazka Bakery Logo"
            className={styles.logo}
          />
        </div>

        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>
          Masuk untuk mengelola produk dan pesanan Alfarazka Bakery.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* EMAIL */}
          <label
            className={`${styles.field} ${emailError ? styles.fieldError : ""
              }`}
          >
            <span>Email</span>
            <input
              type="email"
              placeholder="admin@alfarazka.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailError ? styles.inputError : ""}
            />
            {emailError && (
              <p className={styles.errorText}>{emailError}</p>
            )}
          </label>

          {/* PASSWORD */}
          <label
            className={`${styles.field} ${passwordError ? styles.fieldError : ""
              }`}
          >
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordError ? styles.inputError : ""}
            />
            {passwordError && (
              <p className={styles.errorText}>{passwordError}</p>
            )}
          </label>

          {/* ERROR DARI BACKEND */}
          {loginError && (
            <p className={styles.loginError}>{loginError}</p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
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