import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUser,
  faGear,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Navbar.module.scss";

// IMPORT LOGO dari src/assets/images
import logoAlfarazka from "../../assets/images/logo-alfarazka-bakery.png";

type NavbarProps = {
  onToggleSidebar?: () => void;
  onLogout?: () => void; // tambah prop logout
};

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleProfile = () => {
    console.log("Go to profile");
    setIsDropdownOpen(false);
  };

  const handleSettings = () => {
    console.log("Go to settings");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    // panggil fungsi logout dari parent
    if (onLogout) {
      onLogout();
    } else {
      console.log("Logout clicked (onLogout belum di-passing dari parent)");
    }
    setIsDropdownOpen(false);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.hamburger}
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <div className={styles.brand}>
            <img
              src={logoAlfarazka}
              alt="Logo Alfarazka Bakery"
              className={styles.logo}
            />
            <span className={styles.title}>ALFARAZKA BAKERY</span>
          </div>
        </div>

        <div className={styles.right}>
          <div ref={dropdownRef} className={styles.profileWrapper}>
            <button
              type="button"
              className={styles.profileButton}
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
            >
              <div className={styles.avatar}>A</div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>Admin</span>
                <span className={styles.profileRole}>Administrator</span>
              </div>
            </button>

            <div
              className={`${styles.dropdown} ${isDropdownOpen ? styles.dropdownOpen : ""
                }`}
            >
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={handleProfile}
              >
                <FontAwesomeIcon icon={faUser} />
                <span>Profil</span>
              </button>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={handleSettings}
              >
                <FontAwesomeIcon icon={faGear} />
                <span>Pengaturan</span>
              </button>
              <button
                type="button"
                className={styles.dropdownItemLogout}
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;