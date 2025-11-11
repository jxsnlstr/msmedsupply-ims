import React from "react";

export default function ProductMetricGrid({ totalProducts }) {
  const cards = [
    { label: "Categories", value: "14", accent: "text-blue-600" },
    { label: "Total Products", value: totalProducts, accent: "text-green-600", helper: "Live count" },
    { label: "Top Selling", value: "5", accent: "text-purple-600" },
    { label: "Low Stocks", value: "12", accent: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {cards.map(({ label, value, accent, helper }, index) => (
        <div key={label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-1">{helper || "Last 7 days"}</p>
        </div>
      ))}
    </div>
  );
}
