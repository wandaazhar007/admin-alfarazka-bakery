import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBreadSlice,
  faLayerGroup,
  faUsers,
  faGear,
  faChartLine,
  faBoxTissue,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";

type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

type MenuItem = {
  key: string;
  label: string;
  icon: any;
  path: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: "products",
    label: "Produk",
    icon: faBreadSlice,
    path: "/products"
  },
  {
    key: "paket",
    label: "Paket",
    icon: faBoxTissue,
    path: "/snack-packages"
  },
  {
    key: "categories",
    label: "Kategori",
    icon: faLayerGroup,
    path: "/categories",
  },
  {
    key: "users",
    label: "Users",
    icon: faUsers,
    path: "/users"
  },
  {
    key: "settings",
    label: "Pengaturan",
    icon: faGear,
    path: "/settings"
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: faChartLine,
    path: "/analytics"
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const handleItemClick = () => {
    if (onClose) onClose(); // tutup sidebar di mobile setelah klik menu
  };

  return (
    <>
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed
          }`}
      >
        <nav className={styles.nav}>
          <p className={styles.sectionLabel}>Main Menu</p>
          <ul className={styles.menu}>
            {MENU_ITEMS.map((item) => (
              <li key={item.key} className={styles.menuItemWrapper}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.menuItemActive : ""
                    }`
                  }
                  onClick={handleItemClick}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.bottomHint}>
          <span className={styles.bottomText}>
            Nyemil sehat, teman ngopi ☕
          </span>
        </div>
      </aside>

      {/* Overlay untuk mobile */}
      <button
        type="button"
        aria-label="Close sidebar"
        className={`${styles.mobileOverlay} ${isOpen ? styles.mobileOverlayVisible : ""
          }`}
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;