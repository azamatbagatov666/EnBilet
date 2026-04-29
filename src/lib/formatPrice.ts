// src/lib/formatPrice.ts
export const formatPrice = (value: number | string) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return num.toFixed(2);
};