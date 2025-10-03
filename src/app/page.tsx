import Link from "next/dist/client/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Link href="/invoices/upload">Upload Excel</Link>
    </div>
  );
}
