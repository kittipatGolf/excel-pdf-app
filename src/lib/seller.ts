export type Seller = {
  name: string;
  address: string;
  tax_id?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
};

export const defaultSeller: Seller = {
  name: "บริษัท นอระชัง จำกัด",
  address: "98/38 ซอยบุญกว้าง 5 ซอย 32 (รำหงษ์) แขวงจอมทอง เขตดอนเมือง กรุงเทพฯ 10220",
  tax_id: "0105558095465",
  phone: "086-6445965",
  email: "athip_kornkrang@yahoo.com",
  logoUrl: "/logo-placeholder.svg", // เปลี่ยนเป็นโลโก้จริงได้
};
