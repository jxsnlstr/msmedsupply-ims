import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import Orders from "./pages/Orders.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";

import "./index.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (username, password) => {
    if (username && password) setIsLoggedIn(true);
  };

  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex bg-[#F8F9FB] min-h-screen">
      {/* Fixed Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 ml-[240px] bg-[#F8F9FB] min-h-screen overflow-y-auto">
        <Topbar />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
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
