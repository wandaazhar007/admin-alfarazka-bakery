// src/App.tsx
import { useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
// import Footer from "./components/footer/Footer";

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      {/* NAVBAR */}
      <Navbar onToggleSidebar={handleToggleSidebar} />

      {/* BODY */}
      <div className="app-shell__body">
        {/* INNER: sejajar dengan navbar (.inner di Navbar) */}
        <div className="app-shell__inner">
          <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

          <main className="app-shell__content">
            <h1>Admin Dashboard – Alfarazka Bakery</h1>
            <p>
              Ini masih konten dummy. Nanti akan diganti dengan halaman
              Products, Category, Users, Settings, dan Analytics yang
              terhubung ke backend.
            </p>
          </main>
        </div>
      </div>

      {/* FOOTER */}
      {/* <Footer /> */}
    </div>
  );
};

export default App;