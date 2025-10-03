import type { ItemSheetRow, InvoiceItem } from "./types";

export function calcItems(items: ItemSheetRow[]): InvoiceItem[] {
  return items.map(it => ({
    ...it,
    amount: round2(it.qty * it.unit_price),
  }));
}

export function summarize(items: InvoiceItem[], vatRate = 0.07) {
  const subtotal = round2(items.reduce((s, it) => s + it.amount, 0));
  const vat = round2(subtotal * vatRate);
  const total = round2(subtotal + vat);
  return { subtotal, vat, total };
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
