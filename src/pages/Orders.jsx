import React, { useState } from "react";

export default function Orders() {
  const [showModal, setShowModal] = useState(false);

  const orders = [
    { product: "Crutches", value: "$4306", qty: "43 Units", id: "7535", date: "11/12/25", status: "Delayed" },
    { product: "Wheelchair", value: "$2557", qty: "22 Units", id: "5724", date: "12/21/25", status: "Confirmed" },
    { product: "Walker", value: "$4075", qty: "36 Units", id: "2775", date: "05/12/25", status: "Returned" },
    { product: "Oxygen Tank", value: "$5052", qty: "14 Units", id: "2275", date: "08/12/25", status: "Out for delivery" },
  ];

  const statusColor = {
    Delayed: "text-[#CE965A]",
    Confirmed: "text-[#0ABF68]",
    Returned: "text-[#F04438]",
    "Out for delivery": "text-[#246BFD]",
  };

  return (
    <div className="p-6 bg-[#F8F9FB] min-h-screen font-inter text-[#323743]">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#246BFD] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1F57D6]"
          >
            Add Product
          </button>
          <button className="border border-[#E4E7EC] px-4 py-2 rounded-lg text-sm text-[#49505F] hover:bg-[#F2F4F7]">
            Filters
          </button>
          <button className="border border-[#E4E7EC] px-4 py-2 rounded-lg text-sm text-[#49505F] hover:bg-[#F2F4F7]">
            Order History
          </button>
        </div>
      </div>

      {/* ---------- OVERALL STATS ---------- */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-sm">
          <p className="text-[#246BFD] text-sm font-semibold">Total Orders</p>
          <p className="text-2xl font-semibold mt-1">37</p>
          <p className="text-xs text-[#626973] mt-1">Last 7 days</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-sm">
          <p className="text-[#7D5CFF] text-sm font-semibold">Total Received</p>
          <p className="text-2xl font-semibold mt-1">32</p>
          <p className="text-xs text-[#626973] mt-1">Last 7 days</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-sm">
          <p className="text-[#F04438] text-sm font-semibold">Total Returned</p>
          <p className="text-2xl font-semibold mt-1">5</p>
          <p className="text-xs text-[#626973] mt-1">Last 7 days</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-sm">
          <p className="text-[#CE965A] text-sm font-semibold">On The Way</p>
          <p className="text-2xl font-semibold mt-1">12</p>
          <p className="text-xs text-[#626973] mt-1">Ordered</p>
        </div>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Orders</h3>
        <table className="w-full text-sm text-left">
          <thead className="text-[#626973] border-b">
            <tr>
              <th className="pb-2">Product</th>
              <th className="pb-2">Order Value</th>
              <th className="pb-2">Quantity</th>
              <th className="pb-2">Order ID</th>
              <th className="pb-2">Expected Delivery</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={i} className="border-b last:border-none">
                <td className="py-2">{o.product}</td>
                <td>{o.value}</td>
                <td>{o.qty}</td>
                <td>{o.id}</td>
                <td>{o.date}</td>
                <td className={`${statusColor[o.status]} font-medium`}>
                  {o.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- ADD PRODUCT MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[420px]">
            <h2 className="text-lg font-semibold mb-4">New Order</h2>
            <div className="space-y-3">
              {[
                "Product Name",
                "Product ID",
                "Category",
                "Order Value",
                "Quantity",
                "Unit",
                "Buying Price",
                "Date of Delivery",
              ].map((field, i) => (
                <div key={i}>
                  <label className="text-sm text-[#626973]">{field}</label>
                  <input
                    type="text"
                    placeholder={`Enter ${field.toLowerCase()}`}
                    className="w-full mt-1 p-2 border border-[#E4E7EC] rounded-lg focus:ring-2 focus:ring-[#246BFD]"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="notify" />
                <label htmlFor="notify" className="text-sm text-[#626973]">
                  Notify on the date of delivery
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="border border-[#E4E7EC] px-4 py-2 rounded-lg text-sm hover:bg-[#F2F4F7]"
              >
                Discard
              </button>
              <button
                className="bg-[#246BFD] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1F57D6]"
                onClick={() => setShowModal(false)}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
