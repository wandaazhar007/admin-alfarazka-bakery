// src/components/sidebar/Sidebar.tsx
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBreadSlice,
  faLayerGroup,
  faUsers,
  faGear,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Sidebar.module.scss";

type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

type MenuItem = {
  key: string;
  label: string;
  icon: any;
};

const MENU_ITEMS: MenuItem[] = [
  { key: "products", label: "Products", icon: faBreadSlice },
  { key: "category", label: "Category", icon: faLayerGroup },
  { key: "users", label: "Users", icon: faUsers },
  { key: "settings", label: "Settings", icon: faGear },
  { key: "analytics", label: "Analytics", icon: faChartLine },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [activeKey, setActiveKey] = useState<string>("products");

  const handleClick = (key: string) => {
    setActiveKey(key);
    // nanti dihubungkan ke routing (navigate) di step berikutnya
    if (onClose) onClose();
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
                <button
                  type="button"
                  className={`${styles.menuItem} ${activeKey === item.key ? styles.menuItemActive : ""
                    }`}
                  onClick={() => handleClick(item.key)}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                </button>
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