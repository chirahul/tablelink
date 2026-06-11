"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/shared/google-button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  restaurantName: string;
  tableNumber: string | null;
  children: React.ReactNode;
};

type Mode = "choose" | "done";

const STORAGE_KEY = "tablelynk-customer-mode";

export function WelcomeGate({ restaurantName, tableNumber, children }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);

  // Skip the gate if already signed in or the customer chose guest this session.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setMode("done");
        return;
      }
      const stored =
        typeof window !== "undefined"
          ? sessionStorage.getItem(STORAGE_KEY)
          : null;
      setMode(stored === "done" ? "done" : "choose");
    });
  }, []);

  function chooseGuest() {
    sessionStorage.setItem(STORAGE_KEY, "done");
    setMode("done");
  }

  if (mode === null) {
    // Branded splash during the initial auth check (avoids a blank flash).
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
          <User className="w-5 h-5" />
        </div>
        <p className="text-sm text-muted-foreground">{restaurantName}</p>
      </div>
    );
  }
  if (mode === "done") return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/60 via-background to-background" />
      <div className="w-full max-w-sm rounded-2xl bg-card/80 backdrop-blur-sm border-0 shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {restaurantName}
          </h1>
          {tableNumber && (
            <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full justify-between"
            onClick={chooseGuest}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Continue as Guest
            </span>
            <span className="text-xs opacity-70">Fastest →</span>
          </Button>

          <GoogleButton label="Continue with Google" />
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Signing in lets you track orders, reorder favorites, and save details
          for next time.
        </p>
      </div>
    </div>
  );
}
