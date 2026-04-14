import type { Metadata } from "next";
import { getCurrentRestaurant } from "@/lib/get-current-restaurant";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const restaurant = await getCurrentRestaurant();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your restaurant profile, payment settings, and tax.
      </p>
      <SettingsForm restaurant={restaurant} />
    </div>
  );
}
