import React, { createContext, useContext, useReducer, useEffect } from "react";

// --- Initial State --- //
const initialState = {
  materials: [],      // Master data
  stock: [],          // Stock by SKU + location
  movements: [],      // All material movement docs
  thresholds: {},     // Reorder + safety stock
  categories: [],     // Derived from materials
};

// --- Reducer --- //
function imsReducer(state, action) {
  switch (action.type) {
    // Add or update material
    case "ADD_MATERIAL": {
      const updatedMaterials = [...state.materials, action.payload];
      const categories = [
        ...new Set(updatedMaterials.map((m) => m.category).filter(Boolean)),
      ];
      return { ...state, materials: updatedMaterials, categories };
    }

    // Update existing material (by SKU)
    case "UPDATE_MATERIAL": {
      const updated = state.materials.map((m) =>
        m.sku === action.payload.sku ? { ...m, ...action.payload } : m
      );
      const categories = [
        ...new Set(updated.map((m) => m.category).filter(Boolean)),
      ];
      return { ...state, materials: updated, categories };
    }

    // Add or adjust stock
    case "UPDATE_STOCK": {
      const { sku, location, quantity } = action.payload;
      const existingIndex = state.stock.findIndex(
        (s) => s.sku === sku && s.location === location
      );
      let updatedStock = [...state.stock];

      if (existingIndex >= 0) {
        updatedStock[existingIndex].quantity = quantity;
      } else {
        updatedStock.push({ sku, location, quantity });
      }

      return { ...state, stock: updatedStock };
    }

    // Add movement record
    case "ADD_MOVEMENT":
      return { ...state, movements: [...state.movements, action.payload] };

    // Reset everything
    case "RESET_ALL":
      return initialState;

    default:
      return state;
  }
}

// --- Context Creation --- //
const IMSContext = createContext();

// --- Provider Component --- //
export const IMSProvider = ({ children }) => {
  const [state, dispatch] = useReducer(imsReducer, initialState, (init) => {
    // Load persisted data from localStorage if exists
    try {
      const saved = localStorage.getItem("imsData");
      return saved ? JSON.parse(saved) : init;
    } catch {
      return init;
    }
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("imsData", JSON.stringify(state));
  }, [state]);

  const value = { state, dispatch };
  return <IMSContext.Provider value={value}>{children}</IMSContext.Provider>;
};

// --- Custom Hook for easy access --- //
export const useIMS = () => useContext(IMSContext);
