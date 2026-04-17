"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type OrderCard = {
  id: string;
  label: string;
  status: "new" | "preparing" | "ready" | "served";
};

const INITIAL_ORDERS: OrderCard[] = [
  { id: "1", label: "ORD-042 Table 5", status: "new" },
  { id: "2", label: "ORD-043 Table 2", status: "new" },
  { id: "3", label: "ORD-040 Table 3", status: "preparing" },
  { id: "4", label: "ORD-041 Table 1", status: "preparing" },
  { id: "5", label: "ORD-039 Table 7", status: "ready" },
  { id: "6", label: "ORD-038 Table 4", status: "served" },
];

const COLUMNS = [
  { key: "new" as const, title: "New", accent: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  { key: "preparing" as const, title: "Preparing", accent: "bg-orange-50 border-orange-200 text-orange-800" },
  { key: "ready" as const, title: "Ready", accent: "bg-green-50 border-green-200 text-green-800" },
  { key: "served" as const, title: "Served", accent: "bg-gray-50 border-gray-200 text-gray-600" },
];

const NEXT_STATUS: Record<string, OrderCard["status"]> = {
  new: "preparing",
  preparing: "ready",
  ready: "served",
  served: "new",
};

export function AnimatedKitchen() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Move one random order to the next status every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => {
        const movable = prev.filter((o) => o.status !== "served");
        if (movable.length === 0) {
          // Reset served orders back to new
          return prev.map((o) =>
            o.status === "served" ? { ...o, status: "new" as const } : o
          );
        }
        const target = movable[Math.floor(Math.random() * movable.length)];
        return prev.map((o) =>
          o.id === target.id
            ? { ...o, status: NEXT_STATUS[o.status] }
            : o
        );
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/40">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-[10px] text-muted-foreground font-mono opacity-60">
          tablelink.app/kitchen
        </span>
      </div>

      {/* Kanban */}
      <div className="p-3 md:p-5">
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.key);
            return (
              <div
                key={col.key}
                className={`rounded-lg border ${col.accent} p-1.5 md:p-2 min-h-[100px] md:min-h-[140px]`}
              >
                <div className="flex items-center justify-between text-[10px] md:text-xs font-semibold mb-1.5 md:mb-2 px-1">
                  <span>{col.title}</span>
                  <span className="opacity-50">{colOrders.length}</span>
                </div>
                <AnimatePresence mode="popLayout">
                  {colOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 },
                      }}
                      className="bg-card rounded border p-1 md:p-1.5 text-[9px] md:text-[11px] leading-snug mb-1 md:mb-1.5 truncate shadow-sm"
                    >
                      {order.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
