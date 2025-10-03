import "./globals.css";
import type { Metadata } from "next";
import { Sarabun } from "next/font/google";

const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400", "700"] });

export const metadata: Metadata = { title: "excel-pdf-app" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={sarabun.className}>{children}</body>
    </html>
  );
}
