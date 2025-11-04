import React from "react";
import { NavLink } from "react-router-dom";

import Logo from "../assets/medsupply.png";
import HomeIcon from "../assets/Home.png";
import InventoryIcon from "../assets/Inventory.png";
import OrderIcon from "../assets/Order.png";
import ReportIcon from "../assets/Report.png";
import SettingsIcon from "../assets/Settings.png";
import LogoutIcon from "../assets/Log Out.png";

export default function Sidebar({ onLogout }) {
  const menu = [
    { name: "Dashboard", to: "/", icon: HomeIcon },
    { name: "Inventory", to: "/inventory", icon: InventoryIcon },
    { name: "Orders", to: "/orders", icon: OrderIcon },
    { name: "Reports", to: "/reports", icon: ReportIcon },
  ];

  return (
    <aside className="w-[240px] bg-white border-r border-[#E4E7EC] fixed inset-y-0 left-0 flex flex-col justify-between">
      {/* Logo */}
      <div>
        <div className="h-20 flex items-center justify-center border-b border-[#E4E7EC]">
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
                    ? "bg-[#EEF4FF] text-[#1E63FF]"
                    : "text-gray-700 hover:bg-gray-100"
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
      <div className="border-t border-[#E4E7EC] p-3 space-y-2">
        <NavLink
          to="/settings"
          className="flex items-center gap-4 px-3 py-2.5 rounded-md text-[15px] text-gray-700 hover:bg-gray-100"
        >
          <img src={SettingsIcon} alt="Settings" className="w-6 h-6" />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-md text-[15px] text-red-500 hover:bg-red-50 font-medium"
        >
          <img src={LogoutIcon} alt="Log Out" className="w-6 h-6" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
