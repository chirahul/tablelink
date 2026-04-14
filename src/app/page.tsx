import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold">{APP_NAME}</h1>
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

      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            {APP_TAGLINE}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            QR code-based table ordering for restaurants. Your customers scan,
            browse the menu, and order — all from their phone. No app download
            needed.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/menu/demo-restaurant">
              <Button size="lg" variant="outline">
                See Demo
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
