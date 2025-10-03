"use client";

import type { NormalizedInvoice } from "@/lib/types";
import ReceiptPreview from "@/components/receipt/ReceiptPreview";
import PrintPDFButton from "@/components/PrintPDFButton"; // <— ใช้ปุ่มที่คุณมีอยู่

export default function PreviewPane({ data }: { data: NormalizedInvoice[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border p-6 min-h-[360px] grid place-items-center text-gray-500">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border border-gray-200 bg-white grid place-items-center">🗎</div>
          <p>อัปโหลดไฟล์ Excel เพื่อดูตัวอย่างเอกสาร</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ปุ่มอยู่นอก #print-area และซ่อนตอนพิมพ์ */}
      <div className="mb-2 flex justify-end print:hidden">
        <PrintPDFButton />
      </div>

      {/* กล่องพรีวิว: จะถูก “unbox” ตอนพิมพ์ด้วย .print-unbox ตามที่ตั้งใน globals.css */}
      <div className="rounded-2xl border p-4 overflow-auto print-unbox">
        {/* โซนที่จะพิมพ์จริง ๆ  */}
        <div id="print-area">
          <ReceiptPreview inv={data[0]} />
        </div>
      </div>
    </div>
  );
}
