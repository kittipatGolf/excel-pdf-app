import type { NormalizedInvoice } from "@/lib/types";
import { fmt } from "@/lib/calc";

type Seller = {
    name: string;
    address: string;
    tax_id?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;

    bank_name?: string;
    bank_branch?: string;
    bank_account_type?: string;
    bank_account_name?: string;
    bank_account_no?: string;
};

const DEFAULT_SELLER: Seller = {
    name: "บริษัท ฆอระฆัง จำกัด",
    address:
        "98/38 ซอยสุขาภิบาล 5 ซอย 32 (วัดพรฯ) แขวงออเงิน เขตสายไหม กรุงเทพมหานคร 10220",
    tax_id: "0105558095465",
    phone: "086-6445965",
    email: "athip_kornkrang@yahoo.com",
    logoUrl: "/logo-placeholder.svg",

    bank_name: "กสิกรไทย",
    bank_branch: "เซ็นทรัลรัตนาธิเบศร์",
    bank_account_type: "ออมทรัพย์",
    bank_account_name: "บริษัท นอระชัง จำกัด",
    bank_account_no: "001-1-62095-7",
};

export default function ReceiptPreview({
    inv,
    seller,
    totalText,
}: {
    inv: NormalizedInvoice;
    seller?: Partial<Seller>;
    totalText?: string;
}) {
    const s = { ...DEFAULT_SELLER, ...(seller || {}) };

    return (
        <div className="mx-auto w-[210mm] min-h-[297mm] bg-white p-[12mm] shadow-sm ring-1 ring-gray-200 print:shadow-none print:ring-0 print:mx-0">
            {/* --- Header --- */}
            <div className="grid grid-cols-[1fr_auto_200px] items-start gap-4">
                {/* ซ้าย: โลโก้ + ข้อมูลผู้ขาย */}
                <div className="flex gap-3">
                    <div className="h-16 w-16 rounded-full border border-gray-300 overflow-hidden grid place-items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.logoUrl} alt="logo" className="h-12 w-12 object-contain" />
                    </div>
                    <div className="text-[12px] leading-[1.15rem]">
                        <div className="font-bold text-[13px]">{s.name}</div>
                        <div>{s.address}</div>
                        <div>
                            โทร. {s.phone || "-"}&nbsp; E-mail : {s.email || "-"}
                        </div>
                        {s.tax_id && (
                            <div>เลขประจำตัวผู้เสียภาษี {s.tax_id} / สำนักงานใหญ่</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-15 flex items-center justify-center">
                <div className="text-xl font-bold">ใบเสนอราคา / Quotation</div>
            </div>

            {/* ===== Client block ===== */}
            <div className="mt-2 space-y-[6px] text-[12px] leading-none">
                {/* Row 1: Client | No. */}
                <div className="grid grid-cols-[1fr_130px] gap-x-8">
                    <div className="grid grid-cols-[60px_12px_1fr] items-center">
                        <div className="font-semibold text-gray-800 leading-[14px]">Client</div>
                        <div className="leading-[14px]">:</div>
                        <div className="border-gray-300 pb-[1px] leading-[14px]">
                            {inv.client_name}
                        </div>
                    </div>
                    <div className="grid grid-cols-[auto_12px_1fr] items-center">
                        <div className="font-semibold text-gray-800 leading-[14px] text-right">
                            No.
                        </div>
                        <div className="text-center">:</div>
                        <div className="text-right font-semibold leading-[14px]">
                            {inv.invoice_no}
                        </div>
                    </div>
                </div>

                {/* Row 2: Address | Date */}
                <div className="grid grid-cols-[1fr_138px] gap-x-8">
                    <div className="grid grid-cols-[60px_12px_1fr] items-center">
                        <div className="font-semibold text-gray-800 leading-[14px]">Address</div>
                        <div className="leading-[14px]">:</div>
                        <div className="border-gray-300 pb-[1px] leading-[14px] break-words">
                            {inv.address || "-"}
                        </div>
                    </div>
                    <div className="grid grid-cols-[auto_12px_1fr] items-center">
                        <div className="font-semibold text-gray-800 leading-[14px] text-right">
                            Date
                        </div>
                        <div className="text-center">:</div>
                        <div className="text-right leading-[14px]">{inv.date}</div>
                    </div>
                </div>

                {/* Row 3: Tax ID */}
                <div className="grid grid-cols-[1fr_204px] gap-x-8">
                    <div className="grid grid-cols-[115px_12px_1fr] items-center">
                        <div className="font-semibold text-gray-800 leading-[14px] whitespace-nowrap">
                            เลขประจำตัวผู้เสียภาษี
                        </div>
                        <div className="text-center">:</div>
                        <div className="leading-[14px] whitespace-nowrap">{inv.tax_id || "-"}</div>
                    </div>
                </div>

                {/* Row 4: contact | email | phone */}
                <div className="grid grid-cols-[1fr_1fr_130px] gap-x-3">
                    <div className="grid grid-cols-[60px_12px_1fr] items-center">
                        <div className="font-semibold text-gray-800 leading-[14px] whitespace-nowrap">
                            ผู้ติดต่อ
                        </div>
                        <div className="leading-[14px]">:</div>
                        <div className="leading-[14px] whitespace-nowrap">
                            {inv.contact_name || "-"}
                        </div>
                    </div>
                    <div className="grid grid-cols-[60px_12px_1fr] items-center">
                        <div className="font-semibold text-gray-800 leading-[14px] text-right">
                            email
                        </div>
                        <div className="text-center">:</div>
                        <div className="border-gray-300 leading-[14px] min-w-[210px]">
                            {inv.contact_email || "-"}
                        </div>
                    </div>
                    <div className="grid grid-cols-[auto_10px_1fr] items-center">
                        <div className="font-semibold text-gray-800">โทร</div>
                        <div className="text-center">:</div>
                        <div className="text-right leading-[14px]">
                            {inv.contact_phone || "-"}
                        </div>
                    </div>
                </div>

                {/* Row 5: Job */}
                <div className="grid grid-cols-[60px_12px_1fr] items-center">
                    <div className="font-semibold text-gray-800 leading-[14px]">Job</div>
                    <div className="leading-[14px]">:</div>
                    <div className="border-gray-300 pb-[1px] leading-[14px]">
                        {inv.job || "-"}
                    </div>
                </div>
            </div>

            {/* --- Items table (1 รายการ = 1 แถว: คงรูปแบบเดิม) --- */}
            <div className="mt-4">
                <table className="w-full table-fixed border border-gray-300 text-[12px]">
                    <colgroup>
                        <col className="w-[60px]" />
                        <col />
                        <col className="w-[70px]" />
                        <col className="w-[140px]" />
                        <col className="w-[130px]" />
                    </colgroup>

                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-r border-gray-300 py-2">
                                ลำดับ
                                <br />
                                No
                            </th>
                            <th className="border-r border-gray-300 py-2">
                                รายการ
                                <br />
                                Description
                            </th>
                            <th className="border-r border-gray-300 py-2">
                                จำนวน
                                <br />
                                Quantity
                            </th>
                            <th className="border-r border-gray-300 py-2">
                                ราคา / หน่วย
                                <br />
                                Unit Price
                            </th>
                            <th className="py-2">
                                จำนวนเงิน
                                <br />
                                Amount
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {inv.items.map((it, idx) => (
                            <tr
                                key={idx}
                                className="border-t border-gray-300 align-top"
                                style={{
                                    // อนุญาตให้ตาราง “แหวกหน้า” ได้เมื่อ cell สูงเกิน A4
                                    pageBreakInside: "auto",
                                    breakInside: "auto",
                                }}
                            >
                                <td className="border-r border-gray-300 py-2 text-center">
                                    {idx + 1}
                                </td>

                                {/* คง description แบบเดิม แต่ให้ wrap ได้ดีขึ้น */}
                                <td className="border-r border-gray-300 py-2 px-2 whitespace-pre-wrap break-words leading-tight">
                                    {it.description}
                                </td>

                                <td className="border-r border-gray-300 py-2 text-center">
                                    {it.qty}
                                </td>
                                <td className="border-r border-gray-300 py-2 text-right pr-2">
                                    {fmt(it.unit_price)}
                                </td>
                                <td className="py-2 text-right pr-2 font-medium">
                                    {fmt(it.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-[1fr_300px] gap-4">
                {/* ซ้าย: เงื่อนไขการชำระเงิน */}
                <div className="py-2 text-[12px] leading-[16px]">
                    <div className="font-semibold text-gray-800 mb-1">
                        เงื่อนไขการชำระเงิน :
                    </div>
                    <div>
                        ธนาคาร{s.bank_name || "-"}
                        {s.bank_branch ? ` สาขา${s.bank_branch}` : ""}
                        {s.bank_account_type ? ` ประเภท${s.bank_account_type}` : ""}
                    </div>
                    <div className="mt-0.5">
                        บัญชี {s.bank_account_name || "-"} เลขบัญชี {s.bank_account_no || "-"}
                    </div>
                </div>

                {/* ขวา: รวมราคา */}
                <div className="ml-auto w-full -mt-px">
                    <div className="border-t border-r border-gray-300">
                        <div className="grid grid-cols-[1fr_130px] text-[12px]">
                            <div className="px-3 py-2 text-right">รวมราคา</div>
                            <div className="px-3 py-2 text-right font-medium border-l border-gray-300">
                                {fmt(inv.subtotal)}
                            </div>

                            <div className="px-3 py-2 text-right">ภาษีมูลค่าเพิ่ม 7%</div>
                            <div className="px-3 py-2 text-right font-medium border-l border-gray-300">
                                {fmt(inv.vat)}
                            </div>

                            <div className="px-3 py-2 text-right font-semibold">
                                รวมจำนวนเงินทั้งสิ้น
                            </div>
                            <div className="px-3 py-2 text-right font-bold border-l border-b border-gray-300">
                                {fmt(inv.total)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 text-center font-bold text-[14px] leading-tight">
                        {totalText || "-"}
                    </div>
                </div>
            </div>

            {/* --- Footer / ลายเซ็น --- */}
            <div className="mt-30 grid grid-cols-2 gap-6 text-[12px]">
                <div>
                    <div className="text-center">
                        ลงชื่อ ........................................ ผู้อนุมัติ
                    </div>
                    <div className="text-center mt-1">(........................................)</div>
                </div>
                <div className="text-center">
                    <div>ลงชื่อ ........................................ ผู้เสนอราคา</div>
                    <div className="text-center mt-1">(........................................)</div>
                </div>
            </div>
        </div>
    );
}
