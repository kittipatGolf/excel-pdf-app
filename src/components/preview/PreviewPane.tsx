"use client";

import type { NormalizedInvoice } from "@/lib/types";
import InvoicePreviewTable from "@/components/table/InvoicePreviewTable";

export default function PreviewPane({ data }: { data: NormalizedInvoice[] | null }) {
  return (
    <div className="rounded-2xl border p-6 min-h-[360px]">
      {data && data.length > 0 ? (
        <InvoicePreviewTable data={data} />
      ) : (
        <div className="flex h-full min-h-[300px] items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="text-gray-400">
                <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 1.5L19.5 8H15zM8 13h8v1.5H8zm0 3h8V18H8zM8 10h5v1.5H8z"/>
              </svg>
            </div>
            <p>อัปโหลดไฟล์ Excel เพื่อดูตัวอย่างเอกสาร</p>
          </div>
        </div>
      )}
    </div>
  );
}
