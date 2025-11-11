import React from "react";

export default function PendingTransferTable({
  items = [],
  title = "Ready for Transfer",
  subtitle = "Receiving queue",
  onRefresh,
  refreshLabel = "Refresh",
}) {
  const headers = [
    "Product ID",
    "Product Name",
    "Quantity",
    "Unit",
    "Location",
    "Entered At",
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-md font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {refreshLabel}
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={headers.length}>
                  No items pending transfer. Receiving entries will appear here.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={`${item.id}-${idx}`}>
                  <td className="px-4 py-3 text-gray-800">{item.id}</td>
                  <td className="px-4 py-3 text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-800">{item.quantity ?? ""}</td>
                  <td className="px-4 py-3 text-gray-800">{item.unit ?? ""}</td>
                  <td className="px-4 py-3 text-gray-800">{item.location ?? ""}</td>
                  <td className="px-4 py-3 text-gray-800">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
