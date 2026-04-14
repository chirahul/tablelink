import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tables & QR Codes",
};

export default function TablesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tables & QR Codes</h1>
      <p className="text-muted-foreground">
        Manage your tables and generate QR codes here.
      </p>
    </div>
  );
}
