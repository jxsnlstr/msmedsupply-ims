import React from "react";

export default function InventoryTable({
  filteredProducts,
  entryMap,
  onFilterClick,
  isFilterApplied,
  onClearFilters,
  onDownload,
  clearFilterIcon,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Inventory</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onFilterClick}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
          >
            Filters
          </button>
          {isFilterApplied && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              title="Clear Filters"
            >
              <img src={clearFilterIcon} alt="Clear Filters" className="w-4 h-4" />
              <span className="text-sm">Clear Filters</span>
            </button>
          )}
          <button
            onClick={onDownload}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
          >
            Download all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product ID</th>
              <th className="px-4 py-3 text-left font-medium">Product Name</th>
              <th className="px-4 py-3 text-left font-medium">Batch</th>
              <th className="px-4 py-3 text-left font-medium">Quantity</th>
              <th className="px-4 py-3 text-left font-medium">Location</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Til</th>
              <th className="px-4 py-3 text-left font-medium">Entry Date/Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((item, idx) => {
              const key = `${item.id}::${item.name}`;
              const meta = (entryMap && entryMap[key]) || {};
              const entryDate = meta.entryAt ? new Date(meta.entryAt) : new Date();
              const tilDays = Math.max(
                0,
                Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
              );

              return (
                <tr key={`${item.id}-${idx}`}>
                  <td className="px-4 py-3 text-gray-800">{item.id}</td>
                  <td className="px-4 py-3 text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-800">{meta.batch || ""}</td>
                  <td className="px-4 py-3 text-gray-800">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-800 font-semibold">{item.location}</td>
                  <td className="px-4 py-3 text-gray-800">{meta.user || ""}</td>
                  <td className="px-4 py-3 text-gray-800">{tilDays} days</td>
                  <td className="px-4 py-3 text-gray-800">{entryDate.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
