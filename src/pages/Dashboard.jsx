import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { getStockByLocation } from "../api/imsApi";

// helper for mock data
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("Monthly"); // Weekly | Monthly | Quarterly | Yearly
  const timeOptions = ["Weekly", "Monthly", "Quarterly", "Yearly"];

  // Pull inventory snapshot for KPIs
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getStockByLocation();
        if (isMounted) setInventory(data);
      } catch (error) {
        console.error("Failed to load inventory snapshot", error);
        if (isMounted) setInventory([]);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const invMetrics = useMemo(() => {
    const totalProducts = inventory.length;
    const totalQty = inventory.reduce((a, p) => a + Number(p.quantity || 0), 0);
    const lowItems = inventory.filter((p) => p.availability === "Low Stock");
    const outItems = inventory.filter((p) => p.availability === "Out of Stock");
    const categories = new Set(inventory.map((p) => p.category).filter(Boolean)).size;
    return {
      totalProducts,
      totalQty,
      lowCount: lowItems.length,
      outCount: outItems.length,
      categories,
      lowItems,
    };
  }, [inventory]);

  // Chart dataset driven by timeRange
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];

    if (timeRange === "Weekly") {
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        data.push({
          name: day[d.getDay()],
          purchase: rand(1000, 4000),
          sales: rand(2000, 5000),
        });
      }
    } else if (timeRange === "Monthly") {
      const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 5; i >= 0; i--) {
        const idx = (now.getMonth() - i + 12) % 12;
        data.push({
          name: m[idx],
          purchase: rand(20000, 60000),
          sales: rand(30000, 70000),
        });
      }
    } else if (timeRange === "Quarterly") {
      const q = ["Q1", "Q2", "Q3", "Q4"];
      for (let i = 3; i >= 0; i--) {
        data.push({
          name: q[Math.floor(now.getMonth() / 3 - i + 4) % 4],
          purchase: rand(80000, 150000),
          sales: rand(100000, 180000),
        });
      }
    } else {
      // Yearly (last 3)
      for (let i = 2; i >= 0; i--) {
        data.push({
          name: String(now.getFullYear() - i),
          purchase: rand(400000, 800000),
          sales: rand(500000, 900000),
        });
      }
    }
    return data;
  }, [timeRange]);

  // KPI totals derived from dataset
  const totals = useMemo(() => {
    const salesSum = chartData.reduce((a, v) => a + v.sales, 0);
    const purchaseSum = chartData.reduce((a, v) => a + v.purchase, 0);
    return {
      sales: salesSum,
      revenue: salesSum * 1.05,
      profit: salesSum * 0.15,
      cost: purchaseSum,
    };
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Top KPI row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-md font-semibold text-gray-800 mb-3">Sales Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Sales</p>
              <p className="text-lg font-semibold text-blue-600">
                ${totals.sales.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-lg font-semibold text-green-600">
                ${totals.revenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profit</p>
              <p className="text-lg font-semibold text-emerald-500">
                ${totals.profit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost</p>
              <p className="text-lg font-semibold text-red-500">
                ${totals.cost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

      {/* Inventory Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Inventory Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Quantity in Hand</p>
            <p className="text-lg font-semibold text-blue-600">{invMetrics.totalQty}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">To Be Received</p>
            <p className="text-lg font-semibold text-purple-600">{invMetrics.lowCount + invMetrics.outCount}</p>
          </div>
        </div>
      </div>
      </div>

      {/* Middle KPI row (Purchase + Product) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-md font-semibold text-gray-800 mb-3">Purchase Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Purchases</p>
              <p className="text-lg font-semibold text-blue-600">82</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost</p>
              <p className="text-lg font-semibold text-green-600">
                ${Number(13573).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-lg font-semibold text-orange-600">5</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Returns</p>
              <p className="text-lg font-semibold text-red-500">
                ${Number(17432).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

      {/* Product Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-md font-semibold text-gray-800 mb-3">Product Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-lg font-semibold text-blue-600">{invMetrics.totalProducts}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Number of Categories</p>
            <p className="text-lg font-semibold text-indigo-600">{invMetrics.categories}</p>
          </div>
        </div>
      </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Purchase with dropdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-md font-semibold text-gray-800">Sales &amp; Purchase</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {timeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, ""]} />
              <Legend />
              <Bar dataKey="purchase" name="Purchase" fill="#60a5fa" />
              <Bar dataKey="sales" name="Sales" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-md font-semibold text-gray-800 mb-3">Order Summary</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, ""]} />
              <Legend />
              <Line type="monotone" dataKey="sales" name="Delivered" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="purchase" name="Ordered" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Stock */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-md font-semibold text-gray-800">Top Selling Stock</h2>
            <button className="text-sm text-blue-600 hover:underline">See All</button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Sold Quantity</th>
                  <th className="px-4 py-2 text-left font-medium">Remaining Quantity</th>
                  <th className="px-4 py-2 text-left font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2">Surf Excel</td>
                  <td className="px-4 py-2">30</td>
                  <td className="px-4 py-2">12</td>
                  <td className="px-4 py-2">${(100).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Rin</td>
                  <td className="px-4 py-2">21</td>
                  <td className="px-4 py-2">15</td>
                  <td className="px-4 py-2">${(207).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Parle G</td>
                  <td className="px-4 py-2">19</td>
                  <td className="px-4 py-2">17</td>
                  <td className="px-4 py-2">${(105).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Quantity Stock */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-md font-semibold text-gray-800">Low Quantity Stock</h2>
            <button className="text-sm text-blue-600 hover:underline">See All</button>
          </div>

          {(() => {
            const low = invMetrics.lowItems;
            if (!low.length) {
              return (
                <p className="text-sm text-gray-500">No low quantity items.</p>
              );
            }
            return (
              <ul className="space-y-3">
                {low.map((i) => (
                  <li
                    key={`${i.id}-${i.name}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{i.name}</p>
                      <p className="text-xs text-gray-500">Remaining: {i.quantity}</p>
                    </div>
                    <span className="text-xs rounded-full bg-red-50 px-2 py-1 text-red-600 border border-red-200">
                      Low
                    </span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
