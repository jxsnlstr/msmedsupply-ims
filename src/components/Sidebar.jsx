import React from "react";
import { NavLink } from "react-router-dom";

import Logo from "../assets/medsupply.png";
import HomeIcon from "../assets/Home.png";
import InventoryIcon from "../assets/Inventory.png";
import ProductsIcon from "../assets/Products.png";
import StockMovementIcon from "../assets/Stock Movement.png";
import ReceivingIcon from "../assets/Receiving.png";
import SettingsIcon from "../assets/Settings.png";
import LogoutIcon from "../assets/Log Out.png";

export default function Sidebar({ onLogout }) {
  const menu = [
    { name: "Dashboard", to: "/", icon: HomeIcon },
    { name: "Products", to: "/products", icon: ProductsIcon },
    { name: "Inventory", to: "/inventory", icon: InventoryIcon },
    { name: "Stock Movement", to: "/stock-movement", icon: StockMovementIcon },
    { name: "Receiving", to: "/receiving", icon: ReceivingIcon },
  ];

  return (
    <aside className="w-[240px] bg-white border-r border-[#E4E7EC] fixed inset-y-0 left-0 flex flex-col justify-between transition-colors duration-200 ease-out dark:bg-gray-900 dark:border-gray-800">
      {/* Logo */}
      <div>
        <div className="h-20 flex items-center justify-center border-b border-[#E4E7EC] dark:border-gray-800">
          <img src={Logo} alt="MedSupply" className="h-20 w-auto object-contain" />
        </div>

        {/* Nav Links */}
        <nav className="mt-3 px-2">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-md text-[15px] font-medium transition ${
                  isActive
                    ? "bg-[#EEF4FF] text-[#1E63FF] dark:bg-blue-500/20 dark:text-blue-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                }`
              }
            >
              <img
                src={item.icon}
                alt={item.name}
                className="w-6 h-6 object-contain"
              />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-[#E4E7EC] p-3 space-y-2 dark:border-gray-800">
        <NavLink
          to="/settings"
          className="flex items-center gap-4 px-3 py-2.5 rounded-md text-[15px] text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <img src={SettingsIcon} alt="Settings" className="w-6 h-6" />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-md text-[15px] text-red-500 hover:bg-red-50 font-medium dark:hover:bg-red-500/10"
        >
          <img src={LogoutIcon} alt="Log Out" className="w-6 h-6" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
