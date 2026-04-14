import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Management",
};

export default function MenuManagementPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your menu categories and items here.
      </p>
    </div>
  );
}
