import React, { useCallback, useEffect, useMemo, useState } from "react";
import CenteredToast from "../components/common/CenteredToast";
import MaterialListPanel from "../components/materials/MaterialListPanel";
import MaterialMasterForm from "../components/materials/MaterialMasterForm";
import { createMaterialDraft, getMaterials, upsertMaterial } from "../api/imsApi";

const STATUS_OPTIONS = ["Active", "QA Hold", "Blocked", "To Be Extended"];

const STATUS_FILTERS = ["All", ...STATUS_OPTIONS];

const CATEGORY_OPTIONS = [
  "IV Solutions",
  "Surgical Supplies",
  "Cold Chain",
  "Controlled Substances",
  "Kits",
  "Durable Equipment",
  "Pharmacy",
];

const UNIT_OPTIONS = ["EA", "BOX", "CS", "SET"];
const PROCUREMENT_TYPES = ["External", "In-House", "Consignment", "Subcontracting"];

const REQUIRED_MESSAGES = {
  materialNumber: "Material ID / SKU is required.",
  description: "Material name is required.",
  materialGroup: "Category is required.",
  manufacturer: "Manufacturer is required.",
  baseUnit: "Base unit is required.",
  storageLocation: "Warehouse location is required.",
  procurementType: "Procurement type is required.",
  supplier: "Preferred vendor is required.",
};

export default function Products() {
  const [materials, setMaterials] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(() => createMaterialDraft());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [toastState, setToastState] = useState({ open: false, variant: "success", title: "", message: "" });

  const fetchMaterials = useCallback(
    async (preferredId = null) => {
      try {
        const data = await getMaterials();
        setMaterials(data);
        if (preferredId) {
          setSelectedId(preferredId);
          return;
        }
        if (data.length === 0) {
          setSelectedId(null);
          return;
        }
        setSelectedId((prev) => {
          if (prev && data.some((material) => material.materialNumber === prev)) {
            return prev;
          }
          return data[0].materialNumber;
        });
      } catch (error) {
        console.error("Failed to load materials", error);
      }
    },
    []
  );

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    if (!selectedId) {
      setDraft(createMaterialDraft());
      setErrors({});
      setIsDirty(false);
      return;
    }
    const existing = materials.find((mat) => mat.materialNumber === selectedId);
    if (existing) {
      setDraft(cloneMaterial(existing));
      setErrors({});
      setIsDirty(false);
    } else if (materials.length) {
      setSelectedId(materials[0].materialNumber);
    } else {
      setSelectedId(null);
    }
  }, [selectedId, materials]);

  const filteredMaterials = useMemo(() => {
    const term = search.trim().toLowerCase();
    return materials.filter((material) => {
      const matchesTerm = term
        ? material.materialNumber.toLowerCase().includes(term) ||
          material.description.toLowerCase().includes(term) ||
          (material.materialGroup || "").toLowerCase().includes(term)
        : true;
      const matchesStatus = statusFilter === "All" ? true : material.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [materials, search, statusFilter]);

  const metrics = useMemo(() => getMetrics(materials), [materials]);
  const statusCounts = useMemo(() => getStatusCounts(materials), [materials]);
  const isNewRecord = !selectedId;

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (!isDirty) setIsDirty(true);
  };

  const showToast = (variant, title, message) => {
    setToastState({ open: true, variant, title, message });
  };

  const handleSave = async () => {
    const validation = validateMaterial(draft, materials, selectedId);
    if (Object.keys(validation).length) {
      setErrors(validation);
      showToast("error", "Validation", "Fix the highlighted fields to continue.");
      return;
    }

    const payload = {
      ...draft,
      materialNumber: (draft.materialNumber || "").trim().toUpperCase(),
      description: (draft.description || "").trim(),
      lastReviewed: new Date().toISOString().slice(0, 10),
      createdOn: draft.createdOn || new Date().toISOString(),
    };

    const wasUpdate = Boolean(selectedId);
    try {
      const saved = await upsertMaterial(payload);
      await fetchMaterials(saved.materialNumber);
      setDraft(cloneMaterial(saved));
      setErrors({});
      setIsDirty(false);
      showToast(
        "success",
        wasUpdate ? "Material Updated" : "Material Created",
        `${saved.materialNumber} saved.`
      );
    } catch (error) {
      console.error("Failed to save material", error);
      showToast("error", "Save Failed", error.message || "Unable to save material right now.");
    }
  };

  const handleReset = () => {
    if (selectedId) {
      const existing = materials.find((mat) => mat.materialNumber === selectedId);
      if (existing) {
        setDraft(cloneMaterial(existing));
      }
    } else {
      setDraft(createMaterialDraft());
    }
    setErrors({});
    setIsDirty(false);
  };

  const handleNewMaterial = () => {
    setSelectedId(null);
    setDraft(createMaterialDraft());
    setErrors({});
    setIsDirty(false);
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const existing = materials.find((mat) => mat.materialNumber === selectedId);
    if (!existing) return;
    const baseDraft = createMaterialDraft();
    const duplicate = {
      ...cloneMaterial(existing),
      materialNumber: baseDraft.materialNumber,
      description: `${existing.description} Copy`,
      status: "Active",
      createdOn: baseDraft.createdOn,
      lastReviewed: baseDraft.lastReviewed,
    };
    setSelectedId(null);
    setDraft(duplicate);
    setErrors({});
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      <MaterialSummary metrics={metrics} />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <MaterialListPanel
          materials={filteredMaterials}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onAddNew={handleNewMaterial}
          statusCounts={statusCounts}
          statusFilters={STATUS_FILTERS}
        />

        <MaterialMasterForm
          draft={draft}
          errors={errors}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          onReset={handleReset}
          onDuplicate={handleDuplicate}
          disableDuplicate={!selectedId}
          isDirty={isDirty}
          isNewRecord={isNewRecord}
          statusOptions={STATUS_OPTIONS}
          categoryOptions={CATEGORY_OPTIONS}
          unitOptions={UNIT_OPTIONS}
          procurementTypes={PROCUREMENT_TYPES}
        />
      </div>

      <CenteredToast
        open={toastState.open}
        variant={toastState.variant}
        title={toastState.title}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
function MaterialSummary({ metrics }) {
  const cards = [
    { label: "Total Materials", value: metrics.total, subtitle: `${metrics.active} active records`, accent: "text-blue-600" },
    { label: "Units On Hand", value: metrics.onHand.toLocaleString(), subtitle: "Across all locations", accent: "text-emerald-600" },
    { label: "Below Reorder", value: metrics.belowReorder, subtitle: "Need replenishment", accent: "text-amber-600" },
    { label: "Avg Std Cost", value: formatCurrency(metrics.avgCost || 0, "USD"), subtitle: "Weighted average", accent: "text-gray-900" },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
          <p className={`mt-2 text-3xl font-semibold ${card.accent}`}>{card.value}</p>
          <p className="text-sm text-gray-500">{card.subtitle}</p>
        </div>
      ))}
    </section>
  );
}

function cloneMaterial(material) {
  return JSON.parse(JSON.stringify(material));
}

function validateMaterial(material, records, currentId) {
  const errors = {};
  Object.entries(REQUIRED_MESSAGES).forEach(([field, message]) => {
    const value = (material[field] ?? "").toString().trim();
    if (!value) {
      errors[field] = message;
    }
  });

  const normalizedNumber = (material.materialNumber || "").trim().toUpperCase();
  if (normalizedNumber) {
    const duplicate = records.some(
      (item) =>
        item.materialNumber.trim().toUpperCase() === normalizedNumber &&
        item.materialNumber !== currentId
    );
    if (duplicate) {
      errors.materialNumber = "Material number already exists.";
    }
  }

  return errors;
}

function getMetrics(records) {
  const totals = records.reduce(
    (acc, material) => {
      const qty = Number(material.quantityOnHand || 0);
      const reorder = Number(material.reorderPoint || 0);
      const cost = Number(material.standardCost || 0);

      if (Number.isFinite(qty)) acc.onHand += qty;
      if (Number.isFinite(reorder) && Number.isFinite(qty) && reorder > 0 && qty <= reorder) {
        acc.belowReorder += 1;
      }
      if (material.status === "Active") acc.active += 1;
      if (Number.isFinite(cost)) {
        acc.costSum += cost;
        acc.costCount += 1;
      }

      return acc;
    },
    { onHand: 0, belowReorder: 0, costSum: 0, costCount: 0, active: 0 }
  );

  const avgCost = totals.costCount ? totals.costSum / totals.costCount : 0;

  return {
    total: records.length,
    active: totals.active,
    onHand: totals.onHand,
    belowReorder: totals.belowReorder,
    avgCost,
  };
}

function getStatusCounts(records) {
  return records.reduce((acc, material) => {
    const key = material.status || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function formatCurrency(value, currency = "USD") {
  if (value === undefined || value === null || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

