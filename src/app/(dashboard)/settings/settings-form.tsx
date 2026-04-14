"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { updateRestaurantSettings } from "../admin-actions";
import type { Restaurant } from "@/lib/types";

type Props = {
  restaurant: Restaurant;
};

export function SettingsForm({ restaurant }: Props) {
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState<string | null>(restaurant.logo_url);
  const [upiQrUrl, setUpiQrUrl] = useState<string | null>(
    restaurant.upi_qr_image_url
  );

  async function onSubmit(formData: FormData) {
    formData.set("logo_url", logoUrl ?? "");
    formData.set("upi_qr_image_url", upiQrUrl ?? "");

    startTransition(async () => {
      const r = await updateRestaurantSettings(formData);
      if (r.success) toast.success("Settings saved");
      else toast.error(r.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Restaurant profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={restaurant.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={restaurant.description ?? ""}
              rows={2}
              placeholder="Short tagline shown on the menu header"
            />
          </div>
          <ImageUpload
            value={logoUrl}
            onChange={setLogoUrl}
            label="Restaurant logo"
            aspectRatio="square"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={restaurant.phone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={restaurant.email ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={restaurant.address ?? ""}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upi_id">UPI ID</Label>
            <Input
              id="upi_id"
              name="upi_id"
              placeholder="you@upi"
              defaultValue={restaurant.upi_id ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              If set, a UPI QR will be auto-generated at checkout with the
              order amount pre-filled.
            </p>
          </div>
          <ImageUpload
            value={upiQrUrl}
            onChange={setUpiQrUrl}
            label="Or upload your UPI QR image"
            aspectRatio="square"
          />
          <p className="text-xs text-muted-foreground">
            Uploaded QR takes priority over the auto-generated one. Use this
            if your UPI app provides a shareable QR image.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tax</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="tax_rate">Tax rate (%)</Label>
            <Input
              id="tax_rate"
              name="tax_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={restaurant.settings?.tax_rate ?? 0}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
