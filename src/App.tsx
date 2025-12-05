// src/App.tsx
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Footer from "./components/footer/Footer";

import LoginPage from "./pages/login/LoginPage";
import ProductPage from "./pages/product/ProductPage";
import CategoryPage from "./pages/category/CategoryPage";
import UsersPage from "./pages/users/UsersPage";
import SettingsPage from "./pages/settings/SettingsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";

const App: React.FC = () => {
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    Boolean(localStorage.getItem("alfarazka_admin_token"))
  );

  const isAuthPage = location.pathname === "/login";

  useEffect(() => {
    // Sinkron dengan localStorage
    if (!localStorage.getItem("alfarazka_admin_token")) {
      setIsLoggedIn(false);
    }
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("alfarazka_admin_token");
    localStorage.removeItem("alfarazka_admin_name");
    localStorage.removeItem("alfarazka_admin_email");
    setIsLoggedIn(false);
  };

  // 🟢 PENTING: kalau SUDAH login dan akses /login → redirect ke /products
  if (isLoggedIn && isAuthPage) {
    return <Navigate to="/products" replace />;
  }

  // Kalau BELUM login dan bukan di /login → paksa ke /login
  if (!isLoggedIn && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  // Layout khusus untuk halaman login
  if (isAuthPage) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // Layout utama admin (Navbar + Sidebar + Footer)
  return (
    <div className="app-shell">
      <Navbar onToggleSidebar={handleToggleSidebar} onLogout={handleLogout} />

      <div className="app-shell__body">
        <div className="app-shell__inner">
          <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

          <main className="app-shell__content">
            <Routes>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/categories" element={<CategoryPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;