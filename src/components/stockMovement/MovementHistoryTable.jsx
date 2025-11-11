import React from "react";

export default function MovementHistoryTable({
  history = [],
  onDownload,
  onRefresh,
}) {
  const headers = [
    "Date/Time",
    "Action",
    "Product ID",
    "Product Name",
    "Category",
    "Batch",
    "Quantity",
    "Unit",
    "User",
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-gray-800">Movement History</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Download PDF
          </button>
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
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
            {history.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={headers.length}>
                  No history yet.
                </td>
              </tr>
            ) : (
              history.map((item, idx) => (
                <tr key={`${item.id}-${item.createdAt || idx}`}>
                  <td className="px-4 py-3 text-gray-800">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{item.action}</td>
                  <td className="px-4 py-3 text-gray-800">{item.id}</td>
                  <td className="px-4 py-3 text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-800">{item.category}</td>
                  <td className="px-4 py-3 text-gray-800">{item.batch}</td>
                  <td className="px-4 py-3 text-gray-800">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-800">{item.unit}</td>
                  <td className="px-4 py-3 text-gray-800">{item.user || ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
