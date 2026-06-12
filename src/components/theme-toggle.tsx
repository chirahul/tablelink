"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Light/Dark toggle. Works anywhere under the root ThemeProvider. */
export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        className
      )}
    >
      {/* Keep an icon slot before mount to avoid layout shift / hydration mismatch */}
      {!mounted ? (
        <Sun className="w-4 h-4 opacity-0" />
      ) : isDark ? (
        <Sun className="w-4 h-4 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 shrink-0" />
      )}
      {showLabel && <span className="text-sm">{isDark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
