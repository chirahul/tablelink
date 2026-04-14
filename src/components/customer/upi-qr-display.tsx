"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  upiId: string | null;
  upiQrImageUrl: string | null;
  amount: number;
  restaurantName: string;
};

export function UpiQrDisplay({
  upiId,
  upiQrImageUrl,
  amount,
  restaurantName,
}: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    // If restaurant uploaded their own QR, use that directly.
    if (upiQrImageUrl) return;

    if (!upiId) return;

    // Generate a UPI QR: upi://pay?pa=<upiId>&pn=<name>&am=<amount>&cu=INR
    const uri = `upi://pay?pa=${encodeURIComponent(
      upiId
    )}&pn=${encodeURIComponent(restaurantName)}&am=${amount.toFixed(
      2
    )}&cu=INR`;

    QRCode.toDataURL(uri, { width: 300, margin: 1 }).then(setDataUrl);
  }, [upiId, upiQrImageUrl, amount, restaurantName]);

  if (upiQrImageUrl) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={upiQrImageUrl}
          alt="UPI QR"
          className="w-48 h-48 object-contain"
        />
        <p className="text-xs text-muted-foreground">
          Scan with any UPI app • Send after scanning
        </p>
      </div>
    );
  }

  if (!upiId) {
    return (
      <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground text-center">
        Online payment not configured for this restaurant.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="UPI QR" className="w-48 h-48" />
      ) : (
        <div className="w-48 h-48 bg-muted animate-pulse rounded" />
      )}
      <p className="text-xs text-muted-foreground text-center">
        Scan with any UPI app<br />
        <span className="font-mono">{upiId}</span>
      </p>
    </div>
  );
}
