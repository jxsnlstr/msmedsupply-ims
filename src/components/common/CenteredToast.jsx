import React from "react";

const VARIANTS = {
  success: {
    borderClass: "border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    iconPath:
      "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.06-1.06l-4.47 4.47-1.53-1.53a.75.75 0 0 0-1.06 1.06l2.06 2.06c.293.293.767.293 1.06 0l5-5Z",
  },
  error: {
    borderClass: "border-red-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    iconPath:
      "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.03 5.72a.75.75 0 0 1 1.06 0L12 8.94l.97-.97a.75.75 0 1 1 1.06 1.06L13.06 10l.97.97a.75.75 0 1 1-1.06 1.06L12 11.06l-.97.97a.75.75 0 1 1-1.06-1.06L10.94 10l-.97-.97a.75.75 0 0 1 0-1.06Z",
  },
};

export default function CenteredToast({
  open,
  variant = "success",
  title,
  message,
  onClose,
  closeLabel = "Close",
}) {
  if (!open) return null;

  const styles = VARIANTS[variant] || VARIANTS.success;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        className={`relative z-10 bg-white border ${styles.borderClass} shadow-xl rounded-2xl px-8 py-6 text-center`}
      >
        <div
          className={`mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-7 h-7 ${styles.iconColor}`}
          >
            <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
        <button
          onClick={onClose}
          className="mt-4 inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
