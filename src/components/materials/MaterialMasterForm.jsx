import React from "react";

export default function MaterialMasterForm({
  draft,
  errors,
  onFieldChange,
  onSave,
  onReset,
  onDuplicate,
  disableDuplicate,
  isDirty,
  isNewRecord,
  statusOptions,
  categoryOptions,
  unitOptions,
  procurementTypes,
}) {
  return (
    <div className="space-y-5">
      <MaterialOverviewCard
        draft={draft}
        isNewRecord={isNewRecord}
        isDirty={isDirty}
        disableDuplicate={disableDuplicate}
        onDuplicate={onDuplicate}
        onReset={onReset}
        onSave={onSave}
        onFieldChange={onFieldChange}
        statusOptions={statusOptions}
      />

      <IdentificationSection
        draft={draft}
        errors={errors}
        onFieldChange={onFieldChange}
        categoryOptions={categoryOptions}
        unitOptions={unitOptions}
      />

      <StorageInventorySection draft={draft} errors={errors} onFieldChange={onFieldChange} />

      <ProcurementCostSection
        draft={draft}
        errors={errors}
        onFieldChange={onFieldChange}
        procurementTypes={procurementTypes}
      />

      <LifecycleDatesSection draft={draft} onFieldChange={onFieldChange} />

      <NotesAuditSection draft={draft} onFieldChange={onFieldChange} />
    </div>
  );
}

function MaterialOverviewCard({
  draft,
  isNewRecord,
  isDirty,
  disableDuplicate,
  onDuplicate,
  onReset,
  onSave,
  onFieldChange,
  statusOptions,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {isNewRecord ? "New Material" : "Material"}
          </p>
          <h2 className="text-2xl font-semibold text-gray-900">{draft.description || "Untitled material"}</h2>
          <p className="text-sm text-gray-500">Material Number: {draft.materialNumber || "Pending"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <MaterialStatusBadge status={draft.status} />
            {draft.materialGroup && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-semibold text-gray-700">
                {draft.materialGroup}
              </span>
            )}
            {draft.baseUnit && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-semibold text-gray-700">
                Base {draft.baseUnit}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            disabled={disableDuplicate}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty && !isNewRecord}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!isDirty}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-1">
        <Field label="Status">
          <select
            value={draft.status}
            onChange={(e) => onFieldChange("status", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </section>
  );
}

function IdentificationSection({ draft, errors, onFieldChange, categoryOptions, unitOptions }) {
  return (
    <SectionCard title="Identification" description="Material master basics for IMS users.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Material ID / SKU" error={errors.materialNumber}>
          <input
            type="text"
            value={draft.materialNumber}
            onChange={(e) => onFieldChange("materialNumber", e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="MAT-0006"
          />
        </Field>
        <Field label="Material Name" error={errors.description}>
          <input
            type="text"
            value={draft.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe the material"
          />
        </Field>
        <Field label="Category" error={errors.materialGroup}>
          <select
            value={draft.materialGroup}
            onChange={(e) => onFieldChange("materialGroup", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {categoryOptions.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Manufacturer" error={errors.manufacturer}>
          <input
            type="text"
            value={draft.manufacturer}
            onChange={(e) => onFieldChange("manufacturer", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Who makes this material?"
          />
        </Field>
        <Field label="Base Unit" error={errors.baseUnit}>
          <select
            value={draft.baseUnit}
            onChange={(e) => onFieldChange("baseUnit", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </SectionCard>
  );
}

function StorageInventorySection({ draft, errors, onFieldChange }) {
  return (
    <SectionCard title="Storage & Inventory" description="Where the item lives and how much is on hand.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Warehouse Location" error={errors.storageLocation}>
          <input
            type="text"
            value={draft.storageLocation}
            onChange={(e) => onFieldChange("storageLocation", e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="INF-01"
          />
        </Field>
        <Field label="Storage Bin / Shelf">
          <input
            type="text"
            value={draft.storageBin}
            onChange={(e) => onFieldChange("storageBin", e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="A2-14"
          />
        </Field>
        <Field label="Quantity On Hand">
          <input
            type="number"
            min="0"
            value={draft.quantityOnHand}
            onChange={(e) => onFieldChange("quantityOnHand", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </Field>
        <Field label="Reorder Point">
          <input
            type="number"
            min="0"
            value={draft.reorderPoint}
            onChange={(e) => onFieldChange("reorderPoint", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </Field>
        <Field label="Reorder Quantity">
          <input
            type="number"
            min="0"
            value={draft.reorderQuantity}
            onChange={(e) => onFieldChange("reorderQuantity", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </Field>
      </div>
    </SectionCard>
  );
}

function ProcurementCostSection({ draft, errors, onFieldChange, procurementTypes }) {
  return (
    <SectionCard title="Procurement & Cost" description="How this material is sourced and valued.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Procurement Type" error={errors.procurementType}>
          <select
            value={draft.procurementType}
            onChange={(e) => onFieldChange("procurementType", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {procurementTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred Vendor" error={errors.supplier}>
          <input
            type="text"
            value={draft.supplier}
            onChange={(e) => onFieldChange("supplier", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Vendor name"
          />
        </Field>
        <Field label="Standard Cost (USD)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.standardCost}
            onChange={(e) => onFieldChange("standardCost", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0.00"
          />
        </Field>
      </div>
    </SectionCard>
  );
}

function LifecycleDatesSection({ draft, onFieldChange }) {
  return (
    <SectionCard title="Lifecycle Dates" description="Track the most recent receiving and issuing events.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Last Received Date">
          <input
            type="date"
            value={draft.lastReceivedDate}
            onChange={(e) => onFieldChange("lastReceivedDate", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </Field>
        <Field label="Last Issued Date">
          <input
            type="date"
            value={draft.lastIssuedDate}
            onChange={(e) => onFieldChange("lastIssuedDate", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </Field>
      </div>
    </SectionCard>
  );
}

function NotesAuditSection({ draft, onFieldChange }) {
  return (
    <SectionCard title="Notes & Audit" description="Free-form context plus system generated audit info.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Internal Notes">
          <textarea
            rows="4"
            value={draft.notes || ""}
            onChange={(e) => onFieldChange("notes", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
          <div>
            <p className="text-xs uppercase text-gray-500">Created By</p>
            <p className="font-semibold text-gray-900">{draft.createdBy || "?"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Created On</p>
            <p className="font-semibold text-gray-900">{formatDate(draft.createdOn)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Last Reviewed</p>
            <p className="font-semibold text-gray-900">{formatDate(draft.lastReviewed)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Procurement Type</p>
            <p className="font-semibold text-gray-900">{draft.procurementType || "?"}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-900">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

export function MaterialStatusBadge({ status }) {
  const colors = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "QA Hold": "bg-amber-50 text-amber-700 border-amber-200",
    Blocked: "bg-rose-50 text-rose-700 border-rose-200",
    "To Be Extended": "bg-blue-50 text-blue-700 border-blue-200",
  };
  const colorClass = colors[status] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${colorClass}`}>
      {status || "Unknown"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
