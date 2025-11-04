import React, { useState } from "react";
export default function Settings() {
  const [company, setCompany] = useState("MSMedSupply");
  const [email, setEmail] = useState("admin@msmedsupply.com");
  const [theme, setTheme] = useState("Light");
  const save = () => alert("Settings saved!");
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        <div className="space-y-4">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border p-3 rounded w-full"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded w-full"
          />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="border p-3 rounded w-full"
          >
            <option>Light</option>
            <option>Dark</option>
            <option>System Default</option>
          </select>
          <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
