import React, { useEffect, useMemo, useRef, useState } from "react";
import LogoUrl from "../assets/medsupply.png";
import ClearFilterIcon from "../assets/Clear Filter.png";
import CenteredToast from "../components/common/CenteredToast";
import AddProductModal from "../components/products/AddProductModal";
import EditProductModal from "../components/common/EditProductModal";
import FilterModal from "../components/common/FilterModal";
import ProductMetricGrid from "../components/products/ProductMetricGrid";
import ProductTable from "../components/products/ProductTable";

export default function Products() {
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

  const updateNewProductField = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const updateFilterField = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const defaultProducts = [
    { id: "P001", name: "Maggi", category: "Food", price: 4.3, quantity: 43, threshold: "12 Packs", location: "", expiry: "2025-11-12", availability: "In Stock" },
    { id: "P002", name: "Bru", category: "Beverages", price: 2.57, quantity: 22, threshold: "12 Packs", location: "", expiry: "2025-12-21", availability: "Out of Stock" },
    { id: "P003", name: "Red Bull", category: "Beverages", price: 4.05, quantity: 36, threshold: "9 Packs", location: "", expiry: "2025-05-12", availability: "In Stock" },
    { id: "P004", name: "Bourn Vita", category: "Health", price: 5.02, quantity: 14, threshold: "6 Packs", location: "", expiry: "2025-08-12", availability: "Out of Stock" },
    { id: "P005", name: "Horlicks", category: "Health", price: 5.3, quantity: 5, threshold: "5 Packs", location: "", expiry: "2025-09-01", availability: "In Stock" },
    { id: "P006", name: "Harpic", category: "Cleaning", price: 6.05, quantity: 10, threshold: "5 Packs", location: "", expiry: "2025-09-01", availability: "In Stock" },
    { id: "P007", name: "Ariel", category: "Cleaning", price: 4.08, quantity: 23, threshold: "7 Packs", location: "", expiry: "2025-12-15", availability: "Out of Stock" },
    { id: "P008", name: "Scotch Brite", category: "Cleaning", price: 3.59, quantity: 43, threshold: "8 Packs", location: "", expiry: "2025-06-06", availability: "In Stock" },
    { id: "P009", name: "Coca Cola", category: "Beverages", price: 2.05, quantity: 41, threshold: "10 Packs", location: "", expiry: "2025-11-11", availability: "Low Stock" },
  ];

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("inventory_products");
      return saved ? JSON.parse(saved) : defaultProducts;
    } catch {
      return defaultProducts;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("inventory_products", JSON.stringify(products));
    } catch {}
  }, [products]);

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

  // no autofill suggestions for Add Product (new items only)
  const [addedToast, setAddedToast] = useState(false);
  const toastTimerRef = useRef(null);
  const [errorToast, setErrorToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const errorTimerRef = useRef(null);

  const showError = (msg) => {
    try {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    } catch {}
    setErrorMsg(msg || "Please fix the highlighted fields.");
    setErrorToast(true);
    errorTimerRef.current = setTimeout(() => setErrorToast(false), 2000);
  };

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({ ...prev, image: file }));
    }
  };

  // Add product (must be new; duplicates are not allowed)
  const handleAddProduct = () => {
    if (!newProduct.name) return showError("Enter product name.");
    if (!newProduct.id) return showError("Enter product ID.");
    if (newProduct.price === "" || newProduct.price === null) return showError("Enter buying price.");
    const priceNum = Number(newProduct.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return showError("Enter a valid price.");
    const qtyNum = (newProduct.quantity === "" || newProduct.quantity === null)
      ? 0
      : Number(newProduct.quantity);
    if (!Number.isFinite(qtyNum) || qtyNum < 0) return showError("Enter a valid quantity (0 or more).");

    const existsByName = products.some(
      (p) => (p.name || "").toLowerCase() === newProduct.name.toLowerCase()
    );
    const existsById = products.some((p) => (p.id || "") === newProduct.id);
    if (existsByName || existsById) {
      return showError("Product already exists. Use Update instead.");
    }

    const newItem = {
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category || "Uncategorized",
      price: priceNum,
      quantity: qtyNum,
      threshold: `${newProduct.threshold || 0} ${newProduct.unit || ""}`.trim(),
      location: newProduct.location || "",
      expiry: newProduct.expiry,
      availability: (() => {
        const tVal = Number((parseThreshold(`${newProduct.threshold || 0} ${newProduct.unit || ""}`) || {}).value || 0);
        if (qtyNum <= 0) return "Out of Stock";
        if (qtyNum < tVal) return "Low Stock";
        return "In Stock";
      })(),
    };
    setProducts((prev) => [...prev, newItem]);

    setShowAddModal(false);
    try {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    } catch {}
    setAddedToast(true);
    toastTimerRef.current = setTimeout(() => setAddedToast(false), 2000);
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

  const handleUpdateProduct = () => {
    if (!newProduct.name) return showError("Enter product name.");
    if (!newProduct.id) return showError("Enter product ID.");
    if (newProduct.price === "" || newProduct.price === null) return showError("Enter buying price.");
    if (newProduct.quantity === "" || newProduct.quantity === null) return showError("Enter quantity.");
    const priceNum = Number(newProduct.price);
    const qtyNum = Number(newProduct.quantity);
    if (!Number.isFinite(priceNum) || priceNum < 0) return showError("Enter a valid price.");
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) return showError("Enter a valid quantity.");
    const updatedItem = {
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category || "Uncategorized",
      price: priceNum,
      quantity: qtyNum,
      threshold: `${newProduct.threshold || 0} ${newProduct.unit || ""}`.trim(),
      location: newProduct.location || "",
      expiry: newProduct.expiry,
      availability: (() => {
        const tVal = Number((parseThreshold(`${newProduct.threshold || 0} ${newProduct.unit || ""}`) || {}).value || 0);
        if (qtyNum <= 0) return "Out of Stock";
        if (qtyNum < tVal) return "Low Stock";
        return "In Stock";
      })(),
    };
    if (applyToAll && editNameKey) {
      setProducts((prev) =>
        prev.map((p, i) => {
          if ((p.name || "").toLowerCase() === editNameKey) {
            const newThreshold = `${newProduct.threshold || 0} ${newProduct.unit || ""}`.trim();
            const availability = (qty) => (qty <= 0 ? "Out of Stock" : qty < 10 ? "Low Stock" : "In Stock");
            return {
              ...p,
              // keep id and quantity for each instance; update rest
              name: newProduct.name,
              category: newProduct.category || "Uncategorized",
              price: parseFloat(newProduct.price),
              threshold: newThreshold,
              location: newProduct.location || p.location,
              expiry: newProduct.expiry || p.expiry,
              availability: availability(parseInt(p.quantity)),
            };
          }
          return p;
        })
      );
    } else {
      setProducts((prev) => prev.map((p, i) => (i === editIndex ? updatedItem : p)));
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

  const handleEditClick = (item) => {
    const index = products.findIndex((p) => p.id === item.id && p.name === item.name);
    if (index >= 0) openEditModal(index);
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

  const handleFilterApply = () => setShowFilterModal(false);

  // No autofill for Add Product (new items only)

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

  // suggestions removed

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

  const parseThreshold = (t) => {
    const parts = String(t || "").trim().split(" ");
    const value = parts.shift() || "";
    const unit = parts.join(" ") || "";
    return { value, unit };
  };

  const computeAvailability = (qty, thresholdStr) => {
    const q = Number(qty || 0);
    const tVal = Number((parseThreshold(thresholdStr || "") || {}).value || 0);
    if (q <= 0) return "Out of Stock";
    if (q < tVal) return "Low Stock";
    return "In Stock";
  };

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
      doc.text("Products Report", 180, 50);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(new Date().toLocaleString(), 180, 68);

      // Table data from current view (respects filters)
      const rows = (filteredProducts || []).map((p) => [
        p.id,
        p.name,
        p.category,
        `$${Number(p.price).toFixed(2)}`,
        String(p.quantity),
        p.location || "",
        p.expiry || "",
        p.availability || "",
      ]);

      doc.autoTable({
        head: [[
          "Product ID",
          "Product Name",
          "Category",
          "Buying Price",
          "Quantity",
          "Location",
          "Expiry Date",
          "Availability",
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

      const fileName = `Products_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Please check your network connection.");
    }
  };

  return (
    <div className="space-y-6">
      <ProductMetricGrid totalProducts={products.length} />

      <ProductTable
        filteredProducts={filteredProducts}
        onAddClick={() => setShowAddModal(true)}
        onFilterClick={() => setShowFilterModal(true)}
        onClearFilters={clearFilters}
        isFilterApplied={isFilterApplied}
        onDownload={handleDownloadPdf}
        clearFilterIcon={ClearFilterIcon}
        computeAvailability={computeAvailability}
        parseThreshold={parseThreshold}
        onEdit={handleEditClick}
      />

      <AddProductModal
        open={showAddModal}
        product={newProduct}
        onFieldChange={updateNewProductField}
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

      <CenteredToast
        open={addedToast}
        variant="success"
        title="Added Product"
        message="Product successfully added."
        onClose={() => setAddedToast(false)}
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
