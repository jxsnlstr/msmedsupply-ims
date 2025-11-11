import React from "react";

const DEFAULT_FIELDS = [
  { name: "id", label: "Product ID", type: "text" },
  { name: "category", label: "Category", type: "text" },
  { name: "batch", label: "Batch", type: "text" },
  { name: "price", label: "Buying Price", type: "number" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "unit", label: "Unit", type: "text" },
  { name: "expiry", label: "Expiry", type: "date" },
];

export default function ProductModal({
  isOpen,
  title,
  item,
  onFieldChange,
  onNameChange,
  suggestions = [],
  showSuggestions = false,
  onSelectSuggestion,
  onClose,
  onSubmit,
  primaryActionLabel = "Save",
  fields = DEFAULT_FIELDS,
  errors = {},
}) {
  if (!isOpen) return null;

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleFieldChange = (field) => (event) => {
    onFieldChange?.(field, event.target.value);
  };

  const nameError = errors?.name;

  const inputClasses = (fieldName) => {
    const hasError = Boolean(errors?.[fieldName]);
    return [
      "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none",
      hasError
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 focus:ring-blue-400",
    ].join(" ");
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-[2px]"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative dark:bg-gray-800 dark:text-gray-100"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 relative">
            <p className="text-sm text-gray-600 mb-1">Product Name</p>
            <input
              type="text"
              placeholder="Enter or select product name"
              value={item?.name || ""}
              onChange={(event) => onNameChange?.(event.target.value)}
              className={inputClasses("name")}
              aria-invalid={nameError ? "true" : "false"}
            />
            {showSuggestions && item?.name && (
              <ul className="absolute z-10 bg-white border border-gray-200 rounded-md w-full max-h-32 overflow-y-auto shadow mt-1">
                {suggestions.map((product) => (
                  <li
                    key={`${product.id}-${product.name}`}
                    onClick={() => onSelectSuggestion?.(product)}
                    className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                  >
                    {product.name}
                  </li>
                ))}
                {suggestions.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
                )}
              </ul>
            )}
            {nameError && (
              <p className="mt-1 text-xs text-red-600">{nameError}</p>
            )}
          </div>

          {fields.map((field) => {
            const fieldError = errors?.[field.name];
            return (
              <div key={field.name} className="flex flex-col">
                <p className="text-sm text-gray-600 mb-1">{field.label}</p>
                <input
                  type={field.type}
                  value={item?.[field.name] || ""}
                  onChange={handleFieldChange(field.name)}
                  className={inputClasses(field.name)}
                  aria-invalid={fieldError ? "true" : "false"}
                />
                {fieldError && (
                  <p className="mt-1 text-xs text-red-600">{fieldError}</p>
                )}
              </div>
            );
          })}

          {/* Removed Threshold and Location per requirements */}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
