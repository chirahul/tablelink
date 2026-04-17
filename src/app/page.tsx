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
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";
import {
  Reveal,
  StaggerContainer,
  StaggerItem,
  FloatingMockup,
  HoverLift,
} from "@/components/landing/motion-wrappers";
import { AnimatedKitchen } from "@/components/landing/animated-kitchen";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
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

      {/* ============ HERO ============ */}
      <section className="relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/60 via-background to-background" />

        <div className="container mx-auto px-4 pt-24 md:pt-36 pb-12 text-center">
          <Reveal delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-background/80 text-xs text-muted-foreground mb-8 backdrop-blur-sm">
              <Zap className="w-3 h-3 text-yellow-500" />
              Live ordering in minutes, not months
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9]">
              Scan.
              <br />
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent">
                Order. Eat.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              QR-based table ordering for restaurants. Customers scan, browse, and order — straight to your kitchen. No app downloads. No hardware.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link href="/register">
                <Button size="lg" className="min-w-52 h-12 text-base group">
                  Start free
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/menu/demo-restaurant">
                <Button size="lg" variant="outline" className="min-w-52 h-12 text-base">
                  See a live demo
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* Animated kitchen mockup */}
          <FloatingMockup className="max-w-4xl mx-auto">
            <AnimatedKitchen />
            <p className="text-xs text-muted-foreground mt-4 opacity-60">
              Orders move across columns in real-time — just like your actual kitchen
            </p>
          </FloatingMockup>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-10">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" staggerDelay={0.15}>
            {[
              { val: "0 sec", sub: "App download needed" },
              { val: "<10 min", sub: "Setup time" },
              { val: "100%", sub: "Browser-based" },
              { val: "Free", sub: "To start" },
            ].map((s) => (
              <StaggerItem key={s.sub}>
                <div className="text-3xl md:text-4xl font-bold tracking-tight">{s.val}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.sub}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="container mx-auto px-4 py-24 md:py-32">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need<br className="hidden md:block" /> to go digital
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              From QR codes to kitchen management — one platform, zero hardware.
            </p>
          </div>
        </Reveal>

        {/* Asymmetric layout — 2 large + 4 small */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Reveal delay={0} variant="slideRight">
            <HoverLift>
              <div className="p-8 rounded-2xl border bg-card h-full group hover:border-foreground/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">QR to table</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Print a unique QR for each table. When scanned, your menu opens with that table pre-selected.
                  Download as PNG or print directly — with your restaurant name and table number built in.
                </p>
              </div>
            </HoverLift>
          </Reveal>

          <Reveal delay={0.1} variant="slideLeft">
            <HoverLift>
              <div className="p-8 rounded-2xl border bg-card h-full group hover:border-foreground/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time kitchen</h3>
                <p className="text-muted-foreground leading-relaxed">
                  New orders land in a live kanban board. Sound alerts ding when something arrives. Accept,
                  prepare, mark ready — one tap each. Multiple devices stay synced in real-time.
                </p>
              </div>
            </HoverLift>
          </Reveal>
        </div>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.08}>
          {[
            { icon: <ShoppingBag className="w-5 h-5" />, title: "Digital menu + cart", desc: "Variants, add-ons, veg/non-veg, photos, floating cart. Mobile-first." },
            { icon: <Smartphone className="w-5 h-5" />, title: "UPI-first payments", desc: "Amount pre-filled UPI QR at checkout, or pay at the counter." },
            { icon: <BarChart3 className="w-5 h-5" />, title: "Analytics built-in", desc: "Orders, revenue, popular items, peak hours — one dashboard." },
            { icon: <Zap className="w-5 h-5" />, title: "10-minute setup", desc: "Sign up, add menu, print QRs, go live. Same day." },
          ].map((f) => (
            <StaggerItem key={f.title}>
              <HoverLift>
                <div className="p-6 rounded-2xl border bg-card h-full group hover:border-foreground/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="bg-muted/20 border-y">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16">
              How it works
            </h2>
          </Reveal>

          <div className="max-w-5xl mx-auto space-y-16">
            {/* Restaurant side — offset left */}
            <div>
              <Reveal>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-8 text-center">
                  For your restaurant
                </h3>
              </Reveal>
              <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
                {[
                  { n: 1, title: "Set up your menu", desc: "Sign up, create categories, add items with photos, variants, and prices. Or load sample data in one click." },
                  { n: 2, title: "Print QR codes", desc: "Create tables, generate a unique QR for each. Download PNG or print directly with your branding." },
                  { n: 3, title: "Open the kitchen", desc: "Open /kitchen on any screen. Orders arrive in real-time with sound alerts. Move them with one tap." },
                ].map((s) => (
                  <StaggerItem key={s.n}>
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl border-2 border-foreground flex items-center justify-center text-xl font-bold">
                        {s.n}
                      </div>
                      <h4 className="font-semibold mb-2">{s.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            <Separator />

            {/* Customer side — offset right */}
            <div>
              <Reveal>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-8 text-center">
                  For your customers
                </h3>
              </Reveal>
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.12}>
                {[
                  { n: 1, title: "Scan QR", desc: "Point camera. Opens in browser — no app." },
                  { n: 2, title: "Browse menu", desc: "Search, filter, pick variants and add-ons." },
                  { n: 3, title: "Place order", desc: "Review cart, choose payment, hit order." },
                  { n: 4, title: "Track live", desc: "Status updates: Confirmed → Preparing → Ready." },
                ].map((s) => (
                  <StaggerItem key={s.n}>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-foreground flex items-center justify-center text-sm font-bold">
                        {s.n}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{s.title}</h4>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="container mx-auto px-4 py-24 md:py-32">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you grow.</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Reveal delay={0} variant="slideRight">
            <Card className="relative h-full">
              <CardHeader>
                <CardTitle className="text-xl">Starter</CardTitle>
                <div className="mt-3">
                  <span className="text-5xl font-bold tracking-tight">Free</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-5">Perfect for trying TableLink.</p>
                <ul className="space-y-2.5 text-sm mb-8">
                  {["Unlimited menu items", "Up to 10 tables", "QR code generator", "Live kitchen display", "UPI + counter payments", "Basic analytics"].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant="outline" className="w-full h-11">Get started</Button>
                </Link>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.15} variant="slideLeft">
            <Card className="relative h-full border-foreground shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="px-4 py-1 text-xs">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="mt-3">
                  <span className="text-5xl font-bold tracking-tight">₹999</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-5">For restaurants ready to scale.</p>
                <ul className="space-y-2.5 text-sm mb-8">
                  {["Everything in Starter", "Unlimited tables", "Advanced analytics & reports", "CSV export", "Custom branding & colors", "Priority support", "Multi-language menus"].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full h-11">Start 14-day free trial</Button>
                </Link>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-muted/20 border-y">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16">
              What restaurants say
            </h2>
          </Reveal>
          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerDelay={0.12}>
            {[
              { q: "We cut order wait times by 60%. Customers love scanning and ordering without waiting for a waiter.", n: "Priya S.", r: "Owner, Spice Garden" },
              { q: "Setup took 15 minutes. We printed QR codes, stuck them on tables, and started getting orders the same evening.", n: "Rahul M.", r: "Manager, Chai & More" },
              { q: "The kitchen display is a game changer. No more shouting orders — everything shows up on the screen with a ding.", n: "Amit K.", r: "Head Chef, Urban Bites" },
            ].map((t) => (
              <StaggerItem key={t.n}>
                <HoverLift>
                  <div className="p-6 rounded-2xl border bg-card h-full">
                    <p className="text-sm mb-5 leading-relaxed">&ldquo;{t.q}&rdquo;</p>
                    <div>
                      <div className="font-semibold text-sm">{t.n}</div>
                      <div className="text-xs text-muted-foreground">{t.r}</div>
                    </div>
                  </div>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="container mx-auto px-4 py-24 md:py-32">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16">
            Frequently asked questions
          </h2>
        </Reveal>
        <StaggerContainer className="max-w-2xl mx-auto space-y-3" staggerDelay={0.06}>
          {[
            { q: "Do my customers need to download an app?", a: "No. TableLink runs entirely in the browser. Customers scan the QR code and the menu opens instantly — no install, no sign-up required." },
            { q: "What hardware do I need?", a: "None. You just need a printer to print QR codes (regular paper works), and a tablet or laptop for the kitchen display." },
            { q: "How do payments work?", a: "Two options: customers can scan your UPI QR code at checkout (with the amount pre-filled), or they can pay at the counter. No payment gateway integration needed." },
            { q: "Can I customize my menu?", a: "Yes — add categories, items with photos, variants (Half/Full), add-ons (Extra cheese), dietary tags, veg/non-veg indicators. All from the admin dashboard." },
            { q: "Is there a contract or lock-in?", a: "No. The Starter plan is free forever. Pro is month-to-month — cancel anytime." },
            { q: "How long does setup take?", a: "Under 10 minutes. Sign up, add your menu (or load our sample data), create tables, print QR codes, done." },
            { q: "Can I use this for multiple restaurants?", a: "Each restaurant gets its own account with a unique menu URL and QR codes. As a platform owner, you can manage all of them from the super admin panel." },
          ].map((f) => (
            <StaggerItem key={f.q}>
              <details className="group rounded-xl border bg-card overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 shrink-0 ml-3" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed -mt-1">
                  {f.a}
                </div>
              </details>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="container mx-auto px-4 py-20">
        <Reveal variant="scaleUp">
          <div className="max-w-3xl mx-auto p-12 md:p-16 rounded-3xl bg-foreground text-background text-center relative overflow-hidden">
            {/* Gradient orb decorations */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 relative">
              Ready to skip the wait?
            </h2>
            <p className="opacity-70 mb-8 text-lg relative max-w-md mx-auto">
              Join restaurants already using TableLink. Set up in 10 minutes, free forever on Starter.
            </p>
            <Link href="/register" className="relative">
              <Button size="lg" variant="secondary" className="min-w-52 h-12 text-base group">
                Get started free
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t py-14 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="font-bold text-lg mb-3 tracking-tight">{APP_NAME}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                QR-based table ordering for restaurants. Built in India.
              </p>
            </div>
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Product</div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><Link href="/menu/demo-restaurant" className="hover:text-foreground transition-colors">Live demo</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Account</div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Contact</div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>hello@tablelink.app</span>
                </li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="pt-8 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-4">
            <div>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</div>
            <div className="flex gap-6">
              <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
