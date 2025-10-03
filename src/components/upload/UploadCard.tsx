"use client";

import { useState, useCallback } from "react";
import type { NormalizedInvoice } from "@/lib/types";

type Props = {
  onUploaded: (data: { invoices: NormalizedInvoice[] }) => void;
  maxSizeMB?: number;
};

export default function UploadCard({ onUploaded, maxSizeMB = 10 }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const acceptExt = [".xlsx", ".xls"];

  const handleFiles = useCallback(async (file: File) => {
    if (!file) return;
    if (!acceptExt.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setError("รองรับเฉพาะ .xlsx หรือ .xls");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`ไฟล์ใหญ่เกิน ${maxSizeMB}MB`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onUploaded(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }, [maxSizeMB, onUploaded]);

  // input แบบซ่อนไว้
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void handleFiles(f);
    // reset เพื่อให้เลือกไฟล์เดิมซ้ำได้
    e.currentTarget.value = "";
  }

  // drag & drop
  function onDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div
      onDragEnter={(e) => { onDrag(e); setDragOver(true); }}
      onDragOver={onDrag}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        onDrag(e);
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFiles(file);
      }}
      className={`rounded-2xl border border-dashed p-8 text-center transition-colors ${
        dragOver ? "border-green-500 bg-green-50" : "border-gray-300"
      }`}
      aria-label="อัปโหลดไฟล์ Excel"
    >
      {/* ไอคอนไฟล์เล็กๆ */}
      <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-gray-200 bg-white flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden className="text-gray-400">
          <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 1.5L19.5 8H15zM8 13h8v1.5H8zm0 3h8V18H8zM8 10h5v1.5H8z"/>
        </svg>
      </div>

      <p className="text-lg font-semibold">อัปโหลดไฟล์ Excel</p>
      <p className="mt-1 text-sm text-gray-500">
        ลากไฟล์ Excel มาวางที่นี่ หรือ{" "}
        <label className="text-blue-600 underline cursor-pointer">
          เลือกไฟล์
          <input type="file" accept={acceptExt.join(",")} className="hidden" onChange={onInputChange} />
        </label>
      </p>

      <div className="mt-4">
        <a
          href="/api/template"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 3v10.586l3.293-3.293l1.414 1.414L12 17.414l-4.707-4.707l1.414-1.414L11 13.586V3zM5 19h14v2H5z"/></svg>
          ดาวน์โหลด Template Excel
        </a>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        รองรับไฟล์ <code>.xlsx</code> และ <code>.xls</code> ขนาดไม่เกิน {maxSizeMB}MB<br />
        <span className="opacity-80">แนะนำ: ใช้ไฟล์ .xlsx เพื่อรองรับภาษาไทย 100%</span>
      </p>

      {busy && <p className="mt-4 text-gray-600">กำลังอัปโหลด/แปลงข้อมูล…</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
    </div>
  );
}
