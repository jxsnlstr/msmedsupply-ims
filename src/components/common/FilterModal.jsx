import React from "react";

export default function FilterModal({ open, filters, onFieldChange, onClose, onApply }) {
  if (!open) return null;

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose?.();
  };

  const handleChange = (field) => (event) => {
    onFieldChange?.(field, event.target.value);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-[2px]"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Filter</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Product Name</p>
            <input
              type="text"
              placeholder="Search by product name"
              value={filters?.name || ""}
              onChange={handleChange("name")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Product ID</p>
            <input
              type="text"
              placeholder="Search by product ID"
              value={filters?.id || ""}
              onChange={handleChange("id")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Category</p>
            <input
              type="text"
              placeholder="Enter category"
              value={filters?.category || ""}
              onChange={handleChange("category")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Availability</p>
            <select
              value={filters?.availability || ""}
              onChange={handleChange("availability")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Quantity Sort</p>
            <select
              value={filters?.quantitySort || ""}
              onChange={handleChange("quantitySort")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">None</option>
              <option value="lowToHigh">Low to High</option>
              <option value="highToLow">High to Low</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
            <input
              type="date"
              value={filters?.expiry || ""}
              onChange={handleChange("expiry")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onApply}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
