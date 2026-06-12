import Image from "next/image";
import { Lock, LogOut } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { PricingPlans, PaymentInstructions } from "@/components/billing/pricing-plans";
import { getBillingConfig } from "@/lib/billing-config";
import type { PlanId } from "@/lib/plans";
import logo from "@/assets/logo-wide.png";

export async function Paywall({
  recommended,
  endedTrial,
}: {
  recommended?: PlanId;
  endedTrial: boolean;
}) {
  const config = await getBillingConfig();
  return (
    <div className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_0%,#FBF7F0_0%,#EFE5D2_60%,#E3D4B5_100%)]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <Image src={logo} alt={APP_NAME} className="h-9 w-auto" priority />
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
              <span className="ml-1.5">Logout</span>
            </Button>
          </form>
        </div>

        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            {endedTrial ? "Your free trial has ended" : "Your subscription has expired"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Your customer menu is offline and your dashboard is locked. Choose a plan and
            subscribe to bring everything back online — all your menu, tables, and orders
            are safe.
          </p>
        </div>

        <div className="space-y-5">
          <PricingPlans recommended={recommended} />
          <PaymentInstructions config={config} />
        </div>
      </div>
    </div>
  );
}
