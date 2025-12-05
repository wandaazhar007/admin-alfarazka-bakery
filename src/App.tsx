// src/App.tsx
import { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isAuthPage = location.pathname === "/login";

  // TODO: nanti ganti dengan pengecekan token JWT
  const isLoggedIn = true;

  if (!isLoggedIn && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthPage) {
    // Layout khusus halaman login (tanpa navbar/sidebar/footer)
    return (
      <div className="app-shell">
        <main className="app-shell__content" style={{ maxWidth: "40rem" }}>
          <LoginPage />
        </main>
      </div>
    );
  }

  // Layout utama admin (dengan Navbar, Sidebar, Footer)
  return (
    <div className="app-shell">
      <Navbar onToggleSidebar={handleToggleSidebar} />

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