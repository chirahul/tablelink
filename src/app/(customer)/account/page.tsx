"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Phone, LogOut, ReceiptText, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/stores/cart-store";
import { FloatingBottomNav } from "@/components/customer/floating-bottom-nav";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const router = useRouter();
  const slug = useCartStore((s) => s.restaurantSlug);
  const tableId = useCartStore((s) => s.tableId);
  const [phone, setPhone] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      setPhone(data.user?.phone ?? null);
    });
  }, []);

  const menuHref = slug
    ? `/menu/${slug}${tableId ? `?table=${tableId}` : ""}`
    : "/";

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push(menuHref);
  }

  if (authed === false) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center">
        <User className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-xl font-bold mb-2">You&apos;re browsing as a guest</h1>
        <p className="text-muted-foreground mb-6">
          Order with your phone number to save your order history here.
        </p>
        <Link href={menuHref}>
          <Button size="lg">Back to menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-28">
      <h1 className="text-2xl font-bold tracking-tight mb-5">Profile</h1>

      {/* Identity card */}
      <div className="p-5 rounded-2xl border bg-card flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <User className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">Guest customer</p>
          {phone ? (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              {phone}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Signed in</p>
          )}
        </div>
      </div>

      {/* Links */}
      <Link
        href="/account/orders"
        className="flex items-center gap-3 p-4 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-md active:scale-[0.99] transition-all mb-4"
      >
        <ReceiptText className="w-5 h-5 text-primary shrink-0" />
        <span className="flex-1 font-medium">Your orders</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </Link>

      <Button
        variant="outline"
        size="lg"
        className="w-full gap-2 text-destructive hover:text-destructive"
        onClick={signOut}
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </Button>

      <FloatingBottomNav />
    </div>
  );
}
