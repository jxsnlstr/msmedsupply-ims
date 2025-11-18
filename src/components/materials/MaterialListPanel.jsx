import React from "react";
import { MaterialStatusBadge } from "./MaterialMasterForm";

export default function MaterialListPanel({
  materials,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onAddNew,
  statusCounts,
  statusFilters,
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search material or category"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={onAddNew}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          New
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const isActive = statusFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onStatusChange(filter)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                isActive ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {filter === "All" ? "All" : filter}
              {filter !== "All" && <span className="ml-1 text-gray-400">({statusCounts[filter] || 0})</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 -mx-5 flex-1 overflow-y-auto">
        {materials.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">No materials match the selected filters.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {materials.map((material) => {
              const isSelected = material.materialNumber === selectedId;
              const belowReorder = isBelowReorder(material);
              const qty = Number(material.quantityOnHand || 0).toLocaleString();
              return (
                <li key={material.materialNumber}>
                  <button
                    type="button"
                    onClick={() => onSelect(material.materialNumber)}
                    className={`w-full px-5 py-4 text-left transition ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {material.materialNumber}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">{material.description}</p>
                        <p className="text-xs text-gray-500">{material.materialGroup || "Uncategorized"}</p>
                      </div>
                      <MaterialStatusBadge status={material.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                      <span>{material.manufacturer || "Manufacturer TBD"}</span>
                      <span>{material.supplier || "Vendor TBD"}</span>
                      <span>
                        {qty} {material.baseUnit || ""}
                      </span>
                    </div>
                    {belowReorder && (
                      <div className="mt-2">
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          At / below reorder
                        </span>
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function isBelowReorder(material) {
  const qty = Number(material.quantityOnHand || 0);
  const reorder = Number(material.reorderPoint || 0);
  return Number.isFinite(qty) && Number.isFinite(reorder) && reorder > 0 && qty <= reorder;
}
