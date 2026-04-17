"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "../actions";

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "bg-muted" };
  let s = 0;
  if (pw.length >= 6) s += 1;
  if (pw.length >= 10) s += 1;
  if (/[A-Z]/.test(pw)) s += 1;
  if (/[0-9]/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;

  if (s <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (s <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (s <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
  return { score: 4, label: "Strong", color: "bg-green-500" };
}

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const strength = getStrength(password);

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUp(formData);
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="restaurant_name">Restaurant Name</Label>
        <Input
          id="restaurant_name"
          name="restaurant_name"
          placeholder="My Restaurant"
          required
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@restaurant.com"
          required
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          disabled={isPending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${
                    i <= strength.score ? strength.color : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {strength.label} — use 6+ chars, uppercase, numbers, symbols
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
