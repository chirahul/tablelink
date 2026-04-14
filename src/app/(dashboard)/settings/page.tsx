import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Restaurant Settings</h1>
      <p className="text-muted-foreground">
        Manage your restaurant profile, payment settings, and more.
      </p>
    </div>
  );
}
