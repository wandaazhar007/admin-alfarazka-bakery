// src/components/footer/Footer.tsx
import styles from "./Footer.module.scss";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        © {year} Alfarazka Bakery. All rights reserved.

        <p className={styles.rightText}>

          Built with <span className={styles.heart}>❤️</span> by{" "}
          <span className={styles.name}>Wanda Azhar</span> in Detroit, ID,
          USA
        </p>
      </div>
    </footer>
  );
};

export default Footer;