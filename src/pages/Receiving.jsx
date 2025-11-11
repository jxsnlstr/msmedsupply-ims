import React, { useEffect, useRef, useState } from "react";
import CenteredToast from "../components/common/CenteredToast";
import ProductModal from "../components/receiving/ProductModal";

export default function Receiving() {
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const toastTimerRef = useRef(null);
  const [toastSubtitle, setToastSubtitle] = useState("Item queued for transfer.");
  const [errorToast, setErrorToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const errorTimerRef = useRef(null);

  const showError = (msg) => {
    try {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    } catch {}
    setErrorMsg(msg || "Something went wrong.");
    setErrorToast(true);
    errorTimerRef.current = setTimeout(() => setErrorToast(false), 2000);
  };

  // Load products from Products tab (localStorage)
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("inventory_products");
        setProducts(raw ? JSON.parse(raw) : []);
      } catch {
        setProducts([]);
      }
    };
    load();
    const onStorage = (e) => {
      if (e.key === "inventory_products") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [receiveItem, setReceiveItem] = useState({
    name: "",
    id: "",
    category: "",
    batch: "",
    price: "",
    quantity: "",
    unit: "",
    expiry: "",
  });

  const createEmptyRemove = () => ({
    name: "",
    id: "",
    category: "",
    batch: "",
    price: "",
    quantity: "",
    unit: "",
  });
  const [removeItem, setRemoveItem] = useState(createEmptyRemove);
  const [removeErrors, setRemoveErrors] = useState({});

  const [showReceiveSuggestions, setShowReceiveSuggestions] = useState(false);
  const [showRemoveSuggestions, setShowRemoveSuggestions] = useState(false);

  const updateReceiveField = (field, value) => {
    setReceiveItem((prev) => ({ ...prev, [field]: value }));
  };

  const updateRemoveField = (field, value) => {
    setRemoveItem((prev) => ({ ...prev, [field]: value }));
    setRemoveErrors((prev) => {
      if (!prev[field] && !(field === "id" && prev.name)) return prev;
      const next = { ...prev };
      delete next[field];
      if (field === "id" && next.name) delete next.name;
      if (field === "name" && next.id) delete next.id;
      return next;
    });
  };

  const handleReceiveNameChange = (value) => {
    setReceiveItem((prev) => ({ ...prev, name: value }));
    setShowReceiveSuggestions(true);
  };

  const handleRemoveNameChange = (value) => {
    setRemoveItem((prev) => ({ ...prev, name: value }));
    setShowRemoveSuggestions(true);
    setRemoveErrors((prev) => {
      if (!prev.name && !prev.id) return prev;
      const { name, id, ...rest } = prev;
      return rest;
    });
  };

  const receiveSuggestions = (products || []).filter(
    (p) => (receiveItem.name || "").trim() && p.name.toLowerCase().includes((receiveItem.name || "").toLowerCase())
  );
  const removeSuggestions = (products || []).filter(
    (p) => (removeItem.name || "").trim() && p.name.toLowerCase().includes((removeItem.name || "").toLowerCase())
  );

  // no image upload in this flow

  const handleSelectReceiveSuggestion = (p) => {
    setReceiveItem((prev) => ({
      ...prev,
      name: p.name || "",
      id: p.id || "",
      category: p.category || "",
      price: p.price != null ? String(p.price) : "",
      // keep quantity as user input
      unit: prev.unit || "",
      expiry: p.expiry || "",
      batch: prev.batch || "",
    }));
    setShowReceiveSuggestions(false);
  };

  const handleSelectRemoveSuggestion = (p) => {
    setRemoveItem((prev) => ({
      ...prev,
      name: p.name || "",
      id: p.id || "",
      category: p.category || "",
      price: p.price != null ? String(p.price) : prev.price || "",
      unit: p.unit || prev.unit || "",
      batch: (() => {
        try {
          const entryRaw = localStorage.getItem("inventory_entry_map");
          const entryMap = entryRaw ? JSON.parse(entryRaw) : {};
          const key = `${p.id}::${p.name}`;
          if (entryMap && entryMap[key] && entryMap[key].batch) {
            return String(entryMap[key].batch);
          }
          return prev.batch || "";
        } catch {
          return prev.batch || "";
        }
      })(),
    }));
    setShowRemoveSuggestions(false);
    setRemoveErrors({});
  };

  const handleSaveReceive = () => {
    // Validate against existing products and required fields
    const name = (receiveItem.name || "").trim();
    const id = (receiveItem.id || "").trim();
    if (!name && !id) {
      showError("Enter product name or ID.");
      return;
    }
    const lower = name.toLowerCase();
    const product = (products || []).find(
      (p) => (id && p.id === id) || (name && (p.name || "").toLowerCase() === lower)
    );
    if (!product) {
      showError("Product not found in Products tab.");
      return;
    }
    const qty = Number(receiveItem.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      showError("Enter a valid quantity greater than 0.");
      return;
    }

    try {
      const payload = {
        id: product.id || receiveItem.id || "",
        name: product.name || receiveItem.name || "",
        category: product.category || receiveItem.category || "",
        batch: receiveItem.batch || "",
        price: receiveItem.price ? Number(receiveItem.price) : (product.price ?? null),
        quantity: qty,
        unit: receiveItem.unit || "",
        expiry: receiveItem.expiry || product.expiry || "",
        createdAt: new Date().toISOString(),
        source: "receiving",
        status: "pending_transfer",
      };
      const raw = localStorage.getItem("stock_to_transfer");
      const list = raw ? JSON.parse(raw) : [];
      list.push(payload);
      localStorage.setItem("stock_to_transfer", JSON.stringify(list));

      // Append to movement history
      try {
        const historyRaw = localStorage.getItem("stock_movement_history");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        history.push({
          action: "Receive",
          createdAt: payload.createdAt,
          id: payload.id,
          name: payload.name,
          category: payload.category,
          batch: payload.batch,
          quantity: payload.quantity,
          unit: payload.unit,
          expiry: payload.expiry || "",
          user: "System",
        });
        localStorage.setItem("stock_movement_history", JSON.stringify(history));
      } catch {}
    } catch {}
    setShowReceiveModal(false);
    // Show professional success toast in center of screen
    try {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    } catch {}
    setToastSubtitle("Item queued for transfer.");
    setSavedToast(true);
    toastTimerRef.current = setTimeout(() => setSavedToast(false), 2000);
    setReceiveItem({
      name: "",
      id: "",
      category: "",
      batch: "",
      price: "",
      quantity: "",
      unit: "",
      expiry: "",
    });
  };

  const handleSaveRemove = () => {
    const errors = {};
    const name = (removeItem.name || "").trim();
    const id = (removeItem.id || "").trim();

    if (!name && !id) {
      errors.name = "Enter product name or ID.";
      errors.id = "Enter product name or ID.";
    }

    const lower = name.toLowerCase();
    const prodIndex = (products || []).findIndex(
      (p) => (id && p.id === id) || (name && (p.name || "").toLowerCase() === lower)
    );
    const product = prodIndex !== -1 ? products[prodIndex] : null;
    if (!product && Object.keys(errors).length === 0) {
      errors.name = "Product not found in Inventory.";
      errors.id = "Product not found in Inventory.";
    }

    if (product) {
      try {
        const entryRaw = localStorage.getItem("inventory_entry_map");
        const entryMap = entryRaw ? JSON.parse(entryRaw) : {};
        const key = `${product.id}::${product.name}`;
        const meta = entryMap && entryMap[key];
        const expectedBatch = (meta && meta.batch) ? String(meta.batch).trim() : "";
        const inputBatch = String(removeItem.batch || "").trim();
        if (!inputBatch) {
          errors.batch = "Enter batch to remove.";
        } else if (expectedBatch && expectedBatch !== inputBatch) {
          errors.batch = `Batch must match inventory record (${expectedBatch}).`;
        }
      } catch {
        const inputBatch = String(removeItem.batch || "").trim();
        if (!inputBatch) {
          errors.batch = "Enter batch to remove.";
        }
      }
    }

    const qty = Number(removeItem.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      errors.quantity = "Enter a quantity greater than 0.";
    } else if (product && Number(product.quantity ?? 0) < qty) {
      errors.quantity = `Only ${product.quantity} available in inventory.`;
    }

    if (Object.keys(errors).length > 0) {
      setRemoveErrors(errors);
      const firstMessage = Object.values(errors)[0];
      showError(firstMessage);
      return;
    }

    setRemoveErrors({});

    // Persist removal
    try {
      const newQty = Math.max(0, Number(product.quantity || 0) - qty);
      let nextProducts = [...products];
      if (newQty === 0) {
        nextProducts = nextProducts.filter((_, index) => index !== prodIndex);
        try {
          const entryRaw = localStorage.getItem("inventory_entry_map");
          const entryMap = entryRaw ? JSON.parse(entryRaw) : {};
          const key = `${product.id}::${product.name}`;
          if (entryMap && entryMap[key]) {
            delete entryMap[key];
            localStorage.setItem("inventory_entry_map", JSON.stringify(entryMap));
          }
        } catch {}
      } else {
        const parts = String(product.threshold || "").trim().split(" ");
        const tVal = Number(parts.shift() || 0);
        const availability = newQty <= 0 ? "Out of Stock" : newQty < tVal ? "Low Stock" : "In Stock";
        nextProducts[prodIndex] = { ...product, quantity: newQty, availability };
      }
      localStorage.setItem("inventory_products", JSON.stringify(nextProducts));
      setProducts(nextProducts);
    } catch {}

    try {
      const historyRaw = localStorage.getItem("stock_movement_history");
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.push({
        action: "Remove",
        createdAt: new Date().toISOString(),
        id: product.id,
        name: product.name,
        category: product.category || "",
        batch: removeItem.batch || "",
        quantity: qty,
        unit: removeItem.unit || "",
        expiry: product.expiry || "",
        user: "System",
      });
      localStorage.setItem("stock_movement_history", JSON.stringify(history));
    } catch {}

    setShowRemoveModal(false);
    try {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    } catch {}
    setToastSubtitle("Goods successfully removed.");
    setSavedToast(true);
    toastTimerRef.current = setTimeout(() => setSavedToast(false), 2000);
    setRemoveItem(createEmptyRemove());
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Receiving</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReceiveModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Receive Goods
            </button>
            <button
              onClick={() => setShowRemoveModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Remove Goods
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600">Record goods received and removals.</p>
      </div>

      <ProductModal
        isOpen={showReceiveModal}
        title="Receive Goods"
        item={receiveItem}
        onFieldChange={updateReceiveField}
        onNameChange={handleReceiveNameChange}
        suggestions={receiveSuggestions}
        showSuggestions={showReceiveSuggestions}
        onSelectSuggestion={handleSelectReceiveSuggestion}
        onClose={() => setShowReceiveModal(false)}
        onSubmit={handleSaveReceive}
      />

      <ProductModal
        isOpen={showRemoveModal}
        title="Remove Goods"
        item={removeItem}
        onFieldChange={updateRemoveField}
        onNameChange={handleRemoveNameChange}
        suggestions={removeSuggestions}
        showSuggestions={showRemoveSuggestions}
        onSelectSuggestion={handleSelectRemoveSuggestion}
        onClose={() => {
          setShowRemoveModal(false);
          setRemoveErrors({});
          setRemoveItem(createEmptyRemove());
        }}
        onSubmit={handleSaveRemove}
        primaryActionLabel="Remove"
        fields={[
          { name: "id", label: "Product ID", type: "text" },
          { name: "category", label: "Category", type: "text" },
          { name: "batch", label: "Batch", type: "text" },
          { name: "price", label: "Buying Price", type: "number" },
          { name: "quantity", label: "Quantity", type: "number" },
          { name: "unit", label: "Unit", type: "text" },
        ]}
        errors={removeErrors}
      />

      <CenteredToast
        open={savedToast}
        variant="success"
        title="Saved"
        message={toastSubtitle}
        onClose={() => setSavedToast(false)}
      />

      <CenteredToast
        open={errorToast}
        variant="error"
        title="Error"
        message={errorMsg}
        onClose={() => setErrorToast(false)}
      />
    </div>
  );
}

