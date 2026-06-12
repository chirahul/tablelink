import { Check, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { PLAN_LIST, type PlanId } from "@/lib/plans";
import type { BillingConfig } from "@/lib/billing-config";
import { cn } from "@/lib/utils";

export function PricingPlans({
  recommended,
  currentPlan,
}: {
  recommended?: PlanId;
  currentPlan?: PlanId | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3 items-stretch">
      {PLAN_LIST.map((plan) => {
        const isRec = plan.id === recommended;
        const isCurrent = plan.id === currentPlan;
        return (
          <div
            key={plan.id}
            className={cn(
              "rounded-2xl border bg-card p-5 flex flex-col h-full relative",
              isRec ? "border-primary ring-1 ring-primary shadow-md" : ""
            )}
          >
            {isRec && (
              <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground bg-primary px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3" /> Recommended
              </span>
            )}

            {/* Header — fixed height so prices line up across cards */}
            <div className="h-12">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {isCurrent && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-success bg-success-container px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{plan.tagline}</p>
            </div>

            {/* Price — fixed height so the feature lists start on the same line */}
            <div className="h-12 flex items-baseline gap-1">
              {plan.priceYear !== null ? (
                <>
                  <span className="text-3xl font-bold tracking-tight">{formatCurrency(plan.priceYear)}</span>
                  <span className="text-sm text-muted-foreground">/ year</span>
                </>
              ) : (
                <span className="text-2xl font-bold tracking-tight">Custom</span>
              )}
            </div>

            <ul className="space-y-2 text-sm flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function PaymentInstructions({ config }: { config: BillingConfig }) {
  return (
    <div className="rounded-2xl border bg-muted/30 p-5">
      <h3 className="font-semibold mb-1">How to subscribe</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Pay the yearly amount for your plan, then send us your restaurant name and we&apos;ll
        activate your subscription (usually within a few hours).
      </p>

      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        {config.qrUrl ? (
          <div className="text-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.qrUrl}
              alt="Payment QR"
              className="w-44 h-44 rounded-xl border bg-card object-contain p-2"
            />
            <div className="text-xs text-muted-foreground mt-1.5">Scan to pay</div>
          </div>
        ) : (
          <div className="w-44 h-44 rounded-xl border bg-card flex items-center justify-center text-center text-xs text-muted-foreground p-3 shrink-0">
            Payment QR coming soon — use the UPI ID / contact →
          </div>
        )}

        <div className="grid gap-2 text-sm w-full">
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">UPI ID</div>
            <div className="font-semibold">{config.upi}</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">WhatsApp / Call</div>
            <div className="font-semibold">{config.phone}</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</div>
            <div className="font-semibold break-all">{config.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
