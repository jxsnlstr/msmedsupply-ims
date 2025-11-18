import React, { useCallback, useEffect, useMemo, useState } from "react";
import LogoUrl from "../assets/medsupply.png";
import MovementHistoryTable from "../components/stockMovement/MovementHistoryTable";
import PendingTransferTable from "../components/stockMovement/PendingTransferTable";
import PlaceholderCard from "../components/stockMovement/PlaceholderCard";
import { getPendingTransfers, getStockMovements } from "../api/imsApi";

export default function StockMovement() {
  const [toTransfer, setToTransfer] = useState([]);
  const [history, setHistory] = useState([]);

  const loadPendingTransfers = useCallback(async () => {
    try {
      const data = await getPendingTransfers();
      setToTransfer(data);
    } catch (error) {
      console.error("Failed to load pending transfers", error);
      setToTransfer([]);
    }
  }, []);

  const loadMovementHistory = useCallback(async () => {
    try {
      const data = await getStockMovements();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load movement history", error);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadPendingTransfers();
    loadMovementHistory();
  }, [loadPendingTransfers, loadMovementHistory]);

  const sortedHistory = useMemo(() => {
    try {
      return [...(history || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch {
      return history || [];
    }
  }, [history]);

  // Helpers for PDF
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

  const handleDownloadHistoryPdf = async () => {
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.28/dist/jspdf.plugin.autotable.min.js");
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });

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
      doc.text("Stock Movement History", 180, 50);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(new Date().toLocaleString(), 180, 68);

      const rows = (sortedHistory || []).map((h) => [
        h.createdAt ? new Date(h.createdAt).toLocaleString() : "",
        h.action || "",
        h.id || "",
        h.name || "",
        h.category || "",
        h.batch || "",
        String(h.quantity ?? ""),
        h.unit || "",
        h.user || "",
      ]);

      doc.autoTable({
        head: [[
          "Date/Time",
          "Action",
          "Product ID",
          "Product Name",
          "Category",
          "Batch",
          "Quantity",
          "Unit",
          "User",
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

      const fileName = `Stock_Movement_History_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Please check your network connection.");
    }
  };

  const refreshHistory = loadMovementHistory;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Stock Movement</h2>
        <p className="text-sm text-gray-600 mt-2">
          Track transfers, adjustments, and movement history.
        </p>
      </div>

      <PendingTransferTable
        items={toTransfer}
        title="Stock to be Transferred"
        subtitle="Receiving entries waiting for warehouse processing."
        onRefresh={loadPendingTransfers}
      />

      <PlaceholderCard
        title="Transfers"
        description="Create and track stock transfers between locations. (Coming soon)"
      />

      <PlaceholderCard
        title="Adjustments"
        description="Record increases/decreases and corrections. (Coming soon)"
      />

      <MovementHistoryTable
        history={sortedHistory}
        onDownload={handleDownloadHistoryPdf}
        onRefresh={refreshHistory}
      />
    </div>
  );
}

