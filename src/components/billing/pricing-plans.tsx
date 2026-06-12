import { Check, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { PLAN_LIST, BILLING_CONTACT, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function PricingPlans({
  recommended,
  currentPlan,
}: {
  recommended?: PlanId;
  currentPlan?: PlanId | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PLAN_LIST.map((plan) => {
        const isRec = plan.id === recommended;
        const isCurrent = plan.id === currentPlan;
        return (
          <div
            key={plan.id}
            className={cn(
              "rounded-2xl border bg-card p-5 flex flex-col relative",
              isRec ? "border-primary ring-1 ring-primary shadow-md" : ""
            )}
          >
            {isRec && (
              <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground bg-primary px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3" /> Recommended
              </span>
            )}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              {isCurrent && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-success bg-success-container px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">{plan.tagline}</p>
            <div className="mb-4">
              {plan.priceYear !== null ? (
                <>
                  <span className="text-3xl font-bold tracking-tight">{formatCurrency(plan.priceYear)}</span>
                  <span className="text-sm text-muted-foreground"> / year</span>
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

export function PaymentInstructions() {
  return (
    <div className="rounded-2xl border bg-muted/30 p-5">
      <h3 className="font-semibold mb-1">How to subscribe</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Payment is activated manually. Pay the yearly amount for your plan, then send
        us your restaurant name and we&apos;ll activate your subscription (usually within
        a few hours).
      </p>
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border bg-card p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Pay via UPI</div>
          <div className="font-semibold">{BILLING_CONTACT.upi}</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">WhatsApp / Call</div>
          <div className="font-semibold">{BILLING_CONTACT.phone}</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</div>
          <div className="font-semibold break-all">{BILLING_CONTACT.email}</div>
        </div>
      </div>
    </div>
  );
}
