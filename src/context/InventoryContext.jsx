import React, { createContext, useState, useContext } from "react";

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([
    {
      sku: "MS1001",
      name: "Wheelchair",
      category: "Mobility",
      cost: 120,
      description: "Standard lightweight wheelchair",
      stock: { "Aisle 1": 10, "Warehouse A": 4 },
      min: 5,
      max: 50,
    },
    {
      sku: "MS1002",
      name: "Oxygen Tank",
      category: "Respiratory",
      cost: 85,
      description: "Oxygen cylinder with regulator",
      stock: { "Aisle 2": 5 },
      min: 5,
      max: 25,
    },
  ]);

  const [ledger, setLedger] = useState([
    {
      date: "2025-10-28 09:30",
      type: "101 – Goods Receipt",
      sku: "MS1001",
      item: "Wheelchair",
      qty: 5,
      location: "Aisle 1",
      user: "Admin",
    },
    {
      date: "2025-10-28 15:20",
      type: "201 – Transfer",
      sku: "MS1002",
      item: "Oxygen Tank",
      qty: 2,
      location: "Warehouse A",
      user: "Admin",
    },
  ]);

  return (
    <InventoryContext.Provider value={{ items, setItems, ledger, setLedger }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
