import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <p className="text-muted-foreground">
        Sales reports and analytics will be displayed here.
      </p>
    </div>
  );
}
