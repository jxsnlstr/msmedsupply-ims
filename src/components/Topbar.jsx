import React from "react";
import SearchIcon from "../assets/Search.png";
import NotificationIcon from "../assets/Notification.png";

export default function Topbar() {
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-[320px]">
        <img src={SearchIcon} alt="Search" className="w-4 h-4 opacity-70" />
        <input
          type="text"
          placeholder="Search inventory, orders, or suppliers..."
          className="ml-2 bg-transparent outline-none text-sm text-gray-700 w-full"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <button className="relative">
          <img
            src={NotificationIcon}
            alt="Notifications"
            className="w-5 h-5 opacity-80 hover:opacity-100 transition"
          />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <img
            src="/src/assets/medsupply.png"
            alt="User"
            className="w-7 h-7 rounded-full border border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}
