/** Fixed-decimal number for tables (tabular figures are set in CSS). */
export const fmt = (v: number, d: number) =>
  v.toLocaleString('en', { minimumFractionDigits: d, maximumFractionDigits: d });
