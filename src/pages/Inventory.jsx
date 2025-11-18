import React, { useCallback, useEffect, useMemo, useState } from "react";
import LogoUrl from "../assets/medsupply.png";
import ClearFilterIcon from "../assets/Clear Filter.png";
import FilterModal from "../components/common/FilterModal";
import EditProductModal from "../components/common/EditProductModal";
import InventoryMetricGrid from "../components/inventory/InventoryMetricGrid";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryAddProductModal from "../components/inventory/InventoryAddProductModal";
import { getStockByLocation, getStockEntryMetadata, upsertStockItem } from "../api/imsApi";

export default function Inventory() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [applyToAll, setApplyToAll] = useState(false);
  const [editNameKey, setEditNameKey] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    id: "",
    category: "",
    quantitySort: "",
    expiry: "",
    availability: "",
  });

  const updateFilterField = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const [products, setProducts] = useState([]);
  const [entryMap, setEntryMap] = useState({});

  const refreshInventory = useCallback(async () => {
    try {
      const [items, metadata] = await Promise.all([getStockByLocation(), getStockEntryMetadata()]);
      setProducts(items);
      setEntryMap(metadata || {});
    } catch (error) {
      console.error("Failed to load inventory data", error);
    }
  }, []);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    id: "",
    category: "",
    price: "",
    quantity: "",
    unit: "",
    expiry: "",
    threshold: "",
    location: "",
    image: null,
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  const updateNewProductField = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameInput = (value) => {
    setNewProduct((prev) => ({ ...prev, name: value }));
    setShowSuggestions(true);
  };

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({ ...prev, image: file }));
    }
  };

  const formatThreshold = (value, unit) => `${value || 0} ${unit || ""}`.trim();

  // Add or merge product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.id || !newProduct.price || !newProduct.quantity) {
      alert("Please fill in all required fields.");
      return;
    }

    const existing = products.find(
      (p) => (p.name || "").toLowerCase() === newProduct.name.toLowerCase()
    );
    const quantityToAdd = parseInt(newProduct.quantity, 10);
    const baseThreshold = formatThreshold(newProduct.threshold, newProduct.unit);

    const availability = (qty, thresholdText) => {
      if (qty <= 0) return "Out of Stock";
      const numericThreshold = Number((thresholdText || "").split(" ")[0]) || 0;
      if (numericThreshold && qty < numericThreshold) return "Low Stock";
      if (!numericThreshold && qty < 10) return "Low Stock";
      return "In Stock";
    };

    const payload = existing
      ? {
          ...existing,
          quantity: Number(existing.quantity || 0) + quantityToAdd,
          availability: availability(
            Number(existing.quantity || 0) + quantityToAdd,
            existing.threshold
          ),
        }
      : {
          id: newProduct.id,
          name: newProduct.name,
          category: newProduct.category || "Uncategorized",
          price: parseFloat(newProduct.price),
          quantity: quantityToAdd,
          threshold: baseThreshold,
          location: newProduct.location || "",
          expiry: newProduct.expiry,
          availability: availability(quantityToAdd, baseThreshold),
        };

    try {
      await upsertStockItem(payload);
      await refreshInventory();
    } catch (error) {
      console.error("Failed to save inventory item", error);
      alert("Unable to save this product right now.");
      return;
    }

    setShowAddModal(false);
    setNewProduct({
      name: "",
      id: "",
      category: "",
      price: "",
      quantity: "",
      unit: "",
      expiry: "",
      threshold: "",
      location: "",
      image: null,
    });
  };

  // Open edit modal with selected product values
  const openEditModal = (index) => {
    const p = products[index];
    if (!p) return;
    const parts = (p.threshold || "").split(" ");
    const thVal = parts.shift() || "";
    const unit = parts.join(" ") || "";
    setNewProduct({
      name: p.name || "",
      id: p.id || "",
      category: p.category || "",
      price: String(p.price ?? ""),
      quantity: String(p.quantity ?? ""),
      unit,
      expiry: p.expiry || "",
      threshold: thVal,
      location: p.location || "",
      image: null,
    });
    setEditIndex(index);
    setEditNameKey((p.name || "").toLowerCase());
    setApplyToAll(false);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!newProduct.name || !newProduct.id || !newProduct.price || !newProduct.quantity) {
      alert("Please fill in all required fields.");
      return;
    }
    const updatedItem = {
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category || "Uncategorized",
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity),
      threshold: `${newProduct.threshold || 0} ${newProduct.unit || ""}`.trim(),
      location: newProduct.location || "",
      expiry: newProduct.expiry,
      availability:
        parseInt(newProduct.quantity) <= 0
          ? "Out of Stock"
          : parseInt(newProduct.quantity) < 10
          ? "Low Stock"
          : "In Stock",
    };
    const availability = (qty) =>
      qty <= 0 ? "Out of Stock" : qty < 10 ? "Low Stock" : "In Stock";

    try {
      if (applyToAll && editNameKey) {
        const matches = products.filter(
          (p) => (p.name || "").toLowerCase() === editNameKey
        );
        await Promise.all(
          matches.map((match) =>
            upsertStockItem({
              ...match,
              name: newProduct.name,
              category: newProduct.category || "Uncategorized",
              price: parseFloat(newProduct.price),
              threshold: `${newProduct.threshold || 0} ${newProduct.unit || ""}`.trim(),
              location: newProduct.location || match.location,
              expiry: newProduct.expiry || match.expiry,
              availability: availability(Number(match.quantity)),
            })
          )
        );
      } else if (editIndex !== null && products[editIndex]) {
        await upsertStockItem({
          ...products[editIndex],
          ...updatedItem,
        });
      }
      await refreshInventory();
    } catch (error) {
      console.error("Failed to update product", error);
      alert("Unable to update this product right now.");
      return;
    }

    setShowEditModal(false);
    setEditIndex(null);
    setEditNameKey(null);
    setApplyToAll(false);
    setNewProduct({
      name: "",
      id: "",
      category: "",
      price: "",
      quantity: "",
      unit: "",
      expiry: "",
      threshold: "",
      location: "",
      image: null,
    });
  };

  // Auto-fill from existing product on suggestion click
  const handleSelectSuggestion = (product) => {
    setNewProduct({
      ...product,
      expiry: "", // always set manually
      image: null,
    });
    setShowSuggestions(false);
  };

  const clearFilters = () =>
    setFilters({
      name: "",
      id: "",
      category: "",
      quantitySort: "",
      expiry: "",
      availability: "",
    });

  // Filtering
  let filteredProducts = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesId = p.id.toLowerCase().includes(filters.id.toLowerCase());
    const matchesCategory = !filters.category || p.category === filters.category;
    const matchesAvailability = !filters.availability || p.availability === filters.availability;
    const matchesExpiry = !filters.expiry || p.expiry === filters.expiry;
    return matchesName && matchesId && matchesCategory && matchesAvailability && matchesExpiry;
  });

  if (filters.quantitySort === "lowToHigh") filteredProducts.sort((a, b) => a.quantity - b.quantity);
  if (filters.quantitySort === "highToLow") filteredProducts.sort((a, b) => b.quantity - a.quantity);

  const productSuggestions = products.filter((p) =>
    p.name.toLowerCase().includes(newProduct.name.toLowerCase())
  );

  const isFilterApplied = useMemo(() => {
    return Boolean(
      filters.name ||
      filters.id ||
      filters.category ||
      filters.availability ||
      filters.quantitySort ||
      filters.expiry
    );
  }, [filters]);

  // Helper: load external script if not already present
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(s);
    });

  // Helpers to convert logo to base64 data URL
  const imageToDataURL = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    });

  const fetchToDataURL = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handleDownloadPdf = async () => {
    try {
      // Load jsPDF and autoTable at runtime from CDN
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.28/dist/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });

      // Header with logo and titles
      let logoData = null;
      try {
        logoData = await imageToDataURL(LogoUrl);
      } catch (e1) {
        try {
          logoData = await fetchToDataURL(LogoUrl);
        } catch (e2) {
          console.warn("Logo embed failed", e1, e2);
        }
      }
      if (logoData) {
        try {
          doc.addImage(logoData, "PNG", 40, 28, 120, 40);
        } catch (e) {
          console.warn("addImage failed", e);
        }
      }
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text("Inventory Report", 180, 50);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(new Date().toLocaleString(), 180, 68);

      // Table data from current view (respects filters)
      const rows = (filteredProducts || []).map((p) => {
        const key = `${p.id}::${p.name}`;
        const meta = (entryMap && entryMap[key]) || {};
        const entryDate = meta.entryAt ? new Date(meta.entryAt) : new Date();
        const tilDays = Math.max(0, Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24)));
        return [
          p.id,
          p.name,
          meta.batch || "",
          String(p.quantity ?? ""),
          p.location || "",
          meta.user || "",
          `${tilDays} days`,
          entryDate.toLocaleString(),
        ];
      });

      doc.autoTable({
        head: [[
          "Product ID",
          "Product Name",
          "Batch",
          "Quantity",
          "Location",
          "User",
          "Til",
          "Entry Date/Time",
        ]],
        body: rows,
        startY: 90,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 6, lineColor: [220, 220, 220], lineWidth: 0.5 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: "left" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didDrawPage: (data) => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(9);
          doc.setTextColor(150);
          const pageNo = doc.internal.getNumberOfPages();
          doc.text(`Page ${pageNo}`, pageWidth - 60, pageHeight - 20);
        },
      });

      const fileName = `Inventory_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Please check your network connection.");
    }
  };

  const handleFilterApply = () => setShowFilterModal(false);

  return (
    <div className="space-y-6">
      <InventoryMetricGrid totalProducts={products.length} />

      <InventoryTable
        filteredProducts={filteredProducts}
        entryMap={entryMap}
        onFilterClick={() => setShowFilterModal(true)}
        isFilterApplied={isFilterApplied}
        onClearFilters={clearFilters}
        onDownload={handleDownloadPdf}
        clearFilterIcon={ClearFilterIcon}
      />

      <InventoryAddProductModal
        open={showAddModal}
        product={newProduct}
        onFieldChange={updateNewProductField}
        onNameInput={handleNameInput}
        suggestions={productSuggestions}
        showSuggestions={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
        onImageUpload={handleImageUpload}
      />

      <FilterModal
        open={showFilterModal}
        filters={filters}
        onFieldChange={updateFilterField}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
      />

      <EditProductModal
        open={showEditModal}
        product={newProduct}
        onFieldChange={updateNewProductField}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateProduct}
        applyToAll={applyToAll}
        onToggleApplyToAll={setApplyToAll}
        applyLabelKey={editNameKey}
      />
    </div>
  );
}
