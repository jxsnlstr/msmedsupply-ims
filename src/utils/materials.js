export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function formatCurrency(value, currency = "USD") {
  if (value === undefined || value === null || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function isBelowReorder(material) {
  const qty = Number(material.quantityOnHand || 0);
  const reorder = Number(material.reorderPoint || 0);
  return Number.isFinite(qty) && Number.isFinite(reorder) && reorder > 0 && qty <= reorder;
}
