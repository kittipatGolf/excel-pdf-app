import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import { calcItems, summarize } from "@/lib/calc";
import type { InvoiceSheetRow, ItemSheetRow, NormalizedInvoice } from "@/lib/types";

export const runtime = "nodejs";

const InvoiceRow = z.object({
    invoice_no: z.string().min(1),
    date: z.string().min(1),
    client_name: z.string().min(1),
    tax_id: z.union([z.string(), z.number()]).optional().transform(v => (v ?? "").toString()),
    address: z.string().optional().default(""),
});

const ItemRow = z.object({
    invoice_no: z.string().min(1),
    description: z.string().min(1),
    qty: z.coerce.number(),
    unit_price: z.coerce.number(),
});

// ============ Helpers ============

// ทำให้ชื่ออ่านง่ายขึ้นเวลาเทียบ
const norm = (s: string) => s.toLowerCase().replace(/[\s_\/\-\.]+/g, "");

// หาชีตตามชื่อที่เป็นไปได้ (ไม่สนช่องว่าง/ตัวเล็กใหญ่)
function getSheetByCandidates(wb: XLSX.WorkBook, candidates: string[]) {
    const dict = new Map(wb.SheetNames.map(n => [norm(n), n]));
    for (const c of candidates) {
        const real = dict.get(norm(c));
        if (real) return wb.Sheets[real];
    }
    return undefined;
}

// อ่าน header แถวแรกของชีต
function getHeaders(ws: XLSX.WorkSheet): string[] {
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, blankrows: false });
    return (rows[0] ?? []).map(h => String(h));
}

// map “ชื่อคีย์มาตรฐาน” → “หัวคอลัมน์จริงในไฟล์”
function resolveColumns(headers: string[], synonyms: Record<string, string[]>) {
    const found: Record<string, string | undefined> = {};
    const nheaders = headers.map(h => ({ raw: h, n: norm(h) }));
    for (const [canonical, alts] of Object.entries(synonyms)) {
        const targetSet = new Set(alts.map(norm));
        const hit = nheaders.find(h => targetSet.has(h.n));
        if (hit) found[canonical] = hit.raw;
    }
    return found;
}

// ============ ชื่อที่รองรับ ============

const INVOICE_SHEET_NAMES = ["invoices", "invoice", "ใบแจ้งหนี้", "ใบกำกับ", "ลูกค้า"];
const ITEM_SHEET_NAMES = ["items", "item", "รายการ", "รายละเอียด", "สินค้า", "services", "lines", "lineitems"];

// หัวคอลัมน์ที่รองรับ (ซ้าย = ชื่อมาตรฐานที่โค้ดต้องการ)
const INVOICE_SYNONYMS: Record<string, string[]> = {
    invoice_no: ["invoice_no", "invoiceno", "เลขที่ใบ", "เลขที่ใบกำกับ", "เลขที่เอกสาร", "เลขที่", "invno"],
    date: ["date", "วันที่", "invoice_date"],
    client_name: ["client_name", "client", "customer", "buyer", "ลูกค้า", "ชื่อลูกค้า", "ผู้ซื้อ"],
    tax_id: ["tax_id", "taxid", "vatid", "เลขผู้เสียภาษี", "เลขประจำตัวผู้เสียภาษี"],
    address: ["address", "addr", "ที่อยู่"],
};

const ITEM_SYNONYMS: Record<string, string[]> = {
    invoice_no: ["invoice_no", "invoiceno", "เลขที่ใบ", "เลขที่เอกสาร", "invno"],
    description: ["description", "desc", "รายละเอียด", "รายการ", "สินค้า/บริการ", "รายการสินค้า", "บริการ"],
    qty: ["qty", "quantity", "จำนวน", "ปริมาณ"],
    unit_price: ["unit_price", "unitprice", "price", "ราคาต่อหน่วย", "ราคา/หน่วย", "ราคา"],
};

// ============ Handler ============

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const file = form.get("file") as File | null;
        if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

        const buf = Buffer.from(await file.arrayBuffer());
        const wb = XLSX.read(buf, { type: "buffer" });

        // 1) หา sheet ตามชื่อที่เป็นไปได้
        let invSheet = getSheetByCandidates(wb, INVOICE_SHEET_NAMES);
        let itemSheet = getSheetByCandidates(wb, ITEM_SHEET_NAMES);

        // 2) ถ้าไม่เจอ ลองเดาจาก header
        if (!invSheet || !itemSheet) {
            for (const name of wb.SheetNames) {
                const ws = wb.Sheets[name];
                const headers = getHeaders(ws);

                const invCols = resolveColumns(headers, INVOICE_SYNONYMS);
                const invOk = invCols.invoice_no && invCols.date && invCols.client_name;

                const itemCols = resolveColumns(headers, ITEM_SYNONYMS);
                const itemOk = itemCols.invoice_no && itemCols.description && itemCols.qty && itemCols.unit_price;

                if (!invSheet && invOk) invSheet = ws;
                if (!itemSheet && itemOk) itemSheet = ws;
            }
        }

        if (!invSheet || !itemSheet) {
            return NextResponse.json(
                {
                    error: "Missing sheets: invoices / items",
                    availableSheets: wb.SheetNames,
                    tip: "ตั้งชื่อชีตเป็น invoices และ items หรือให้หัวคอลัมน์ตรงกับที่ระบบรองรับ",
                },
                { status: 400 }
            );
        }

        // ===== แปลง invoices ด้วยการแมปหัวคอลัมน์ =====
        const invHeaders = getHeaders(invSheet);
        const invMap = resolveColumns(invHeaders, INVOICE_SYNONYMS);
        const invoicesRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(invSheet, { defval: "" });
        const invoices: InvoiceSheetRow[] = invoicesRaw.map((r) =>
            InvoiceRow.parse({
                invoice_no: String(r[invMap.invoice_no ?? "invoice_no"] ?? ""),
                date: String(r[invMap.date ?? "date"] ?? ""),
                client_name: String(r[invMap.client_name ?? "client_name"] ?? ""),
                tax_id: r[invMap.tax_id ?? "tax_id"] ?? "",
                address: String(r[invMap.address ?? "address"] ?? ""),
            })
        );

        // ===== แปลง items ด้วยการแมปหัวคอลัมน์ =====
        const itemHeaders = getHeaders(itemSheet);
        const itemMap = resolveColumns(itemHeaders, ITEM_SYNONYMS);
        const itemsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(itemSheet, { defval: "" });
        const items: ItemSheetRow[] = itemsRaw.map((r) =>
            ItemRow.parse({
                invoice_no: String(r[itemMap.invoice_no ?? "invoice_no"] ?? ""),
                description: String(r[itemMap.description ?? "description"] ?? ""),
                qty: r[itemMap.qty ?? "qty"],
                unit_price: r[itemMap.unit_price ?? "unit_price"],
            })
        );

        // group items by invoice_no
        const map = new Map<string, ItemSheetRow[]>();
        for (const it of items) {
            const arr = map.get(it.invoice_no) ?? [];
            arr.push(it);
            map.set(it.invoice_no, arr);
        }

        const normalized: NormalizedInvoice[] = invoices.map((inv) => {
            const its = calcItems(map.get(inv.invoice_no) ?? []);
            const sums = summarize(its, 0.07);
            return {
                invoice_no: inv.invoice_no,
                date: inv.date,
                client_name: inv.client_name,
                tax_id: inv.tax_id || "",
                address: inv.address || "",
                items: its,
                ...sums,
            };
        });

        return NextResponse.json({ invoices: normalized });
    } catch (e: unknown) {
        console.error(e);
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
