export type InvoiceSheetRow = {
  invoice_no: string;
  date: string;           // 2025-01-16 หรือรูปแบบที่ Excel ให้มา
  client_name: string;
  tax_id?: string;
  address?: string;
};

export type ItemSheetRow = {
  invoice_no: string;
  description: string;
  qty: number;
  unit_price: number;
};

export type InvoiceItem = ItemSheetRow & { amount: number };

export type NormalizedInvoice = Omit<InvoiceSheetRow, 'date'> & {
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
};
