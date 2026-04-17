"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { forgotPassword } from "../actions";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result.success) {
        setSent(true);
        toast.success("Reset link sent! Check your email.");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We sent a password reset link. Click it to set a new password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground underline"
          >
            Back to login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@restaurant.com"
              required
              disabled={isPending}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}
