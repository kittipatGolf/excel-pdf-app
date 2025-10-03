"use client";

import { fmt } from "@/lib/calc";
import type { NormalizedInvoice } from "@/lib/types";
import { useState } from "react";

type Props = { data: NormalizedInvoice[] };

export default function InvoicePreviewTable({ data }: Props) {
    const [open, setOpen] = useState<Record<string, boolean>>({});

    return (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left">
                        <th className="px-4 py-3">Invoice No</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-4 py-3 text-right">VAT 7%</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(inv => (
                        <FragmentRow
                            key={inv.invoice_no}
                            inv={inv}
                            open={!!open[inv.invoice_no]}
                            toggle={() => setOpen(p => ({ ...p, [inv.invoice_no]: !p[inv.invoice_no] }))}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FragmentRow({ inv, open, toggle }: { inv: NormalizedInvoice; open: boolean; toggle: () => void; }) {
    return (
        <>
            <tr className="border-t">
                <td className="px-4 py-3">{inv.invoice_no}</td>
                <td className="px-4 py-3">{inv.client_name}</td>
                <td className="px-4 py-3">{inv.date}</td>
                <td className="px-4 py-3 text-right">{fmt(inv.subtotal)}</td>
                <td className="px-4 py-3 text-right">{fmt(inv.vat)}</td>
                <td className="px-4 py-3 text-right font-medium">{fmt(inv.total)}</td>
                <td className="px-4 py-3 text-right">
                    <button onClick={toggle} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">
                        {open ? "Hide items" : "Show items"}
                    </button>
                </td>
            </tr>
            {open && (
                <tr className="bg-gray-50">
                    <td className="px-4 pb-4 pt-0" colSpan={7}>
                        <div className="mt-2 overflow-x-auto">
                            <table className="min-w-full text-xs">
                                <thead>
                                    <tr className="text-left">
                                        <th className="px-2 py-2">Description</th>
                                        <th className="px-2 py-2 text-right">Qty</th>
                                        <th className="px-2 py-2 text-right">Unit Price</th>
                                        <th className="px-2 py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inv.items.map((it, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-2 py-2">{it.description}</td>
                                            <td className="px-2 py-2 text-right">{it.qty}</td>
                                            <td className="px-2 py-2 text-right">{fmt(it.unit_price)}</td>
                                            <td className="px-2 py-2 text-right">{fmt(it.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
