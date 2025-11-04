import React, { useEffect, useMemo, useState } from "react";
import LogoUrl from "../assets/medsupply.png";
import ClearFilterIcon from "../assets/Clear Filter.png";

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

  const [showSuggestions, setShowSuggestions] = useState(false);

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setNewProduct({ ...newProduct, image: file });
  };

  // Add or merge product
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.id || !newProduct.price || !newProduct.quantity) {
      alert("Please fill in all required fields.");
      return;
    }

    const existing = products.find(
      (p) => p.name.toLowerCase() === newProduct.name.toLowerCase()
    );

    if (existing) {
      const updated = products.map((p) => {
        if (p.name.toLowerCase() === newProduct.name.toLowerCase()) {
          const newQty = parseInt(p.quantity) + parseInt(newProduct.quantity);
          const updatedAvailability =
            newQty <= 0 ? "Out of Stock" : newQty < 10 ? "Low Stock" : "In Stock";
          return { ...p, quantity: newQty, availability: updatedAvailability };
        }
        return p;
      });
      setProducts(updated);
    } else {
      const newItem = {
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
      setProducts((prev) => [...prev, newItem]);
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

  const handleUpdateProduct = () => {
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

  // Auto-fill from existing product on suggestion click
  const handleSelectSuggestion = (product) => {
    setNewProduct({
      ...product,
      expiry: "", // always set manually
      image: null,
    });
    setShowSuggestions(false);
  };

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

      const fileName = `Inventory_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Please check your network connection.");
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-semibold text-blue-600">14</p>
          <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-semibold text-green-600">{products.length}</p>
          <p className="text-xs text-gray-400 mt-1">Live count</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Top Selling</p>
          <p className="text-2xl font-semibold text-purple-600">5</p>
          <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Low Stocks</p>
          <p className="text-2xl font-semibold text-red-500">12</p>
          <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Products</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Add Product
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
            >
              Filters
            </button>
            {isFilterApplied && (
              <button
                onClick={() =>
                  setFilters({
                    name: "",
                    id: "",
                    category: "",
                    quantitySort: "",
                    expiry: "",
                    availability: "",
                  })
                }
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                title="Clear Filters"
              >
                <img src={ClearFilterIcon} alt="Clear Filters" className="w-4 h-4" />
                <span className="text-sm">Clear Filters</span>
              </button>
            )}
            <button onClick={handleDownloadPdf} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
              Download all
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product ID</th>
                <th className="px-4 py-3 text-left font-medium">Product Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Buying Price</th>
                <th className="px-4 py-3 text-left font-medium">Quantity</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">Expiry Date</th>
                <th className="px-4 py-3 text-left font-medium">Availability</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-gray-800">{item.id}</td>
                  <td className="px-4 py-3 text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-800">{item.category}</td>
                  <td className="px-4 py-3 text-gray-800">${item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-800">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-800">{item.location}</td>
                  <td className="px-4 py-3 text-gray-800">{item.expiry}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        item.availability === "In Stock"
                          ? "text-green-600"
                          : item.availability === "Low Stock"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.availability}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEditModal(products.findIndex((p) => p.id === item.id && p.name === item.name))}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- ADD PRODUCT MODAL ---------- */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">New Product</h2>

            {/* Image Upload */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-6 cursor-pointer"
              onClick={() => document.getElementById("imageUpload").click()}
            >
              <p className="text-sm text-gray-500">
                Drag image here <br />
                <span className="text-blue-600 cursor-pointer">or Browse image</span>
              </p>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {newProduct.image && (
                <p className="text-xs text-gray-500 mt-2">{newProduct.image.name}</p>
              )}
            </div>

            {/* Product Name with Suggestions */}
            <div className="mb-4 relative">
              <p className="text-sm text-gray-600 mb-1">Product Name</p>
              <input
                type="text"
                placeholder="Enter or select product name"
                value={newProduct.name}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, name: e.target.value });
                  setShowSuggestions(true);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              {showSuggestions && newProduct.name && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded-md w-full max-h-32 overflow-y-auto shadow">
                  {productSuggestions.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => handleSelectSuggestion(p)}
                      className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Other Inputs */}
            {[
               { label: "Product ID", key: "id" },
               { label: "Category", key: "category" },
               { label: "Buying Price", key: "price" },
               { label: "Quantity", key: "quantity" },
               { label: "Unit", key: "unit" },
               { label: "Threshold Value", key: "threshold" },
             ].map((field) => (
               <div key={field.key} className="mb-4">
                 <p className="text-sm text-gray-600 mb-1">{field.label}</p>
                 <input
                   type="text"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={newProduct[field.key]}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, [field.key]: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            ))}

            {/* Expiry Date */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
              <input
                type="date"
                value={newProduct.expiry}
                onChange={(e) => setNewProduct({ ...newProduct, expiry: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={handleAddProduct}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- FILTER MODAL ---------- */}
      {showFilterModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowFilterModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Filter</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Product Name</p>
                <input
                  type="text"
                  placeholder="Search by product name"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Product ID</p>
                <input
                  type="text"
                  placeholder="Search by product ID"
                  value={filters.id}
                  onChange={(e) => setFilters({ ...filters, id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <input
                  type="text"
                  placeholder="Enter category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Availability */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Availability</p>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              {/* Quantity Sort */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Quantity Sort</p>
                <select
                  value={filters.quantitySort}
                  onChange={(e) => setFilters({ ...filters, quantitySort: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="lowToHigh">Low to High</option>
                  <option value="highToLow">High to Low</option>
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                <input
                  type="date"
                  value={filters.expiry}
                  onChange={(e) => setFilters({ ...filters, expiry: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- EDIT PRODUCT MODAL ---------- */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Product</h2>

            {/* Product Name */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Product Name</p>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Other Inputs */}
            {[
              { label: "Product ID", key: "id" },
              { label: "Category", key: "category" },
              { label: "Buying Price", key: "price" },
              { label: "Quantity", key: "quantity" },
              { label: "Unit", key: "unit" },
              { label: "Threshold Value", key: "threshold" },
              { label: "Location", key: "location" },
            ].map((field) => (
              <div key={field.key} className="mb-4">
                <p className="text-sm text-gray-600 mb-1">{field.label}</p>
                <input
                  type="text"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={newProduct[field.key]}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, [field.key]: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            ))}

            <div className="mb-4 flex items-center gap-2">
              <input
                id="applyAll"
                type="checkbox"
                className="h-4 w-4"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
              />
              <label htmlFor="applyAll" className="text-sm text-gray-700">
                Apply changes to all items named "{(editNameKey || "").toString()}"
              </label>
            </div>

            {/* Expiry Date */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
              <input
                type="date"
                value={newProduct.expiry}
                onChange={(e) => setNewProduct({ ...newProduct, expiry: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
