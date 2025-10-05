// app/api/template/route.ts
import * as XLSX from "xlsx";
export const runtime = "nodejs";

export async function GET() {
  // ชีต invoices (หัวเอกสาร) — ใช้หัวคอลัมน์ภาษาไทย
  const invoices = [
    {
      "No.": "QT25010005",
      "Date": "2025-01-09",
      "Client": "บริษัท เวล ออแกน จำกัด",
      "Address": "15/3 ซอยเฉลิมพระเกียรติ 118 แยก 42-2 แขวงสะพานสูง เขตสะพานสูง กรุงเทพมหานคร 10240",
      "เลขประจำตัวผู้เสียภาษี": "0105557007155",
      "ผู้ติดต่อ": "คุณลักขณา พันธรักษ์ (แพร)",
      "email": "pair@example.com",
      "โทร": "089-xxx-xxxx",
      "Job": "ค่าดูแล และอัพเดทข้อมูลเว็บไซต์ Whale",
    },
  ];

  // ชีต items — หัวคอลัมน์ภาษาไทย
  const items = [
    { "No.": "QT25010005", "ลำดับ": 1, "รายการ": "ค่าบริการรายเดือน", "จำนวน": 1, "ราคา / หน่วย": 10000, "จำนวนเงิน": 10000 },
    { "No.": "QT25010005", "ลำดับ": 2, "รายการ": "ค่าแรงอัปเดตคอนเทนต์", "จำนวน": 1, "ราคา / หน่วย": 3500,  "จำนวนเงิน": 3500  },
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
