import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Footer from "./components/footer/Footer";

import LoginPage from "./pages/login/LoginPage";
import ProductPage from "./pages/product/ProductPage";
import ProductCreatePage from "./pages/product/ProductCreatePage";
import ProductEditPage from "./pages/product/ProductEditPage";
import CategoryPage from "./pages/category/CategoryPage";
import UsersPage from "./pages/users/UsersPage";
import SettingsPage from "./pages/settings/SettingsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import SnackPackagePage from "./pages/snackPackage/SnackPackagePage";
import SnackPackageFormPage from "./pages/snackPackage/SnackPackageFormPage";


const App: React.FC = () => {
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    Boolean(localStorage.getItem("alfarazka_admin_token"))
  );

  const isAuthPage = location.pathname === "/login";

  useEffect(() => {
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

  if (isLoggedIn && isAuthPage) {
    return <Navigate to="/products" replace />;
  }

  if (!isLoggedIn && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthPage) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

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
              <Route path="/products/new" element={<ProductCreatePage />} />
              <Route path="/products/:id/edit" element={<ProductEditPage />} />
              <Route path="/categories" element={<CategoryPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<Navigate to="/products" replace />} />
              <Route path="/snack-packages" element={<SnackPackagePage />} />
              <Route path="/snack-packages/new" element={<SnackPackageFormPage />} />
              <Route path="/snack-packages/:id/edit" element={<SnackPackageFormPage />} />
            </Routes>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;