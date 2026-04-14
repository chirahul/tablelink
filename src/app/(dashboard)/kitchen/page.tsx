"use client";

import type { Metadata } from "next";

export default function KitchenPage() {
  return (
    <div className="h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kitchen Display</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
        {/* New Orders Column */}
        <div className="border rounded-lg p-4 bg-yellow-50">
          <h2 className="font-semibold text-yellow-800 mb-3">New (0)</h2>
          <p className="text-sm text-muted-foreground">
            New orders will appear here
          </p>
        </div>

        {/* Preparing Column */}
        <div className="border rounded-lg p-4 bg-orange-50">
          <h2 className="font-semibold text-orange-800 mb-3">Preparing (0)</h2>
          <p className="text-sm text-muted-foreground">
            Orders being prepared
          </p>
        </div>

        {/* Ready Column */}
        <div className="border rounded-lg p-4 bg-green-50">
          <h2 className="font-semibold text-green-800 mb-3">Ready (0)</h2>
          <p className="text-sm text-muted-foreground">
            Orders ready to serve
          </p>
        </div>
      </div>
    </div>
  );
}
