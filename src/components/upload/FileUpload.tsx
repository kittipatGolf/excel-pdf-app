"use client";

import { useState } from "react";
import type { NormalizedInvoice } from "@/lib/types";

type Props = {
    // API /api/import คืน { invoices: NormalizedInvoice[] }
    onUploaded: (data: { invoices: NormalizedInvoice[] }) => void;
};

export default function FileUpload({ onUploaded }: Props) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setBusy(true); setError(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/import", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Upload failed");
            onUploaded(json);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center">
            <input id="excel-input" type="file" accept=".xlsx,.xls" onChange={onChange} className="hidden" />
            <label htmlFor="excel-input" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">
                เลือกไฟล์ Excel
            </label>
            {busy && <p className="mt-3 text-gray-500">กำลังอัปโหลด/แปลงข้อมูล…</p>}
            {error && <p className="mt-3 text-red-600">{error}</p>}
            <p className="mt-2 text-xs text-gray-500">คาดหวังชีต: <code>invoices</code>, <code>items</code></p>
        </div>
    );
}
