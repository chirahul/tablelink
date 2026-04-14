import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Restaurants",
};

export default function ManageRestaurantsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
      <p className="text-muted-foreground">
        View and manage all restaurants on the platform.
      </p>
    </div>
  );
}
