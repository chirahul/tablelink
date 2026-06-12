"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Store, Receipt, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { searchAdmin, type SearchResults } from "@/app/(admin)/search-actions";

const EMPTY: SearchResults = { restaurants: [], orders: [] };

export function AdminSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<SearchResults>(EMPTY);
  const [pending, start] = useTransition();

  // ⌘K / Ctrl-K toggles the palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search while open.
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (!term) {
      setRes(EMPTY);
      return;
    }
    const t = setTimeout(() => start(async () => setRes(await searchAdmin(term))), 200);
    return () => clearTimeout(t);
  }, [q, open]);

  function go(href: string) {
    setOpen(false);
    setQ("");
    setRes(EMPTY);
    router.push(href);
  }

  const hasResults = res.restaurants.length > 0 || res.orders.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full rounded-xl border bg-muted/40 px-3 h-10 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search restaurants, orders…</span>
        <kbd className="text-[10px] border rounded px-1.5 py-0.5 bg-background">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-xl top-[20%] translate-y-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4 h-12">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by restaurant name or order #…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {pending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {!q.trim() && (
              <p className="text-sm text-muted-foreground px-3 py-6 text-center">
                Type to search restaurants or order numbers.
              </p>
            )}
            {q.trim() && !pending && !hasResults && (
              <p className="text-sm text-muted-foreground px-3 py-6 text-center">
                No results for “{q.trim()}”.
              </p>
            )}

            {res.restaurants.length > 0 && (
              <div className="mb-1">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Restaurants
                </div>
                {res.restaurants.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => go(`/admin/restaurants/${r.id}`)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent text-left transition-colors"
                  >
                    <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 min-w-0 truncate">{r.name}</span>
                    <span className="text-[11px] text-muted-foreground capitalize">{r.status}</span>
                  </button>
                ))}
              </div>
            )}

            {res.orders.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Orders
                </div>
                {res.orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => go(`/admin/orders/${o.id}`)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent text-left transition-colors"
                  >
                    <Receipt className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium shrink-0">{o.order_number}</span>
                    <span className="flex-1 min-w-0 truncate text-muted-foreground">{o.restaurant}</span>
                    <span className="text-[11px] font-semibold shrink-0">{formatCurrency(o.total)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
