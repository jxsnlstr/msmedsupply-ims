import React, { useEffect, useMemo, useState } from "react";
import CenteredToast from "../components/common/CenteredToast";
import MaterialListPanel from "../components/materials/MaterialListPanel";
import MaterialMasterForm from "../components/materials/MaterialMasterForm";


const STORAGE_KEY = "material_master_records";
const STATUS_OPTIONS = ["Active", "QA Hold", "Blocked", "To Be Extended"];

const MATERIAL_TEMPLATE = {
  materialNumber: "",
  description: "",
  materialGroup: "",
  manufacturer: "",
  baseUnit: "EA",
  storageLocation: "",
  storageBin: "",
  quantityOnHand: "",
  reorderPoint: "",
  reorderQuantity: "",
  procurementType: "External",
  supplier: "",
  standardCost: "",
  currency: "USD",
  lastReceivedDate: "",
  lastIssuedDate: "",
  status: "Active",
  notes: "",
  createdBy: "Materials",
  createdOn: "",
  lastReviewed: "",
};

const DEFAULT_MATERIALS = [
  {
    materialNumber: "MAT-0001",
    description: "Sterile Saline 0.9% 500mL",
    materialGroup: "IV Solutions",
    manufacturer: "Baxter",
    baseUnit: "EA",
    storageLocation: "INF-01",
    storageBin: "A2-14",
    quantityOnHand: "540",
    reorderPoint: "360",
    reorderQuantity: "180",
    procurementType: "External",
    supplier: "Baxter Healthcare",
    standardCost: "3.75",
    currency: "USD",
    lastReceivedDate: "2025-02-01",
    lastIssuedDate: "2025-02-12",
    status: "Active",
    notes: "Primary infusion therapy solution.",
    createdBy: "J. Laster",
    createdOn: "2024-07-12T10:00:00.000Z",
    lastReviewed: "2025-02-15",
  },
  {
    materialNumber: "MAT-0002",
    description: "Nitrile Surgical Gloves Size M",
    materialGroup: "Surgical Supplies",
    manufacturer: "ChemPro",
    baseUnit: "BOX",
    storageLocation: "SUR-01",
    storageBin: "B3-08",
    quantityOnHand: "220",
    reorderPoint: "150",
    reorderQuantity: "100",
    procurementType: "External",
    supplier: "Cardinal Health",
    standardCost: "14.25",
    currency: "USD",
    lastReceivedDate: "2025-01-29",
    lastIssuedDate: "2025-02-10",
    status: "Active",
    notes: "Lot traceability maintained through QA module.",
    createdBy: "Materials",
    createdOn: "2024-03-02T09:15:00.000Z",
    lastReviewed: "2025-01-18",
  },
  {
    materialNumber: "MAT-0003",
    description: "Oncology Cold Chain Kit",
    materialGroup: "Cold Chain",
    manufacturer: "CryoMedics",
    baseUnit: "SET",
    storageLocation: "CC-01",
    storageBin: "C1-02",
    quantityOnHand: "18",
    reorderPoint: "24",
    reorderQuantity: "12",
    procurementType: "External",
    supplier: "CryoMedics",
    standardCost: "120.00",
    currency: "USD",
    lastReceivedDate: "2025-01-05",
    lastIssuedDate: "",
    status: "QA Hold",
    notes: "Pending updated stability data before release.",
    createdBy: "Regulatory",
    createdOn: "2024-09-22T14:45:00.000Z",
    lastReviewed: "2025-03-04",
  },
  {
    materialNumber: "MAT-0004",
    description: "Controlled Substance Transport Pack",
    materialGroup: "Controlled Substances",
    manufacturer: "MS Assembly",
    baseUnit: "SET",
    storageLocation: "CS-01",
    storageBin: "Secure-03",
    quantityOnHand: "4",
    reorderPoint: "6",
    reorderQuantity: "4",
    procurementType: "In-House",
    supplier: "MS Assembly",
    standardCost: "85.00",
    currency: "USD",
    lastReceivedDate: "2024-12-04",
    lastIssuedDate: "2025-01-18",
    status: "Blocked",
    notes: "Distribution paused pending DEA update.",
    createdBy: "Security",
    createdOn: "2023-11-05T08:00:00.000Z",
    lastReviewed: "2025-02-11",
  },
  {
    materialNumber: "MAT-0005",
    description: "Community Clinic Starter Kit",
    materialGroup: "Kits",
    manufacturer: "MedGlobal",
    baseUnit: "SET",
    storageLocation: "KIT-01",
    storageBin: "D4-06",
    quantityOnHand: "10",
    reorderPoint: "20",
    reorderQuantity: "10",
    procurementType: "Subcontracting",
    supplier: "MedGlobal",
    standardCost: "240.00",
    currency: "USD",
    lastReceivedDate: "2025-02-06",
    lastIssuedDate: "",
    status: "To Be Extended",
    notes: "Awaiting plant extension for MS01 and MS02.",
    createdBy: "Programs",
    createdOn: "2025-01-12T12:05:00.000Z",
    lastReviewed: "2025-02-20",
  },
];

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
const initialMaterials = loadMaterials();

export default function Products() {
  const [materials, setMaterials] = useState(initialMaterials);
  const [selectedId, setSelectedId] = useState(initialMaterials[0]?.materialNumber ?? null);
  const [draft, setDraft] = useState(() =>
    initialMaterials[0] ? cloneMaterial(initialMaterials[0]) : createNewMaterial(initialMaterials)
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [toastState, setToastState] = useState({ open: false, variant: "success", title: "", message: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    } catch {}
  }, [materials]);

  useEffect(() => {
    if (!selectedId) {
      setDraft(createNewMaterial(materials));
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

  const handleSave = () => {
    const validation = validateMaterial(draft, materials, selectedId);
    if (Object.keys(validation).length) {
      setErrors(validation);
      showToast("error", "Validation", "Fix the highlighted fields to continue.");
      return;
    }

    const payload = {
      ...draft,
      materialNumber: draft.materialNumber.trim().toUpperCase(),
      description: draft.description.trim(),
      lastReviewed: new Date().toISOString().slice(0, 10),
      createdOn: draft.createdOn || new Date().toISOString(),
    };

    if (selectedId) {
      setMaterials((prev) =>
        prev.map((material) => (material.materialNumber === selectedId ? payload : material))
      );
      setSelectedId(payload.materialNumber);
      showToast("success", "Material Updated", `${payload.materialNumber} saved.`);
    } else {
      setMaterials((prev) => [...prev, payload]);
      setSelectedId(payload.materialNumber);
      showToast("success", "Material Created", `${payload.materialNumber} added to the master.`);
    }

    setErrors({});
    setIsDirty(false);
  };

  const handleReset = () => {
    if (selectedId) {
      const existing = materials.find((mat) => mat.materialNumber === selectedId);
      if (existing) {
        setDraft(cloneMaterial(existing));
      }
    } else {
      setDraft(createNewMaterial(materials));
    }
    setErrors({});
    setIsDirty(false);
  };

  const handleNewMaterial = () => {
    setSelectedId(null);
    setDraft(createNewMaterial(materials));
    setErrors({});
    setIsDirty(false);
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const existing = materials.find((mat) => mat.materialNumber === selectedId);
    if (!existing) return;
    const duplicate = {
      ...cloneMaterial(existing),
      materialNumber: generateMaterialNumber(materials),
      description: `${existing.description} Copy`,
      status: "Active",
      createdOn: new Date().toISOString(),
      lastReviewed: new Date().toISOString().slice(0, 10),
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

function loadMaterials() {
  if (typeof window === "undefined") {
    return DEFAULT_MATERIALS;
  }
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_MATERIALS;
}

function cloneMaterial(material) {
  return JSON.parse(JSON.stringify(material));
}

function generateMaterialNumber(records = []) {
  const highest = records.reduce((max, item) => {
    const digits = Number(String(item.materialNumber || "").replace(/\D/g, "") || 0);
    return Math.max(max, digits);
  }, 0);
  const next = highest + 1;
  return `MAT-${String(next).padStart(4, "0")}`;
}

function createNewMaterial(records = []) {
  return {
    ...MATERIAL_TEMPLATE,
    materialNumber: generateMaterialNumber(records),
    createdOn: new Date().toISOString(),
    lastReviewed: new Date().toISOString().slice(0, 10),
  };
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

