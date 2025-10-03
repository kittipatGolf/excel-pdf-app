import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET() {
  // === ชีต invoices (หัวเอกสาร) ===
  const invoices = [
    {
      invoice_no: "QT25010005",
      date: "2025-01-09",
      client_name: "บริษัท เวล ออแกน จำกัด",
      tax_id: "0105557007155",
      address:
        "15/3 ซอยเฉลิมพระเกียรติ 118 แยก 42-2 แขวงสะพานสูง เขตสะพานสูง กรุงเทพมหานคร 10240",
    },
  ];

  // === ชีต items (รายการในตาราง) ===
  const items = [
    {
      invoice_no: "QT25010005",
      description:
        "ค่าดูแล และอัพเดทข้อมูลเว็บไซต์ Whale ทุก 3 เดือน จำนวน 4 ครั้ง\n" +
        "   -  ครั้งที่ 1 วันที่ 29 มีนาคม 2568, ครั้งที่ 2 วันที่ 28 มิถุนายน 2568, ครั้งที่ 3 วันที่ 30 กันยายน 2568, ครั้งที่ 4 วันที่ 27 ธันวาคม 2568\n" +
        "   -  อัพเดทข้อมูลทุกเดือน ไม่เกิน 25 คอนเทนต์\n" +
        "   -  ปรับโทนภาพให้เหมาะสม ไม่เกิน 20 รูป/1 ผลงาน\n" +
        "   -  ชำระค่าบริการครั้งละ 1 ครั้ง\n" +
        "   -  ข้อมูลและรูปภาพสำหรับใช้งานต้องมาจากทางลูกค้า",
      qty: 1,
      unit_price: 10000,
    },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoices), "invoices");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items), "items");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="excel-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
