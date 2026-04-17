"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, User, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Props = {
  restaurantName: string;
  tableNumber: string | null;
  children: React.ReactNode;
};

type Mode = "choose" | "phone" | "otp" | "done";

const STORAGE_KEY = "tablelink-customer-mode";

export function WelcomeGate({ restaurantName, tableNumber, children }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isPending, startTransition] = useTransition();

  // Skip the gate if the customer already made a choice in this session
  // (or is already logged in).
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

  async function sendOtp() {
    if (!phone.trim()) {
      toast.error("Enter your phone number");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
      });

      if (error) {
        toast.error(
          error.message.includes("not enabled")
            ? "OTP login isn't configured yet. Continue as guest for now."
            : error.message
        );
        return;
      }

      toast.success("OTP sent! Check your phone.");
      setMode("otp");
    });
  }

  async function verifyOtp() {
    if (!otp.trim()) {
      toast.error("Enter the code");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp.trim(),
        type: "sms",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      sessionStorage.setItem(STORAGE_KEY, "done");
      toast.success("Welcome!");
      setMode("done");
    });
  }

  if (mode === null) {
    // Initial loading while we check auth state
    return null;
  }

  if (mode === "done") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/60 via-background to-background" />
      <div className="w-full max-w-sm rounded-2xl bg-card/80 backdrop-blur-sm border-0 shadow-xl p-8">
        {mode === "choose" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight mb-1">{restaurantName}</h1>
              {tableNumber && (
                <p className="text-sm text-muted-foreground">
                  Table {tableNumber}
                </p>
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

              <Button
                size="lg"
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setMode("phone")}
              >
                <UserCheck className="w-4 h-4" />
                Login / Sign up with OTP
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Logging in lets you track orders, reorder favorites, and save
              details for next time.
            </p>
          </>
        )}

        {mode === "phone" && (
          <>
            <button
              type="button"
              onClick={() => setMode("choose")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h2 className="text-xl font-bold mb-1">Your phone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              We&apos;ll send you a one-time code.
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                  disabled={isPending}
                />
                <p className="text-[11px] text-muted-foreground">
                  Include the country code (e.g. +91)
                </p>
              </div>
              <Button
                className="w-full"
                onClick={sendOtp}
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Send OTP"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground text-xs"
                onClick={chooseGuest}
              >
                Skip and continue as guest
              </Button>
            </div>
          </>
        )}

        {mode === "otp" && (
          <>
            <button
              type="button"
              onClick={() => setMode("phone")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h2 className="text-xl font-bold mb-1">Enter the code</h2>
            <p className="text-sm text-muted-foreground mb-4">
              We sent a 6-digit code to{" "}
              <span className="font-medium">{phone}</span>
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="otp">Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  autoFocus
                  disabled={isPending}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>
              <Button
                className="w-full"
                onClick={verifyOtp}
                disabled={isPending}
              >
                {isPending ? "Verifying..." : "Verify"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={sendOtp}
                disabled={isPending}
              >
                Resend code
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
