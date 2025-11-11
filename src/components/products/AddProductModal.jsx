import React from "react";

const FIELD_CONFIG = [
  { label: "Product ID", key: "id" },
  { label: "Category", key: "category" },
  { label: "Buying Price", key: "price" },
  { label: "Unit", key: "unit" },
  { label: "Threshold Value", key: "threshold" },
];

export default function AddProductModal({
  open,
  product,
  onFieldChange,
  onClose,
  onSubmit,
  onImageUpload,
}) {
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
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">New Product</h2>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-6 cursor-pointer"
          onClick={() => document.getElementById("product-image-upload")?.click()}
        >
          <p className="text-sm text-gray-500">
            Drag image here <br />
            <span className="text-blue-600 cursor-pointer">or Browse image</span>
          </p>
          <input
            id="product-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageUpload}
          />
          {product?.image && <p className="text-xs text-gray-500 mt-2">{product.image.name}</p>}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Product Name</p>
          <input
            type="text"
            placeholder="Enter product name"
            value={product?.name || ""}
            onChange={handleChange("name")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {FIELD_CONFIG.map((field) => (
          <div key={field.key} className="mb-4">
            <p className="text-sm text-gray-600 mb-1">{field.label}</p>
            <input
              type="text"
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={product?.[field.key] || ""}
              onChange={handleChange(field.key)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        ))}

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
          <input
            type="date"
            value={product?.expiry || ""}
            onChange={handleChange("expiry")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Discard
          </button>
          <button
            onClick={onSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
