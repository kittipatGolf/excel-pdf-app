import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET() {
  // ตัวอย่างข้อมูลเล็กๆในชีต
  const invoices = [
    { invoice_no: "INV-001", date: "2025-01-16", client_name: "ACME Co., Ltd.", tax_id: "0123456789012", address: "Bangkok" },
  ];
  const items = [
    { invoice_no: "INV-001", description: "บริการเช่า Server รายปี", qty: 1, unit_price: 1000 },
    { invoice_no: "INV-001", description: "บริการดูแลเว็บไซต์ 12 เดือน", qty: 1, unit_price: 4000 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoices), "invoices");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items), "items");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="excel-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
