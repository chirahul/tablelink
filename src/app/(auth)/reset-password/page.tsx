"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resetPassword } from "../actions";

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);

    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Set new password</CardTitle>
        <CardDescription>Choose a strong password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              disabled={isPending}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
              disabled={isPending}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save new password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
