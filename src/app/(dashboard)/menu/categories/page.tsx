import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <p className="text-muted-foreground">
        Manage your menu categories here.
      </p>
    </div>
  );
}
