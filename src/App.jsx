import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Inventory from "./pages/Inventory.jsx";
import StockMovement from "./pages/StockMovement.jsx";
import Receiving from "./pages/Receiving.jsx";
import Orders from "./pages/Orders.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";

import "./index.css";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleLogin = (username, password) => {
    if (username && password) setIsLoggedIn(true);
  };

  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`flex min-h-screen transition-colors duration-200 ease-out ${resolvedTheme === "Dark" ? "bg-gray-950 text-gray-100" : "bg-[#F8F9FB] text-gray-900"}`}>
      {/* Fixed Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 ml-[240px] min-h-screen overflow-y-auto bg-[#F8F9FB] text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 ease-out">
        <Topbar />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/stock-movement" element={<StockMovement />} />
            <Route path="/receiving" element={<Receiving />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
