import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import CenteredToast from "../components/common/CenteredToast.jsx";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [companyName, setCompanyName] = useState("MSMedSupply");
  const [email, setEmail] = useState("admin@msmedsupply.com");
  const [savedToast, setSavedToast] = useState(false);
  const toastTimerRef = useRef(null);

  const themeOptions = useMemo(() => ["Light", "Dark", "System Default"], []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleSave = () => {
    setSavedToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <>
    <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 ease-out">
      <div className="max-w-4xl mx-auto p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>

        {/* SETTINGS FORM */}
        <div className="bg-white border border-gray-200 rounded-md p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-500"
              >
                {themeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Current theme in use: <strong>{resolvedTheme}</strong>
              </p>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              className="border border-gray-300 text-gray-700 px-5 py-1.5 rounded-md hover:bg-gray-100 transition dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Changes are applied immediately and will reflect across all IMS modules.</p>
        </div>
      </div>
    </div>

      <CenteredToast
        open={savedToast}
        variant="success"
        title="Saved"
        message="Settings saved successfully."
        onClose={() => setSavedToast(false)}
      />
    </>
  );
}
