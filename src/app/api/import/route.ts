// app/api/import/route.ts
import * as XLSX from "xlsx";
import type { InvoiceSheetRow, ItemSheetRow, NormalizedInvoice } from "@/lib/types";
import { calcItems, summarize } from "@/lib/calc";

export const runtime = "nodejs";

function toISODate(v: unknown): string {
  // รองรับ Date, serial number ของ Excel, และ string ปกติ
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "number") {
    // Excel serial -> JS Date
    const ms = Math.round((v - 25569) * 86400 * 1000);
    const dt = new Date(ms);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "string") return v.trim();
  return "";
}

function asNumber(v: any): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/,/g, "").trim()) || 0;
  return 0;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "ไม่พบไฟล์ที่อัปโหลด (field: file)" }, { status: 400 });
    }

    const buf = new Uint8Array(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: "array", cellDates: true });

    const invWS = wb.Sheets["invoices"];
    const itemsWS = wb.Sheets["items"];
    if (!invWS || !itemsWS) {
      return Response.json({ error: "ต้องมีชีตชื่อ invoices และ items" }, { status: 400 });
    }

    // อ่านทุกแถวเป็นอ็อบเจ็กต์ (เก็บค่าว่างเป็น "")
    const rawInvs = XLSX.utils.sheet_to_json<any>(invWS, { defval: "" });
    const rawItems = XLSX.utils.sheet_to_json<any>(itemsWS, { defval: "" });

    // แมปหัวคอลัมน์ไทย/อังกฤษ -> คีย์มาตรฐานที่โค้ดฝั่ง UI ต้องการ
    const mapInvoice = (r: any): InvoiceSheetRow => ({
      invoice_no: r["invoice_no"] ?? r["No."] ?? r["no"] ?? r["NO"] ?? "",
      date: toISODate(r["date"] ?? r["Date"] ?? r["วันที่"] ?? ""),
      client_name: r["client_name"] ?? r["Client"] ?? r["ลูกค้า"] ?? "",
      tax_id: r["tax_id"] ?? r["เลขประจำตัวผู้เสียภาษี"] ?? "",
      address: r["address"] ?? r["Address"] ?? "",
      contact_name: r["contact_name"] ?? r["ผู้ติดต่อ"] ?? "",
      contact_email: r["contact_email"] ?? r["email"] ?? "",
      contact_phone: r["contact_phone"] ?? r["โทร"] ?? "",
      job: r["job"] ?? r["Job"] ?? "",
    });

    const mapItem = (r: any): ItemSheetRow => ({
      invoice_no: r["invoice_no"] ?? r["No."] ?? r["no"] ?? r["NO"] ?? "",
      description: r["description"] ?? r["รายการ"] ?? "",
      qty: asNumber(r["qty"] ?? r["จำนวน"]),
      unit_price: asNumber(r["unit_price"] ?? r["ราคา / หน่วย"]),
    });

    const invRows = rawInvs.map(mapInvoice).filter((x) => (x.invoice_no || "").toString().trim() !== "");
    const itemRows = rawItems
      .map(mapItem)
      .filter((x) => (x.invoice_no || "").toString().trim() !== "" && (x.description || "").toString().trim() !== "");

    // จัดกลุ่ม items ตามใบเดียวกัน
    const byInv: Record<string, ReturnType<typeof calcItems>> = {};
    for (const it of calcItems(itemRows)) {
      const key = String(it.invoice_no);
      (byInv[key] ||= []).push(it);
    }

    const normalized: NormalizedInvoice[] = invRows.map((inv) => {
      const items = byInv[String(inv.invoice_no)] || [];
      const { subtotal, vat, total } = summarize(items, 0.07);
      return {
        ...inv,
        date: toISODate(inv.date), // ให้แน่ใจว่าเป็น string
        items,
        subtotal,
        vat,
        total,
      };
    });

    return Response.json(
      { invoices: normalized },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return Response.json({ error: e?.message || "เกิดข้อผิดพลาดระหว่างแปลงไฟล์" }, { status: 500 });
  }
}
