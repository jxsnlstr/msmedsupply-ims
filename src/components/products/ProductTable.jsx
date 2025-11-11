import React from "react";

export default function ProductTable({
  filteredProducts,
  onAddClick,
  onFilterClick,
  onClearFilters,
  isFilterApplied,
  onDownload,
  clearFilterIcon,
  computeAvailability,
  parseThreshold,
  onEdit,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Products</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Add Product
          </button>
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
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Buying Price</th>
              <th className="px-4 py-3 text-left font-medium">Unit</th>
              <th className="px-4 py-3 text-left font-medium">Threshold Value</th>
              <th className="px-4 py-3 text-left font-medium">Expiry Date</th>
              <th className="px-4 py-3 text-left font-medium">Availability</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((item, idx) => {
              const { value: thresholdValue, unit } = parseThreshold(item.threshold);
              const availability = computeAvailability(item.quantity, item.threshold);
              const availabilityClass =
                availability === "In Stock"
                  ? "text-green-600"
                  : availability === "Low Stock"
                  ? "text-yellow-500"
                  : "text-red-500";

              return (
                <tr key={`${item.id}-${idx}`}>
                  <td className="px-4 py-3 text-gray-800">{item.id}</td>
                  <td className="px-4 py-3 text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-800">{item.category}</td>
                  <td className="px-4 py-3 text-gray-800">${item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-800">{unit}</td>
                  <td className="px-4 py-3 text-gray-800">{thresholdValue}</td>
                  <td className="px-4 py-3 text-gray-800">{item.expiry}</td>
                  <td className={`px-4 py-3 font-medium ${availabilityClass}`}>{availability}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
