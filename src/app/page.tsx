import Link from "next/link";
import {
  QrCode,
  ShoppingBag,
  ChefHat,
  BarChart3,
  Smartphone,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 z-20 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="text-xl font-bold">
            {APP_NAME}
          </Link>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs text-muted-foreground mb-6">
          <Zap className="w-3 h-3" /> Live ordering in minutes, not months
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          {APP_TAGLINE}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          QR-based table ordering for restaurants. Your customers scan a code,
          browse your menu, and place orders — straight to your kitchen. No app
          downloads. No hardware.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button size="lg" className="min-w-48">
              Start free
            </Button>
          </Link>
          <Link href="/menu/demo-restaurant">
            <Button size="lg" variant="outline" className="min-w-48">
              See a live menu
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<QrCode className="w-5 h-5" />}
            title="QR to table"
            desc="Print a QR for each table. Scans open your menu with the right table pre-selected."
          />
          <FeatureCard
            icon={<ShoppingBag className="w-5 h-5" />}
            title="Digital menu + cart"
            desc="Photos, variants, add-ons, dietary tags, and a floating cart. Works on any phone browser."
          />
          <FeatureCard
            icon={<ChefHat className="w-5 h-5" />}
            title="Real-time kitchen"
            desc="New orders land in a live kanban with sound alerts. Move them through states with one tap."
          />
          <FeatureCard
            icon={<Smartphone className="w-5 h-5" />}
            title="UPI-first payments"
            desc="Show your UPI QR at checkout with the amount pre-filled, or let customers pay at the counter."
          />
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Analytics built-in"
            desc="Daily orders, revenue, popular items, peak hours — no spreadsheet exports required."
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5" />}
            title="Setup in 10 minutes"
            desc="Create your account, load a sample menu, print QR codes, and go live the same day."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Step
            n={1}
            title="Set up your menu"
            desc="Sign up, add categories and items with photos, variants, and prices."
          />
          <Step
            n={2}
            title="Print QR codes"
            desc="Create tables and download printable QR codes unique to each table."
          />
          <Step
            n={3}
            title="Start taking orders"
            desc="Customers scan, order, and pay. Your kitchen sees it live. You watch it ship."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto p-10 rounded-2xl bg-foreground text-background">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Ready to skip the wait?
          </h2>
          <p className="opacity-80 mb-6">
            No setup fees. No monthly commitments. Start ordering today.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="min-w-48">
              Get started
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
          <div>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:border-foreground/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-foreground flex items-center justify-center font-bold">
        {n}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
