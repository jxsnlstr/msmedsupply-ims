export interface Material {
  materialNumber: string;
  description: string;
  materialGroup: string;
  manufacturer: string;
  baseUnit: string;
  storageLocation: string;
  storageBin: string;
  quantityOnHand: number | string;
  reorderPoint: number | string;
  reorderQuantity: number | string;
  procurementType: string;
  supplier: string;
  standardCost: number | string;
  currency: string;
  lastReceivedDate: string;
  lastIssuedDate: string;
  status: string;
  notes: string;
  createdBy: string;
  createdOn: string;
  lastReviewed: string;
}

export interface StockByLocation {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  threshold: string;
  location: string;
  expiry: string;
  availability: string;
  unit?: string;
  imageUrl?: string;
}

export interface StockEntryMetadata {
  batch: string;
  user: string;
  entryAt: string;
}

export interface StockMovement {
  id: string;
  name: string;
  category: string;
  batch: string;
  quantity: number;
  unit: string;
  action: "Receive" | "Remove" | "Adjust" | "Transfer" | string;
  createdAt: string;
  user?: string;
  location?: string;
  expiry?: string;
  notes?: string;
}

export interface PendingTransfer {
  id: string;
  name: string;
  category: string;
  batch: string;
  price: number | null;
  quantity: number;
  unit: string;
  expiry: string;
  createdAt: string;
  source: string;
  status: string;
  location?: string;
}

export interface Profile {
  id: string;
  email: string;
  role: string;
  displayName: string;
  phone?: string;
  createdAt?: string;
}

export interface LogEntry {
  id: string;
  action: string;
  context?: Record<string, unknown>;
  createdAt: string;
  userId?: string | null;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  displayName: string;
}
