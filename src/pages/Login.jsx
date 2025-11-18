import React, { useState } from "react";
import medsupplyLogo from "../assets/medsupply.png"; // your logo in src/assets

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const didLogin = await onLogin?.(username, password);
      if (!didLogin) {
        setError("Invalid username or password.");
      }
    } catch (err) {
      setError(err?.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: "url('/LoginWallpaper.jpg')" }}
    >
      {/* Soft blue overlay for brand cohesion */}
      <div className="absolute inset-0 bg-blue-100/40 backdrop-blur-sm"></div>

      {/* Faded brand-colored medical icons */}
      <div className="absolute inset-0 select-none opacity-30">
        <div className="absolute top-10 left-16 text-[#007BBD] text-5xl icon-float">➕</div>
        <div className="absolute bottom-24 left-32 text-[#00A3E0] text-4xl icon-float">⚕️</div>
        <div className="absolute top-1/2 left-1/3 text-[#007BBD] text-6xl icon-float">🏥</div>
        <div className="absolute top-1/3 right-1/4 text-[#00A3E0] text-5xl icon-float">💉</div>
        <div className="absolute bottom-1/4 right-1/3 text-[#007BBD] text-5xl icon-float">🦽</div>
      </div>

      {/* Login card */}
      <div className="relative bg-white/90 shadow-2xl rounded-2xl p-8 w-[380px] z-10 backdrop-blur-lg border border-white/50">
        <div className="flex justify-center mb-6 animate-fadeIn">
          <img
            src={medsupplyLogo}
            alt=""
            className="w-60 h-auto drop-shadow-md"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#007BBD] hover:bg-[#0068A3] text-white py-2 rounded-lg font-semibold transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing In..." : "Log In"}
          </button>

          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}
        </form>

        <p className="text-gray-600 text-xs text-center mt-6">
          © {new Date().getFullYear()} Mississippi Med Supply. All rights reserved.
        </p>
      </div>
    </div>
  );
}
