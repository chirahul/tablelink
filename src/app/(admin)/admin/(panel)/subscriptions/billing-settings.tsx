"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { updateBillingConfig } from "@/app/(admin)/actions";
import type { BillingConfig } from "@/lib/billing-config";

export function BillingSettings({ config }: { config: BillingConfig }) {
  const [qrUrl, setQrUrl] = useState<string | null>(config.qrUrl);
  const [upi, setUpi] = useState(config.upi);
  const [phone, setPhone] = useState(config.phone);
  const [email, setEmail] = useState(config.email);
  const [uploading, setUploading] = useState(false);
  const [isPending, start] = useTransition();

  function save() {
    if (uploading) {
      toast.error("Image is still uploading — give it a second.");
      return;
    }
    const fd = new FormData();
    fd.set("billing_qr_url", qrUrl ?? "");
    fd.set("billing_upi", upi);
    fd.set("billing_phone", phone);
    fd.set("billing_email", email);
    start(async () => {
      const r = await updateBillingConfig(fd);
      if (r.success) toast.success(r.message ?? "Saved");
      else toast.error(r.error);
    });
  }

  return (
    <details className="rounded-2xl border bg-card p-5 group">
      <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
        <span>Payment details (the QR &amp; contact owners pay with)</span>
        <span className="text-xs text-muted-foreground group-open:hidden">Edit ▾</span>
      </summary>

      <div className="flex flex-col md:flex-row gap-5 mt-4">
        <div className="shrink-0">
          <ImageUpload
            value={qrUrl}
            onChange={setQrUrl}
            onUploadingChange={setUploading}
            label="Payment QR"
            aspectRatio="square"
            size="lg"
          />
          <p className="text-xs text-muted-foreground mt-1 max-w-56">
            Upload your UPI / payment QR. Owners scan this to pay for their plan.
          </p>
        </div>
        <div className="grid gap-3 flex-1 content-start">
          <div className="space-y-1.5">
            <Label htmlFor="upi">UPI ID</Label>
            <Input id="upi" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@upi" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bphone">WhatsApp / Phone</Label>
            <Input id="bphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bemail">Email</Label>
            <Input id="bemail" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Button onClick={save} disabled={isPending || uploading}>
              {uploading ? "Uploading…" : isPending ? "Saving…" : "Save payment details"}
            </Button>
          </div>
        </div>
      </div>
    </details>
  );
}
