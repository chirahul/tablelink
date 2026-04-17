import Link from "next/link";
import {
  QrCode,
  ShoppingBag,
  ChefHat,
  BarChart3,
  Smartphone,
  Zap,
  Check,
  ChevronDown,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 z-20 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="text-xl font-bold">
            {APP_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/register">
            <Button size="lg" className="min-w-48">Start free</Button>
          </Link>
          <Link href="/menu/demo-restaurant">
            <Button size="lg" variant="outline" className="min-w-48">See a live demo</Button>
          </Link>
        </div>

        {/* Product mockup */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/40">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">tablelink.app/kitchen</span>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-4 gap-3">
                <MockColumn title="New" count={3} accent="bg-yellow-50 border-yellow-200" items={["ORD-042 Table 5", "ORD-043 Table 2", "ORD-044 Table 8"]} />
                <MockColumn title="Preparing" count={2} accent="bg-orange-50 border-orange-200" items={["ORD-040 Table 3", "ORD-041 Table 1"]} />
                <MockColumn title="Ready" count={1} accent="bg-green-50 border-green-200" items={["ORD-039 Table 7"]} />
                <MockColumn title="Served" count={4} accent="bg-gray-50 border-gray-200" items={["ORD-035", "ORD-036", "ORD-037", "ORD-038"]} />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Live kitchen display — orders flow left to right as your team prepares them
          </p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">0 sec</div>
              <div className="text-sm text-muted-foreground">App download needed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">&lt;10 min</div>
              <div className="text-sm text-muted-foreground">Setup time</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Browser-based</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Free</div>
              <div className="text-sm text-muted-foreground">To start</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything you need to go digital</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From QR codes to kitchen management — one platform, zero hardware.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={<QrCode className="w-5 h-5" />} title="QR to table" desc="Print a QR for each table. Scans open your menu with the right table pre-selected. Download PNG or print directly." />
          <FeatureCard icon={<ShoppingBag className="w-5 h-5" />} title="Digital menu + cart" desc="Photos, variants (Half/Full), add-ons, dietary tags, veg/non-veg indicators, and a floating cart. Mobile-first." />
          <FeatureCard icon={<ChefHat className="w-5 h-5" />} title="Real-time kitchen" desc="New orders land in a live kanban board with sound alerts. Accept, prepare, mark ready — one tap each." />
          <FeatureCard icon={<Smartphone className="w-5 h-5" />} title="UPI-first payments" desc="Show your UPI QR at checkout with the exact amount pre-filled, or let customers pay at the counter." />
          <FeatureCard icon={<BarChart3 className="w-5 h-5" />} title="Analytics built-in" desc="Daily orders, revenue, popular items, peak hours chart — all in one dashboard. No spreadsheets." />
          <FeatureCard icon={<Zap className="w-5 h-5" />} title="10-minute setup" desc="Sign up, add your menu, print QR codes, and go live the same day. Load sample data to try it instantly." />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How it works</h2>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Restaurant side */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">For your restaurant</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Step n={1} title="Set up your menu" desc="Sign up, create categories, add items with photos, variants, and prices. Or load sample data in one click." />
                <Step n={2} title="Print QR codes" desc="Create tables, generate a unique QR for each one. Download PNG or print directly with restaurant name and table number." />
                <Step n={3} title="Open the kitchen" desc="Open /kitchen on a tablet or laptop. Orders appear in real-time with sound alerts. Move them through stages with one tap." />
              </div>
            </div>

            <Separator />

            {/* Customer side */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">For your customers</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <Step n={1} title="Scan QR" desc="Point camera at the table QR. No app needed — opens in the browser." />
                <Step n={2} title="Browse menu" desc="Search dishes, filter veg/non-veg, tap items, pick variants and add-ons." />
                <Step n={3} title="Place order" desc="Review cart, add notes, choose UPI or pay-at-counter, and hit Place Order." />
                <Step n={4} title="Track live" desc="Watch order status update in real-time: Confirmed → Preparing → Ready." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Simple pricing</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Start free. Upgrade when you grow.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">Free</span>
                <span className="text-muted-foreground ml-1">forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Perfect for trying TableLink with your restaurant.</p>
              <ul className="space-y-2 text-sm mb-6">
                <PricingFeature text="Unlimited menu items" />
                <PricingFeature text="Up to 10 tables" />
                <PricingFeature text="QR code generator" />
                <PricingFeature text="Live kitchen display" />
                <PricingFeature text="UPI + counter payments" />
                <PricingFeature text="Basic analytics" />
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full">Get started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="relative border-foreground">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="px-3 py-1">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Pro</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">₹999</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">For restaurants ready to scale operations.</p>
              <ul className="space-y-2 text-sm mb-6">
                <PricingFeature text="Everything in Starter" />
                <PricingFeature text="Unlimited tables" />
                <PricingFeature text="Advanced analytics & reports" />
                <PricingFeature text="CSV export" />
                <PricingFeature text="Custom branding & colors" />
                <PricingFeature text="Priority support" />
                <PricingFeature text="Multi-language menus" />
              </ul>
              <Link href="/register">
                <Button className="w-full">Start 14-day free trial</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What restaurants say</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Testimonial
              quote="We cut order wait times by 60%. Customers love scanning and ordering without waiting for a waiter."
              name="Priya S."
              role="Owner, Spice Garden"
            />
            <Testimonial
              quote="Setup took 15 minutes. We printed QR codes, stuck them on tables, and started getting orders the same evening."
              name="Rahul M."
              role="Manager, Chai & More"
            />
            <Testimonial
              quote="The kitchen display is a game changer. No more shouting orders — everything shows up on the screen with a ding."
              name="Amit K."
              role="Head Chef, Urban Bites"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently asked questions</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <FAQ q="Do my customers need to download an app?" a="No. TableLink runs entirely in the browser. Customers scan the QR code and the menu opens instantly — no install, no sign-up required." />
          <FAQ q="What hardware do I need?" a="None. You just need a printer to print QR codes (regular paper works), and a tablet or laptop for the kitchen display. That's it." />
          <FAQ q="How do payments work?" a="Two options: customers can scan your UPI QR code at checkout (with the amount pre-filled), or they can pay at the counter. No payment gateway integration needed." />
          <FAQ q="Can I customize my menu?" a="Yes — add categories, items with photos, variants (Half/Full), add-ons (Extra cheese), dietary tags, veg/non-veg indicators. All from the admin dashboard." />
          <FAQ q="Is there a contract or lock-in?" a="No. The Starter plan is free forever. Pro is month-to-month — cancel anytime." />
          <FAQ q="How long does setup take?" a="Under 10 minutes. Sign up, add your menu (or load our sample data), create tables, print QR codes, done." />
          <FAQ q="Can I use this for multiple restaurants?" a="Each restaurant gets its own account with a unique menu URL and QR codes. As a platform owner, you can manage all of them from the super admin panel." />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto p-10 rounded-2xl bg-foreground text-background">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Ready to skip the wait?
          </h2>
          <p className="opacity-80 mb-6">
            Join restaurants already using TableLink. Set up in 10 minutes, free forever on the Starter plan.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="min-w-48">Get started free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-lg mb-3">{APP_NAME}</div>
              <p className="text-sm text-muted-foreground">
                QR-based table ordering for restaurants. Built in India.
              </p>
            </div>
            <div>
              <div className="font-semibold text-sm mb-3">Product</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
                <li><Link href="/menu/demo-restaurant" className="hover:text-foreground">Live demo</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-sm mb-3">Account</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-foreground">Sign up</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-sm mb-3">Contact</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span>hello@tablelink.app</span>
                </li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="pt-6 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
            <div>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</div>
            <div className="flex gap-4">
              <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
              <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---- Components ---- */

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
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

function MockColumn({ title, count, accent, items }: { title: string; count: number; accent: string; items: string[] }) {
  return (
    <div className={`rounded-lg border ${accent} p-2`}>
      <div className="flex items-center justify-between text-xs font-semibold mb-2 px-1">
        <span>{title}</span>
        <span className="opacity-60">{count}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item} className="bg-card rounded border p-1.5 text-[10px] leading-snug truncate">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
      <span>{text}</span>
    </li>
  );
}

function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="p-6 rounded-xl border bg-card">
      <p className="text-sm mb-4 leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div>
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {q}
        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ml-2" />
      </summary>
      <div className="px-4 pb-4 text-sm text-muted-foreground">
        {a}
      </div>
    </details>
  );
}
