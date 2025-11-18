import type {
  LogEntry,
  Material,
  PendingTransfer,
  Profile,
  StockByLocation,
  StockEntryMetadata,
  StockMovement,
} from "../types/models";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";

const MATERIALS_STORAGE_KEY = "material_master_records";
const STOCK_STORAGE_KEY = "inventory_products";
const ENTRY_STORAGE_KEY = "inventory_entry_map";
const PENDING_TRANSFER_KEY = "stock_to_transfer";
const MOVEMENT_STORAGE_KEY = "stock_movement_history";
const PROFILES_STORAGE_KEY = "ims_profiles";
const LOGS_STORAGE_KEY = "ims_logs";

const MATERIAL_TEMPLATE: Material = {
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

const DEFAULT_MATERIALS: Material[] = [
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
    description: "Sterile Sutures 4-0, Multipack",
    materialGroup: "Surgical Supplies",
    manufacturer: "Ethilon",
    baseUnit: "BOX",
    storageLocation: "SUR-02",
    storageBin: "B1-03",
    quantityOnHand: "180",
    reorderPoint: "120",
    reorderQuantity: "60",
    procurementType: "External",
    supplier: "Johnson & Johnson",
    standardCost: "32.00",
    currency: "USD",
    lastReceivedDate: "2025-02-08",
    lastIssuedDate: "2025-02-20",
    status: "Active",
    notes: "QA released lot.",
    createdBy: "Surgery",
    createdOn: "2024-02-20T11:30:00.000Z",
    lastReviewed: "2025-01-05",
  },
];

const DEFAULT_STOCK: StockByLocation[] = [
  {
    id: "P001",
    name: "Maggi",
    category: "Food",
    price: 4.3,
    quantity: 43,
    threshold: "12 Packs",
    location: "",
    expiry: "2025-11-12",
    availability: "In Stock",
  },
  {
    id: "P002",
    name: "Bru",
    category: "Beverages",
    price: 2.57,
    quantity: 22,
    threshold: "12 Packs",
    location: "",
    expiry: "2025-12-21",
    availability: "Out of Stock",
  },
  {
    id: "P003",
    name: "Red Bull",
    category: "Beverages",
    price: 4.05,
    quantity: 36,
    threshold: "9 Packs",
    location: "",
    expiry: "2025-05-12",
    availability: "In Stock",
  },
  {
    id: "P004",
    name: "Bourn Vita",
    category: "Health",
    price: 5.02,
    quantity: 14,
    threshold: "6 Packs",
    location: "",
    expiry: "2025-08-12",
    availability: "Out of Stock",
  },
  {
    id: "P005",
    name: "Horlicks",
    category: "Health",
    price: 5.3,
    quantity: 5,
    threshold: "5 Packs",
    location: "",
    expiry: "2025-09-01",
    availability: "In Stock",
  },
  {
    id: "P006",
    name: "Harpic",
    category: "Cleaning",
    price: 6.05,
    quantity: 10,
    threshold: "5 Packs",
    location: "",
    expiry: "2025-09-01",
    availability: "In Stock",
  },
  {
    id: "P007",
    name: "Ariel",
    category: "Cleaning",
    price: 4.08,
    quantity: 23,
    threshold: "7 Packs",
    location: "",
    expiry: "2025-12-15",
    availability: "Out of Stock",
  },
  {
    id: "P008",
    name: "Scotch Brite",
    category: "Cleaning",
    price: 3.59,
    quantity: 43,
    threshold: "8 Packs",
    location: "",
    expiry: "2025-06-06",
    availability: "In Stock",
  },
  {
    id: "P009",
    name: "Coca Cola",
    category: "Beverages",
    price: 2.05,
    quantity: 41,
    threshold: "10 Packs",
    location: "",
    expiry: "2025-11-11",
    availability: "Low Stock",
  },
];

const DEFAULT_PROFILES: Profile[] = [
  {
    id: "profile-admin",
    email: "admin@msmedsupply.com",
    role: "Administrator",
    displayName: "J. Laster",
    phone: "+1-555-0100",
    createdAt: "2024-01-01T12:00:00.000Z",
  },
  {
    id: "profile-warehouse",
    email: "warehouse@msmedsupply.com",
    role: "Warehouse Lead",
    displayName: "Warehouse Ops",
    createdAt: "2024-04-15T16:00:00.000Z",
  },
];

let materialsCache: Material[] = loadArray(MATERIALS_STORAGE_KEY, DEFAULT_MATERIALS);
let stockCache: StockByLocation[] = loadArray(STOCK_STORAGE_KEY, DEFAULT_STOCK);
let entryCache: Record<string, StockEntryMetadata> = loadRecord(
  ENTRY_STORAGE_KEY,
  buildEntryMap(stockCache)
);
let pendingTransfers: PendingTransfer[] = loadArray(PENDING_TRANSFER_KEY, []);
let movementHistory: StockMovement[] = loadArray(MOVEMENT_STORAGE_KEY, []);
let profileCache: Profile[] = loadArray(PROFILES_STORAGE_KEY, DEFAULT_PROFILES);
let logCache: LogEntry[] = loadArray(LOGS_STORAGE_KEY, []);

syncEntryMetadata();

export async function getMaterials(): Promise<Material[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient().from("materials").select("*").order("description");
      if (error) throw error;
      if (data) {
        materialsCache = data as Material[];
        persistArray(MATERIALS_STORAGE_KEY, materialsCache);
      }
    } catch (error) {
      console.warn("Supabase materials fetch failed. Falling back to local cache.", error);
    }
  }

  return cloneArray(materialsCache);
}

export function createMaterialDraft(source?: Partial<Material>): Material {
  const base: Material = {
    ...MATERIAL_TEMPLATE,
    materialNumber: generateMaterialNumber(),
    createdOn: new Date().toISOString(),
    lastReviewed: new Date().toISOString().slice(0, 10),
  };
  return { ...base, ...source };
}

export async function upsertMaterial(material: Material): Promise<Material> {
  const record: Material = {
    ...createMaterialDraft(),
    ...material,
    materialNumber: material.materialNumber || generateMaterialNumber(),
    createdOn: material.createdOn || new Date().toISOString(),
    lastReviewed: material.lastReviewed || new Date().toISOString().slice(0, 10),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient()
        .from("materials")
        .upsert(record, { onConflict: "materialNumber" })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        await logAction("material.upsert", { materialNumber: record.materialNumber });
        return data as Material;
      }
    } catch (error) {
      console.warn("Supabase material upsert failed. Falling back to local cache.", error);
    }
  }

  const idx = materialsCache.findIndex((item) => item.materialNumber === record.materialNumber);
  if (idx >= 0) {
    materialsCache[idx] = record;
  } else {
    materialsCache.push(record);
  }
  persistArray(MATERIALS_STORAGE_KEY, materialsCache);
  await logAction("material.upsert", { materialNumber: record.materialNumber });
  return { ...record };
}

export async function deleteMaterial(materialNumber: string): Promise<boolean> {
  let deleted = false;
  if (isSupabaseConfigured) {
    try {
      const { error } = await getSupabaseClient().from("materials").delete().match({ materialNumber });
      if (error) throw error;
      deleted = true;
    } catch (error) {
      console.warn("Supabase material delete failed. Falling back to local cache.", error);
    }
  }

  const idx = materialsCache.findIndex((item) => item.materialNumber === materialNumber);
  if (idx >= 0) {
    materialsCache.splice(idx, 1);
    persistArray(MATERIALS_STORAGE_KEY, materialsCache);
    deleted = true;
  }

  if (deleted) {
    await logAction("material.delete", { materialNumber });
  }

  return deleted;
}

export async function getStockByLocation(): Promise<StockByLocation[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient().from("stock_by_location").select("*");
      if (error) throw error;
      if (data) {
        stockCache = data as StockByLocation[];
        persistArray(STOCK_STORAGE_KEY, stockCache);
        syncEntryMetadata();
      }
    } catch (error) {
      console.warn("Supabase stock fetch failed. Using cached data.", error);
    }
  }

  return cloneArray(stockCache);
}

export async function upsertStockItem(
  item: StockByLocation,
  options: { metadata?: Partial<StockEntryMetadata> } = {}
): Promise<StockByLocation> {
  const normalized: StockByLocation = {
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
    threshold: item.threshold || "0",
    availability: deriveAvailability(Number(item.quantity) || 0, item.threshold),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient()
        .from("stock_by_location")
        .upsert(normalized, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        await ensureEntryMetadata(data as StockByLocation, options.metadata);
        await logAction("stock.upsert", { id: normalized.id });
        return data as StockByLocation;
      }
    } catch (error) {
      console.warn("Supabase stock upsert failed. Using local persistence.", error);
    }
  }

  const idx = stockCache.findIndex((existing) => existing.id === normalized.id);
  if (idx >= 0) {
    stockCache[idx] = normalized;
  } else {
    stockCache.push(normalized);
  }
  persistArray(STOCK_STORAGE_KEY, stockCache);
  await ensureEntryMetadata(normalized, options.metadata);
  await logAction("stock.upsert", { id: normalized.id });
  return { ...normalized };
}

export async function deleteStockItem(id: string): Promise<boolean> {
  let deleted = false;
  if (isSupabaseConfigured) {
    try {
      const { error } = await getSupabaseClient().from("stock_by_location").delete().match({ id });
      if (error) throw error;
      deleted = true;
    } catch (error) {
      console.warn("Supabase stock delete failed. Using local persistence.", error);
    }
  }

  const idx = stockCache.findIndex((entry) => entry.id === id);
  if (idx >= 0) {
    const [removed] = stockCache.splice(idx, 1);
    persistArray(STOCK_STORAGE_KEY, stockCache);
    const key = entryKey(removed);
    delete entryCache[key];
    persistRecord(ENTRY_STORAGE_KEY, entryCache);
    deleted = true;
  }

  if (deleted) {
    await logAction("stock.delete", { id });
  }

  return deleted;
}

export async function getStockEntryMetadata(): Promise<Record<string, StockEntryMetadata>> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient().from("stock_entry_metadata").select("*");
      if (error) throw error;
      if (data) {
        entryCache = (data as Array<Record<string, unknown>>).reduce<Record<string, StockEntryMetadata>>(
          (acc, row) => {
            const key = String(row.entryKey || row.entry_key || "");
            if (!key) return acc;
            acc[key] = normalizeEntryMetadata(row, key);
            return acc;
          },
          {}
        );
        persistRecord(ENTRY_STORAGE_KEY, entryCache);
      }
    } catch (error) {
      console.warn("Supabase entry metadata fetch failed. Using cached data.", error);
    }
  }
  return { ...entryCache };
}

export async function upsertStockEntryMetadata(
  key: string,
  metadata: Partial<StockEntryMetadata>
): Promise<StockEntryMetadata> {
  const current = entryCache[key] || createEntryMetadata();
  const next = {
    ...current,
    ...metadata,
    entryAt: metadata.entryAt || current.entryAt || new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { error } = await getSupabaseClient()
        .from("stock_entry_metadata")
        .upsert({ entryKey: key, ...next }, { onConflict: "entryKey" });
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase entry metadata upsert failed. Falling back to local cache.", error);
    }
  }

  entryCache[key] = next;
  persistRecord(ENTRY_STORAGE_KEY, entryCache);
  return { ...entryCache[key] };
}

export async function deleteStockEntryMetadata(key: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await getSupabaseClient()
        .from("stock_entry_metadata")
        .delete()
        .match({ entryKey: key });
      if (error) throw error;
    } catch (error) {
      console.warn("Supabase entry metadata delete failed. Removing from local cache only.", error);
    }
  }

  if (entryCache[key]) {
    delete entryCache[key];
    persistRecord(ENTRY_STORAGE_KEY, entryCache);
  }
}

export async function getPendingTransfers(): Promise<PendingTransfer[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient()
        .from("pending_transfers")
        .select("*")
        .order("createdAt", { ascending: false });
      if (error) throw error;
      if (data) {
        pendingTransfers = data as PendingTransfer[];
        persistArray(PENDING_TRANSFER_KEY, pendingTransfers);
      }
    } catch (error) {
      console.warn("Supabase pending transfer fetch failed. Using cached data.", error);
    }
  }
  return cloneArray(pendingTransfers).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function queuePendingTransfer(entry: PendingTransfer): Promise<void> {
  const payload: PendingTransfer = {
    ...entry,
    id: entry.id || createId("transfer"),
    createdAt: entry.createdAt || new Date().toISOString(),
    status: entry.status || "pending_transfer",
  };

  if (isSupabaseConfigured) {
    try {
      await getSupabaseClient()
        .from("pending_transfers")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();
    } catch (error) {
      console.warn("Supabase pending transfer upsert failed. Using cached data.", error);
    }
  }

  const existingIndex = pendingTransfers.findIndex((item) => item.id === payload.id);
  if (existingIndex >= 0) {
    pendingTransfers[existingIndex] = payload;
  } else {
    pendingTransfers.push(payload);
  }
  persistArray(PENDING_TRANSFER_KEY, pendingTransfers);
  await logAction("transfer.queue", { id: payload.id, source: payload.source });
}

export async function clearPendingTransfer(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await getSupabaseClient().from("pending_transfers").delete().match({ id });
    } catch (error) {
      console.warn("Supabase pending transfer delete failed. Removing from cache only.", error);
    }
  }

  const idx = pendingTransfers.findIndex((item) => item.id === id);
  if (idx >= 0) {
    pendingTransfers.splice(idx, 1);
    persistArray(PENDING_TRANSFER_KEY, pendingTransfers);
  }
  await logAction("transfer.clear", { id });
}

export async function getStockMovements(): Promise<StockMovement[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient()
        .from("stock_movements")
        .select("*")
        .order("createdAt", { ascending: false });
      if (error) throw error;
      if (data) {
        movementHistory = data as StockMovement[];
        persistArray(MOVEMENT_STORAGE_KEY, movementHistory);
      }
    } catch (error) {
      console.warn("Supabase movement fetch failed. Using cached data.", error);
    }
  }

  return cloneArray(movementHistory).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function recordMovement(movement: StockMovement): Promise<StockMovement> {
  const payload: StockMovement = {
    ...movement,
    id: movement.id || createId("movement"),
    createdAt: movement.createdAt || new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient().from("stock_movements").insert(payload).select().single();
      if (error) throw error;
      if (data) {
        await logAction("movement.record", { id: payload.id, action: payload.action });
        return data as StockMovement;
      }
    } catch (error) {
      console.warn("Supabase movement insert failed. Using local persistence.", error);
    }
  }

  movementHistory.push(payload);
  persistArray(MOVEMENT_STORAGE_KEY, movementHistory);
  await logAction("movement.record", { id: payload.id, action: payload.action });
  return { ...payload };
}

export async function getProfiles(): Promise<Profile[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient().from("profiles").select("*");
      if (error) throw error;
      if (data) {
        profileCache = data as Profile[];
        persistArray(PROFILES_STORAGE_KEY, profileCache);
      }
    } catch (error) {
      console.warn("Supabase profile fetch failed. Using cached data.", error);
    }
  }
  return cloneArray(profileCache);
}

export async function upsertProfile(profile: Profile): Promise<Profile> {
  const payload: Profile = {
    ...profile,
    id: profile.id || createId("profile"),
    createdAt: profile.createdAt || new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient()
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        await logAction("profile.upsert", { id: payload.id });
        return data as Profile;
      }
    } catch (error) {
      console.warn("Supabase profile upsert failed. Using cached data.", error);
    }
  }

  const idx = profileCache.findIndex((item) => item.id === payload.id);
  if (idx >= 0) {
    profileCache[idx] = payload;
  } else {
    profileCache.push(payload);
  }
  persistArray(PROFILES_STORAGE_KEY, profileCache);
  await logAction("profile.upsert", { id: payload.id });
  return { ...payload };
}

export async function getLogs(): Promise<LogEntry[]> {
  return cloneArray(logCache).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function logAction(action: string, context?: Record<string, unknown>): Promise<LogEntry> {
  const entry: LogEntry = {
    id: createId("log"),
    action,
    context,
    createdAt: new Date().toISOString(),
    userId: null,
  };
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getSupabaseClient().from("logs").insert(entry).select().single();
      if (error) throw error;
      if (data) {
        logCache.unshift(data as LogEntry);
        persistArray(LOGS_STORAGE_KEY, logCache);
        console.info(`[IMS LOG] ${action}`, context);
        return data as LogEntry;
      }
    } catch (error) {
      console.warn("Supabase log insert failed. Persisting locally.", error);
    }
  }

  logCache.unshift(entry);
  persistArray(LOGS_STORAGE_KEY, logCache);
  console.info(`[IMS LOG] ${action}`, context);
  return entry;
}

function syncEntryMetadata() {
  stockCache.forEach((item) => {
    ensureEntryMetadata(item).catch(() => {});
  });
}

async function ensureEntryMetadata(
  item: StockByLocation,
  overrides: Partial<StockEntryMetadata> = {}
): Promise<void> {
  const key = entryKey(item);
  const current = entryCache[key] || createEntryMetadata(item);
  await upsertStockEntryMetadata(key, {
    ...current,
    ...overrides,
    entryAt: overrides.entryAt || current.entryAt || new Date().toISOString(),
  });
}

function entryKey(item: StockByLocation) {
  return `${item.id}::${item.name}`;
}

function createEntryMetadata(item?: StockByLocation): StockEntryMetadata {
  const suffix = (item?.id || "0000").replace(/[^A-Za-z0-9]/g, "").slice(-6);
  return {
    batch: `BATCH-${suffix || "000000"}`,
    user: "System",
    entryAt: new Date().toISOString(),
  };
}

function normalizeEntryMetadata(row: Record<string, unknown>, key: string): StockEntryMetadata {
  const fallback = entryCache[key] || createEntryMetadata();
  return {
    batch: String(row.batch ?? fallback.batch ?? ""),
    user: String(row.user ?? fallback.user ?? "System"),
    entryAt: String(row.entryAt ?? row.entry_at ?? fallback.entryAt ?? new Date().toISOString()),
  };
}

function deriveAvailability(quantity: number, threshold: string | undefined) {
  const thresholdValue = Number(String(threshold || "").split(" ")[0]) || 0;
  if (quantity <= 0) return "Out of Stock";
  if (thresholdValue && quantity < thresholdValue) return "Low Stock";
  return "In Stock";
}

function generateMaterialNumber(): string {
  const highest = materialsCache.reduce((max, item) => {
    const digits = Number(String(item.materialNumber || "").replace(/\D/g, "")) || 0;
    return Math.max(max, digits);
  }, 0);
  const next = highest + 1;
  return `MAT-${String(next).padStart(4, "0")}`;
}

function buildEntryMap(items: StockByLocation[]) {
  return items.reduce<Record<string, StockEntryMetadata>>((acc, item) => {
    acc[entryKey(item)] = createEntryMetadata(item);
    return acc;
  }, {});
}

function cloneArray<T>(arr: T[]): T[] {
  return arr.map((item) => ({ ...(item as Record<string, unknown>) })) as T[];
}

function loadArray<T>(key: string, fallback: T[]): T[] {
  const stored = readFromStorage(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed as T[];
      }
    } catch {
      // ignore parse failures
    }
  }
  persistArray(key, fallback);
  return cloneArray(fallback);
}

function loadRecord<T>(key: string, fallback: T): T {
  const stored = readFromStorage(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // ignore parse failures
    }
  }
  persistRecord(key, fallback);
  return { ...(fallback as Record<string, unknown>) } as T;
}

function persistArray(key: string, value: unknown[]) {
  writeToStorage(key, JSON.stringify(value));
}

function persistRecord(key: string, value: Record<string, unknown>) {
  writeToStorage(key, JSON.stringify(value));
}

function readFromStorage(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeToStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage write errors
  }
}

function createId(prefix: string) {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef?.randomUUID) {
    return `${prefix}_${cryptoRef.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type { Material, StockByLocation, StockMovement, Profile, LogEntry, PendingTransfer };
