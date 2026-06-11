"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { UpiQrDisplay } from "@/components/customer/upi-qr-display";
import { updateRestaurantSettings } from "../admin-actions";
import type { Restaurant } from "@/lib/types";

type Props = { restaurant: Restaurant };

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

type DayHours = { open: string; close: string; closed: boolean };

function initialHours(r: Restaurant): Record<string, DayHours> {
  const out: Record<string, DayHours> = {};
  for (const { key } of DAYS) {
    const h = r.opening_hours?.[key];
    out[key] = h
      ? { open: h.open, close: h.close, closed: false }
      : { open: "09:00", close: "22:00", closed: true };
  }
  return out;
}

export function SettingsForm({ restaurant }: Props) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState<string | null>(restaurant.logo_url);
  const [coverUrl, setCoverUrl] = useState<string | null>(
    restaurant.cover_image_url
  );
  const [upiQrUrl, setUpiQrUrl] = useState<string | null>(
    restaurant.upi_qr_image_url
  );

  const [form, setForm] = useState({
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description ?? "",
    address: restaurant.address ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    upi_id: restaurant.upi_id ?? "",
    tax_rate: String(restaurant.settings?.tax_rate ?? 0),
    currency: restaurant.settings?.currency ?? "INR",
    gst_number: restaurant.gst_number ?? "",
    timezone: restaurant.timezone ?? "Asia/Kolkata",
    google_maps_url: restaurant.google_maps_url ?? "",
    instagram: restaurant.social_links?.instagram ?? "",
    facebook: restaurant.social_links?.facebook ?? "",
    website: restaurant.social_links?.website ?? "",
    is_active: restaurant.is_active,
  });
  const [hours, setHours] = useState<Record<string, DayHours>>(
    initialHours(restaurant)
  );

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        form: {
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description ?? "",
          address: restaurant.address ?? "",
          phone: restaurant.phone ?? "",
          email: restaurant.email ?? "",
          upi_id: restaurant.upi_id ?? "",
          tax_rate: String(restaurant.settings?.tax_rate ?? 0),
          currency: restaurant.settings?.currency ?? "INR",
          gst_number: restaurant.gst_number ?? "",
          timezone: restaurant.timezone ?? "Asia/Kolkata",
          google_maps_url: restaurant.google_maps_url ?? "",
          instagram: restaurant.social_links?.instagram ?? "",
          facebook: restaurant.social_links?.facebook ?? "",
          website: restaurant.social_links?.website ?? "",
          is_active: restaurant.is_active,
        },
        logoUrl: restaurant.logo_url,
        coverUrl: restaurant.cover_image_url,
        upiQrUrl: restaurant.upi_qr_image_url,
        hours: initialHours(restaurant),
      }),
    [restaurant]
  );

  const dirty =
    JSON.stringify({ form, logoUrl, coverUrl, upiQrUrl, hours }) !==
    initialSnapshot;

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Validation
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (form.phone && !/^[+]?[\d\s-]{7,15}$/.test(form.phone))
    errors.phone = "Enter a valid phone number";
  if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
    errors.email = "Enter a valid email";
  if (form.upi_id && !form.upi_id.includes("@"))
    errors.upi_id = "UPI ID should look like name@bank";
  const taxNum = Number(form.tax_rate);
  if (Number.isNaN(taxNum) || taxNum < 0 || taxNum > 100)
    errors.tax_rate = "Tax rate must be 0–100";
  const hasErrors = Object.keys(errors).length > 0;
  const tabErr = {
    profile: !!(errors.name || errors.phone || errors.email),
    payments: !!errors.upi_id,
    taxes: !!errors.tax_rate,
  };

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://thetablelynk.com";
  const menuLink = `${origin}/menu/${form.slug}`;
  const slugChanged = form.slug !== restaurant.slug;

  function save() {
    if (hasErrors) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) =>
      fd.set(k, typeof v === "boolean" ? String(v) : v)
    );
    fd.set("logo_url", logoUrl ?? "");
    fd.set("cover_image_url", coverUrl ?? "");
    fd.set("upi_qr_image_url", upiQrUrl ?? "");
    fd.set("social_instagram", form.instagram);
    fd.set("social_facebook", form.facebook);
    fd.set("social_website", form.website);
    const oh: Record<string, { open: string; close: string }> = {};
    for (const { key } of DAYS)
      if (!hours[key].closed)
        oh[key] = { open: hours[key].open, close: hours[key].close };
    fd.set("opening_hours", JSON.stringify(oh));

    startTransition(async () => {
      const r = await updateRestaurantSettings(fd);
      if (r.success) toast.success("Settings saved successfully");
      else toast.error(r.error);
    });
  }

  function testUpi() {
    if (!form.upi_id.includes("@")) {
      toast.error("Enter a valid UPI ID first");
      return;
    }
    const uri = `upi://pay?pa=${encodeURIComponent(
      form.upi_id
    )}&pn=${encodeURIComponent(form.name)}&am=1&cu=INR`;
    window.location.href = uri;
  }

  const SaveBar = (
    <div className="flex items-center justify-between gap-3 py-3">
      <span
        className={`text-sm ${dirty ? "text-warning font-medium" : "text-muted-foreground"}`}
      >
        {dirty ? "● Unsaved changes" : "All changes saved"}
      </span>
      <Button onClick={save} disabled={isPending || !dirty || hasErrors}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );

  const fieldError = (k: string) =>
    errors[k] ? <p className="text-xs text-destructive">{errors[k]}</p> : null;

  return (
    <div>
      {/* Sticky top save bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b -mx-4 px-4 mb-4">
        {SaveBar}
      </div>

      <Tabs defaultValue="profile">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="profile">
            Profile
            {tabErr.profile && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
            )}
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments
            {tabErr.payments && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
            )}
          </TabsTrigger>
          <TabsTrigger value="taxes">
            Taxes
            {tabErr.taxes && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* PROFILE */}
        <TabsContent value="profile" className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div>
              <p className="font-medium">Restaurant status</p>
              <p className="text-sm text-muted-foreground">
                {form.is_active
                  ? "Open — accepting orders"
                  : "Closed — customers can browse but not order"}
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => set("is_active", v)}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              {fieldError("name")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                placeholder="Short tagline shown on the menu header"
              />
            </div>
            <ImageUpload
              value={logoUrl}
              onChange={setLogoUrl}
              label="Logo"
              aspectRatio="square"
            />
            <ImageUpload
              value={coverUrl}
              onChange={setCoverUrl}
              label="Cover / banner image"
              aspectRatio="wide"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {fieldError("phone")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                {fieldError("email")}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maps">Google Maps link</Label>
              <Input
                id="maps"
                value={form.google_maps_url}
                onChange={(e) => set("google_maps_url", e.target.value)}
                placeholder="https://maps.app.goo.gl/…"
              />
            </div>
          </div>

          {/* Opening hours */}
          <div className="space-y-3 pt-2 border-t">
            <p className="font-medium">Operating hours</p>
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0">{label}</span>
                <Switch
                  checked={!hours[key].closed}
                  onCheckedChange={(v) =>
                    setHours((h) => ({
                      ...h,
                      [key]: { ...h[key], closed: !v },
                    }))
                  }
                />
                {hours[key].closed ? (
                  <span className="text-muted-foreground">Closed</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours[key].open}
                      onChange={(e) =>
                        setHours((h) => ({
                          ...h,
                          [key]: { ...h[key], open: e.target.value },
                        }))
                      }
                      className="w-32"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="time"
                      value={hours[key].close}
                      onChange={(e) =>
                        setHours((h) => ({
                          ...h,
                          [key]: { ...h[key], close: e.target.value },
                        }))
                      }
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Social + share */}
          <div className="space-y-4 pt-2 border-t">
            <p className="font-medium">Social links</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ig">Instagram</Label>
                <Input
                  id="ig"
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                  placeholder="@handle or URL"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb">Facebook</Label>
                <Input
                  id="fb"
                  value={form.facebook}
                  onChange={(e) => set("facebook", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="web">Website</Label>
                <Input
                  id="web"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <p className="font-medium">Menu link</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono shrink-0">
                {origin.replace(/^https?:\/\//, "")}/menu/
              </span>
              <Input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="font-mono text-sm"
                placeholder="your-restaurant"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your menu link doesn&apos;t change automatically when you rename
              the restaurant — so already-printed QR codes keep working. Edit it
              here if you want, but{" "}
              <span className="text-warning font-medium">
                changing it breaks QR codes you&apos;ve already printed
              </span>{" "}
              — you&apos;ll need to reprint them.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input readOnly value={menuLink} className="font-mono text-xs" />
              <Button
                type="button"
                variant="outline"
                disabled={slugChanged}
                onClick={() => {
                  navigator.clipboard.writeText(menuLink);
                  toast.success("Menu link copied");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <a href={menuLink} target="_blank" rel="noreferrer">
                <Button type="button" variant="outline" disabled={slugChanged}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
            {slugChanged && (
              <p className="text-xs text-muted-foreground">
                Save changes first, then this link will be live.
              </p>
            )}
          </div>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments" className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="upi_id">UPI ID</Label>
            <Input
              id="upi_id"
              value={form.upi_id}
              onChange={(e) => set("upi_id", e.target.value)}
              placeholder="you@upi"
            />
            {fieldError("upi_id")}
            <p className="text-xs text-muted-foreground">
              A UPI QR is auto-generated at checkout with the order amount
              pre-filled.
            </p>
          </div>

          {form.upi_id.includes("@") && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Live preview (₹100)</p>
              <div className="max-w-xs">
                <UpiQrDisplay
                  upiId={form.upi_id}
                  upiQrImageUrl={upiQrUrl}
                  amount={100}
                  restaurantName={form.name}
                />
              </div>
              <Button type="button" variant="outline" onClick={testUpi} className="gap-2">
                <Smartphone className="w-4 h-4" /> Test UPI Payment
              </Button>
            </div>
          )}

          <div className="pt-2 border-t">
            <ImageUpload
              value={upiQrUrl}
              onChange={setUpiQrUrl}
              label="Or upload your own UPI QR image"
              aspectRatio="square"
            />
            <p className="text-xs text-muted-foreground mt-2">
              An uploaded QR takes priority over the auto-generated one.
            </p>
          </div>
        </TabsContent>

        {/* TAXES */}
        <TabsContent value="taxes" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4 max-w-lg">
            <div className="space-y-1.5">
              <Label htmlFor="tax_rate">Tax rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.tax_rate}
                onChange={(e) => set("tax_rate", e.target.value)}
              />
              {fieldError("tax_rate")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gst">GST number</Label>
              <Input
                id="gst"
                value={form.gst_number}
                onChange={(e) => set("gst_number", e.target.value)}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(v) => set("currency", String(v ?? "INR"))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ INR</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="AED">د.إ AED</SelectItem>
                  <SelectItem value="GBP">£ GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Timezone</Label>
              <Input
                id="tz"
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
                placeholder="Asia/Kolkata"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom save bar */}
      <div className="border-t mt-6">{SaveBar}</div>
    </div>
  );
}
