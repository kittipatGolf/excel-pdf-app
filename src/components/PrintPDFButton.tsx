"use client";
import type { NormalizedInvoice } from "@/lib/types";

type Seller = {
  name?: string; address?: string; tax_id?: string; phone?: string; email?: string; logoUrl?: string;
  bank_name?: string; bank_branch?: string; bank_account_type?: string; bank_account_name?: string; bank_account_no?: string;
};

const DEFAULT_SELLER: Required<Pick<Seller, "name" | "address" | "tax_id" | "phone" | "email" | "logoUrl">> = {
  name: "บริษัท ฆอระฆัง จำกัด",
  address: "98/38 ซอยสุขาภิบาล 5 ซอย 32 (วัดพรฯ) แขวงออเงิน เขตสายไหม กรุงเทพมหานคร 10220",
  tax_id: "0105558095465",
  phone: "086-6445965",
  email: "athip_kornkrang@yahoo.com",
  logoUrl: "/logo-placeholder.svg",
};

export default function PrintPDFButton({
  inv, seller, totalText,
}: { inv: NormalizedInvoice; seller?: Partial<Seller>; totalText?: string }) {
  async function handleClick() {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default as any;

    // ===== layout (px → mm @96dpi) =====
    const PX2MM = 0.264583;
    const page = { w: 210, h: 297 };
    const margin = 12;
    const contentW = page.w - margin * 2;

    const TW = {
      gray100: [243, 244, 246] as [number, number, number],
      gray300: [209, 213, 219] as [number, number, number],
      gray800: [31, 41, 55] as [number, number, number],
    };

    // from UI
    const GAP3 = 12 * PX2MM; // 12px
    const GAP4 = 16 * PX2MM; // 16px
    const GAP8 = 32 * PX2MM; // 32px
    const RIGHT130 = 130 * PX2MM;
    const LEFT1FR = contentW - RIGHT130 - GAP8;
    const LABEL60 = 60 * PX2MM;
    const LABEL115 = 115 * PX2MM;
    const COLON12 = 12 * PX2MM;

    // typography
    const SELLER_LH_MM = (1.15 * 16) * PX2MM; // leading-[1.15rem]
    const BODY_LH_MM = (14) * PX2MM;        // leading-[14px]
    const ROW_GAP_MM = (6) * PX2MM;        // space-y-[6px]

    const s = { ...DEFAULT_SELLER, ...(seller || {}) };
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    (doc as any).setLineHeightFactor?.(1.2);

    // font
    try {
      const reg = await fetchAsBase64("/fronts/Sarabun-Regular.ttf");
      const bold = await fetchAsBase64("/fronts/Sarabun-Bold.ttf");
      (doc as any).addFileToVFS("Sarabun-Regular.ttf", reg);
      (doc as any).addFileToVFS("Sarabun-Bold.ttf", bold);
      (doc as any).addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
      (doc as any).addFont("Sarabun-Bold.ttf", "Sarabun", "bold");
      doc.setFont("Sarabun", "normal");
    } catch { doc.setFont("helvetica", "normal"); }

    let y = margin;

    // ===== Header (โลโก้ + ข้อมูลบริษัท) =====
    const LOGO = 64 * PX2MM;
    try {
      doc.setDrawColor(...TW.gray300);
      doc.circle(margin + 8, y + 8, 8, "S");
      if (s.logoUrl) {
        const data = await toImageDataUrl(s.logoUrl as string);
        doc.addImage(data, "PNG", margin + 1.5, y + 1.5, 13, 13);
      }
    } catch { }

    const textX = margin + (LOGO + 12 * PX2MM);
    doc.setFontSize(9.75); doc.setFont("Sarabun", "bold");
    let curY = y + 2;
    doc.text(s.name, textX, curY);

    doc.setFont("Sarabun", "normal"); doc.setFontSize(9);
    const sellerParts = [
      s.address,
      `โทร. ${s.phone}  E-mail : ${s.email}`,
      `เลขประจำตัวผู้เสียภาษี ${s.tax_id} / สำนักงานใหญ่`,
    ];

    for (const part of sellerParts) {
      const lines = doc.splitTextToSize(part, 100);
      for (const ln of lines) {
        curY += SELLER_LH_MM;
        doc.text(ln, textX, curY);
      }
    }

    const sellerBottom = curY;
    const blockBottom = Math.max(y + LOGO, sellerBottom);

    // ===== Title (หัวเรื่อง) : กันชนบน/ล่าง 40px/40px =====
    const TITLE_TOP_PX = 40;
    const TITLE_BOTTOM_PX = 40;
    const TITLE_TOP_MM = TITLE_TOP_PX * PX2MM;
    const TITLE_BOTTOM_MM = TITLE_BOTTOM_PX * PX2MM;

    doc.setFont("Sarabun", "bold"); doc.setFontSize(15);
    const titleY = blockBottom + TITLE_TOP_MM;
    doc.text("ใบเสนอราคา / Quotation", page.w / 2, titleY, { align: "center" });
    y = titleY + TITLE_BOTTOM_MM;
    doc.setFont("Sarabun", "normal");

    // ===== helpers =====
    const drawLeftRow = (
      label: string, value: string, yRow: number, labelW = LABEL60, rightEdgeForMax = LEFT1FR
    ) => {
      doc.setFont("Sarabun", "bold"); doc.setFontSize(9);
      doc.setTextColor(...TW.gray800);
      doc.text(label, margin, yRow);
      doc.text(":", margin + labelW, yRow);
      doc.setFont("Sarabun", "normal"); doc.setTextColor(0, 0, 0);

      const maxW = rightEdgeForMax - (labelW + COLON12);
      const lines = doc.splitTextToSize(value || "-", maxW);
      let yy = yRow;
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) yy += BODY_LH_MM;
        doc.text(lines[i], margin + labelW + COLON12, yy);
      }
      const h = Math.max(BODY_LH_MM, lines.length * BODY_LH_MM);
      return { height: h };
    };

    const drawRightRow = (label: string, value: string, yRow: number, rightWidth = RIGHT130) => {
      const labelX = page.w - margin - rightWidth + 18 * PX2MM;
      doc.setFont("Sarabun", "bold"); doc.setFontSize(9);
      doc.setTextColor(...TW.gray800);
      doc.text(label, labelX, yRow, { align: "right" });
      doc.text(":", labelX + 6 * PX2MM, yRow);
      doc.setFont("Sarabun", "normal"); doc.setTextColor(0, 0, 0);
      doc.text(value || "-", page.w - margin, yRow, { align: "right" });
      return { height: BODY_LH_MM };
    };

    // Row 1: Client | No.
    const row1Y = y;
    const r1L = drawLeftRow("Client", inv.client_name || "-", row1Y);
    drawRightRow("No.", inv.invoice_no, row1Y);
    y = row1Y + Math.max(r1L.height, BODY_LH_MM) + ROW_GAP_MM;

    // Row 2: Address | Date
    const row2Y = y;
    const r2L = drawLeftRow("Address", inv.address || "-", row2Y);
    drawRightRow("Date", inv.date, row2Y, 138 * PX2MM);
    y = row2Y + Math.max(r2L.height, BODY_LH_MM) + ROW_GAP_MM;

    // Row 3: Tax ID
    const row3Y = y;
    const r3L = drawLeftRow("เลขประจำตัวผู้เสียภาษี", inv.tax_id || "-", row3Y, LABEL115);
    y = row3Y + r3L.height + ROW_GAP_MM;

    // Row 4: ผู้ติดต่อ | email | โทร
    const row4Y = y;
    const leftWidth = (contentW - RIGHT130 - 2 * GAP3) / 2;
    const midWidth = leftWidth;
    const midX = margin + leftWidth + GAP3;

    const r4L = drawLeftRow("ผู้ติดต่อ", inv.contact_name || "-", row4Y, LABEL60, leftWidth);

    doc.setFont("Sarabun", "bold"); doc.setFontSize(9); doc.setTextColor(...TW.gray800);
    doc.text("email", midX + LABEL60 - 1, row4Y, { align: "right" });
    doc.text(":", midX + LABEL60 + 1, row4Y);
    doc.setFont("Sarabun", "normal"); doc.setTextColor(0, 0, 0);
    const emailMaxW = midWidth - (LABEL60 + COLON12);
    const emailLines = doc.splitTextToSize(inv.contact_email || "-", emailMaxW);
    let emailY = row4Y;
    for (let i = 0; i < emailLines.length; i++) { if (i > 0) emailY += BODY_LH_MM; doc.text(emailLines[i], midX + LABEL60 + COLON12, emailY); }
    const r4MHeight = Math.max(BODY_LH_MM, emailLines.length * BODY_LH_MM);

    drawRightRow("โทร", inv.contact_phone || "-", row4Y);

    y = row4Y + Math.max(r4L.height, r4MHeight, BODY_LH_MM) + ROW_GAP_MM;

    // Row 5: Job
    const row5Y = y;
    const r5L = drawLeftRow("Job", inv.job || "-", row5Y);
    y = row5Y + r5L.height + 4;

    // ===== Items table =====
    const nf = (n: number) =>
      n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const tableW = contentW - 0.6;

    const colNo = 60 * PX2MM;
    const colQty = 70 * PX2MM;
    const colUnit = 140 * PX2MM;
    const colAmt = 130 * PX2MM;
    const colDesc = tableW - (colNo + colQty + colUnit + colAmt);

    const head = [[
      "ลำดับ\nNo", "รายการ\nDescription", "จำนวน\nQuantity", "ราคา / หน่วย\nUnit Price", "จำนวนเงิน\nAmount",
    ]];
    const body = inv.items.map((it, i) => [
      String(i + 1), it.description || "-", String(it.qty ?? ""), nf(it.unit_price ?? 0), nf(it.amount ?? (it.qty ?? 0) * (it.unit_price ?? 0)),
    ]);
    // ↓ เพิ่มตรงนี้
    const { default: html2canvas } = await import("html2canvas");

    // เรนเดอร์คำอธิบายแต่ละแถวเป็นรูปภาพ (ให้เบราว์เซอร์จัดวรรณยุกต์ไทยให้ก่อน)
    const descRenders = await Promise.all(
      inv.items.map(async (it) => {
        const text = (it.description || "-").toString();

        // ความกว้างเซลล์ Description เป็น px (html2canvas ใช้ px)
        const pxPerMm = 1 / PX2MM; // ≈ 3.78
        const widthPx = Math.max(2, Math.round(colDesc * pxPerMm));

        // ทำ element offscreen
        const host = document.createElement("div");
        host.style.position = "fixed";
        host.style.left = "-10000px";
        host.style.top = "0";
        host.style.width = `${widthPx}px`;
        host.style.fontFamily = "Sarabun, sans-serif";
        host.style.fontSize = "12px";       // ให้ใกล้ jsPDF fontSize 9
        host.style.lineHeight = "14px";       // ให้ใกล้ BODY_LH_MM
        host.style.whiteSpace = "pre-wrap";
        host.style.wordBreak = "break-word";
        host.style.color = "#000";
        host.textContent = text;
        document.body.appendChild(host);

        const canvas = await html2canvas(host, { backgroundColor: null, scale: 2, useCORS: true });
        document.body.removeChild(host);

        const dataUrl = canvas.toDataURL("image/png");
        // คำนวณความสูงรูป (หน่วย mm) เมื่อวางด้วยความกว้าง = colDesc
        const mmHeight = (canvas.height / canvas.width) * colDesc;
        return { dataUrl, mmHeight };
      })
    );


    autoTable(doc, {
      startY: y, head, body, theme: "grid",
      margin: { left: margin, right: margin }, tableWidth: tableW,
      styles: {
        font: "Sarabun", fontSize: 9, cellPadding: 2.4, overflow: "linebreak", valign: "top",
        lineWidth: 0.12, lineColor: TW.gray300, textColor: [0, 0, 0],
      },
      headStyles: {
        font: "Sarabun", fontStyle: "bold", fontSize: 9.5,
        fillColor: TW.gray100, textColor: [0, 0, 0],
        halign: "center", valign: "middle",
        cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
        lineWidth: 0.12, lineColor: TW.gray300,
      },
      columnStyles: {
        0: { cellWidth: colNo, halign: "center" },
        1: { cellWidth: colDesc, halign: "left" },
        2: { cellWidth: colQty, halign: "center" },
        3: { cellWidth: colUnit, halign: "right" },
        4: { cellWidth: colAmt, halign: "right" },
      },
      rowPageBreak: "auto",
      didDrawPage: () => {
        doc.setFont("Sarabun", "normal"); doc.setFontSize(9);
        doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, page.w - margin, page.h - 6, { align: "right" });
      },
    });

    const endY = (doc as any).lastAutoTable.finalY ?? y;

    // ===== Bottom section: เงื่อนไข (ซ้าย) + กล่องสรุป (ขวา) =====
    const TOP_OVERLAY_FIX = 0.00;       // ถ้าเส้นบนดูหนา/ซ้อน ให้ลองเป็น -0.05 หรือ -0.08
    let sectionTop = endY + TOP_OVERLAY_FIX;
    if (endY > page.h - margin - 42) { doc.addPage(); sectionTop = margin; }

    // ---- ซ้าย: เงื่อนไข (ข้อความคงที่) ----
    const condX = margin;
    const totalsWConst = (140 + 130) * PX2MM; // = colUnit + colAmt
    const condW = contentW - totalsWConst - (16 * PX2MM); // GAP4
    const COND_FS = 9;
    const COND_LH = (16 * PX2MM);
    let cy = sectionTop + 5;

    doc.setFont("Sarabun", "bold"); doc.setFontSize(COND_FS);
    doc.text("เงื่อนไขการชำระเงิน :", condX, cy);
    doc.setFont("Sarabun", "normal");

    const PAYMENT_LINES = [
      "ธนาคารกสิกรไทย สาขาเซ็นทรัลรัตนาธิเบศร์ ประเภทออมทรัพย์",
      "บัญชี บริษัท นอระชัง จำกัด เลขบัญชี 001-1-62095-7",
    ];
    for (const t of PAYMENT_LINES) {
      const wrapped = doc.splitTextToSize(t, condW);
      for (const w of wrapped) { cy += COND_LH; doc.text(w, condX, cy); }
    }

    // ---- ขวา: กล่องสรุปราคาให้ตรงคอลัมน์ท้ายตาราง ----
    const totalsW = totalsWConst;
    const totalsValW = 130 * PX2MM;
    const totalsLblW = totalsW - totalsValW;
    const totalsRight = margin + tableW;      // ขอบขวา = ขวาตารางจริง
    const totalsLeft = totalsRight - totalsW;
    const totalsMidX = totalsRight - totalsValW;

    const rowH = 8.6; // mm
    const rowsTop = sectionTop;

    doc.setDrawColor(...TW.gray300);
    doc.setLineWidth(0.12);
    // top ตรงกับเส้นล่างของตาราง
    doc.line(totalsLeft, rowsTop, totalsRight, rowsTop);
    // right
    doc.line(totalsRight, rowsTop, totalsRight, rowsTop + rowH * 3);
    // คั่นกลางตั้ง
    doc.line(totalsMidX, rowsTop, totalsMidX, rowsTop + rowH * 3);
    // คั่นนอน (เฉพาะฝั่งขวา)
    doc.line(totalsMidX, rowsTop + rowH, totalsRight, rowsTop + rowH);
    doc.line(totalsMidX, rowsTop + rowH * 2, totalsRight, rowsTop + rowH * 2);
    // ล่างของคอลัมน์ขวา
    doc.line(totalsMidX, rowsTop + rowH * 3, totalsRight, rowsTop + rowH * 3);

    const textPad = 2.8;
    const y1 = rowsTop + rowH - 2.1;
    const y2 = rowsTop + rowH * 2 - 2.1;
    const y3 = rowsTop + rowH * 3 - 2.1;

    doc.setFont("Sarabun", "normal"); doc.setFontSize(10);
    doc.text("รวมราคา", totalsLeft + totalsLblW - textPad, y1, { align: "right" });
    doc.text(nf(inv.subtotal ?? 0), totalsRight - textPad, y1, { align: "right" });
    doc.text("ภาษีมูลค่าเพิ่ม 7%", totalsLeft + totalsLblW - textPad, y2, { align: "right" });
    doc.text(nf(inv.vat ?? 0), totalsRight - textPad, y2, { align: "right" });
    doc.setFont("Sarabun", "bold");
    doc.text("รวมจำนวนเงินทั้งสิ้น", totalsLeft + totalsLblW - textPad, y3, { align: "right" });
    doc.text(nf(inv.total ?? 0), totalsRight - textPad, y3, { align: "right" });
    doc.setFont("Sarabun", "normal");


    if (totalText) {
      doc.setFont("Sarabun", "bold");
      doc.text(totalText, page.w / 2, rowsTop + rowH * 3 + 8, { align: "center", maxWidth: contentW });
      doc.setFont("Sarabun", "normal");
    }

    // ===== signatures =====
    const sigBase = rowsTop + rowH * 3 + 22;
    const needNew = sigBase > page.h - margin - 20;
    if (needNew) doc.addPage();
    const baseY = needNew ? margin : sigBase;
    doc.setFontSize(10);
    doc.text("ลงชื่อ ........................................ ผู้อนุมัติ", margin + 20, baseY);
    doc.text("(........................................)", margin + 30, baseY + 6);
    doc.text("ลงชื่อ ........................................ ผู้เสนอราคา", page.w / 2 + 20, baseY);
    doc.text("(........................................)", page.w / 2 + 30, baseY + 6);

    doc.save(`Quotation_${inv.invoice_no}.pdf`);
  }

  return (
    <button type="button" onClick={handleClick}
      className="rounded-md border px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50">
      บันทึกเป็น PDF
    </button>
  );
}

/* helpers */
async function fetchAsBase64(url: string): Promise<string> {
  const r = await fetch(url); if (!r.ok) throw new Error(url);
  const buf = await r.arrayBuffer(); const b = new Uint8Array(buf);
  let bin = ""; for (let i = 0; i < b.byteLength; i++) bin += String.fromCharCode(b[i]);
  return btoa(bin);
}
async function toImageDataUrl(url: string): Promise<string> {
  const r = await fetch(url); const blob = await r.blob();
  return await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.onerror = rej; fr.readAsDataURL(blob); });
}
