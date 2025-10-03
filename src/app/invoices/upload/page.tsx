"use client";

import { useState } from "react";
import type { NormalizedInvoice } from "@/lib/types";
import UploadCard from "@/components/upload/UploadCard";
import PreviewPane from "@/components/preview/PreviewPane";

export default function UploadPage() {
  const [invoices, setInvoices] = useState<NormalizedInvoice[] | null>(null);

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold">อัปโหลดข้อมูล</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <UploadCard onUploaded={(d) => setInvoices(d.invoices)} />
          </section>
          <section className="lg:col-span-1">
            <div className="border-2 border-blue-400 rounded-2xl p-2">
              <PreviewPane data={invoices} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
