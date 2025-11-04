import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("MSMedSupply");
  const [email, setEmail] = useState("admin@msmedsupply.com");
  const [theme, setTheme] = useState("Light");

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="max-w-4xl mx-auto p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>

        {/* SETTINGS FORM */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option>Light</option>
                <option>Dark</option>
                <option>System Default</option>
              </select>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              className="border border-gray-300 text-gray-700 px-5 py-1.5 rounded-md hover:bg-gray-100 transition"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Changes are applied immediately and will reflect across all IMS modules.</p>
        </div>
      </div>
    </div>
  );
}
