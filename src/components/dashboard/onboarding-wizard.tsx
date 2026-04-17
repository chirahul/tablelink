"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type OnboardingStatus = {
  hasCategories: boolean;
  hasMenuItems: boolean;
  hasTables: boolean;
  menuSlug: string;
};

type Props = {
  status: OnboardingStatus;
};

const STEPS = [
  {
    key: "hasCategories" as const,
    title: "Create your first category",
    desc: "Group your menu into sections — Starters, Mains, Beverages, etc.",
    href: "/menu/categories",
    cta: "Add category",
  },
  {
    key: "hasMenuItems" as const,
    title: "Add menu items",
    desc: "Add dishes with photos, prices, variants (Half/Full), and add-ons.",
    href: "/menu",
    cta: "Add items",
  },
  {
    key: "hasTables" as const,
    title: "Create tables & print QR codes",
    desc: "Add your tables, then download or print a unique QR code for each one.",
    href: "/tables",
    cta: "Add tables",
  },
];

export function OnboardingWizard({ status }: Props) {
  const [dismissed, setDismissed] = useState(false);

  const completedCount = STEPS.filter((s) => status[s.key]).length;
  const allDone = completedCount === STEPS.length;

  if (dismissed) return null;

  if (allDone) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-green-900">
                You&apos;re all set!
              </div>
              <div className="text-sm text-green-800">
                Your menu is live at{" "}
                <Link
                  href={`/menu/${status.menuSlug}`}
                  className="underline font-medium"
                  target="_blank"
                >
                  /menu/{status.menuSlug}
                </Link>
                . Print your QR codes and start taking orders.
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="text-green-700 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold">Get started</div>
            <div className="text-xs text-muted-foreground">
              {completedCount} of {STEPS.length} steps done
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((s) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                status[s.key] ? "bg-green-500" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="space-y-2">
          {STEPS.map((step) => {
            const done = status[step.key];
            return (
              <Link
                key={step.key}
                href={step.href}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  done
                    ? "bg-muted/40 opacity-60"
                    : "hover:border-foreground/30 hover:bg-accent"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    done
                      ? "bg-green-500 text-white"
                      : "border-2 border-muted-foreground/40"
                  }`}
                >
                  {done && <Check className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      done ? "line-through" : ""
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.desc}
                  </div>
                </div>
                {!done && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
