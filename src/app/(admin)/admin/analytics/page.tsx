import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Analytics",
};

export default function PlatformAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>
      <p className="text-muted-foreground">
        Platform-wide statistics and metrics.
      </p>
    </div>
  );
}
