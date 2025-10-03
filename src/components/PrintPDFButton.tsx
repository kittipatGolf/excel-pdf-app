"use client";

export default function PrintPDFButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md border px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50"
    >
      บันทึกเป็น PDF
    </button>
  );
}
