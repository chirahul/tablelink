"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Table } from "@/lib/types";

type Props = {
  table: Table | null;
  restaurantSlug: string;
  restaurantName: string;
  onClose: () => void;
};

export function QrDialog({
  table,
  restaurantSlug,
  restaurantName,
  onClose,
}: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (!table) return;
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://tablelink-amber.vercel.app";
    const menuUrl = `${origin}/menu/${restaurantSlug}?table=${table.id}`;
    setUrl(menuUrl);

    QRCode.toDataURL(menuUrl, {
      width: 600,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setDataUrl);
  }, [table, restaurantSlug]);

  function download() {
    if (!dataUrl || !table) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${restaurantSlug}-table-${table.table_number}.png`;
    a.click();
  }

  function print() {
    if (!dataUrl || !table) return;
    const win = window.open("", "_blank", "width=600,height=800");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Table ${table.table_number} - ${restaurantName}</title>
          <style>
            body {
              margin: 0; padding: 32px; font-family: -apple-system, system-ui, sans-serif;
              display: flex; align-items: center; justify-content: center; min-height: 100vh;
            }
            .card {
              text-align: center; border: 2px solid #000; padding: 24px; border-radius: 16px;
              max-width: 400px;
            }
            h1 { margin: 0 0 4px; font-size: 20px; }
            .sub { color: #555; font-size: 14px; margin-bottom: 16px; }
            img { width: 100%; max-width: 320px; }
            .table { font-size: 32px; font-weight: 800; margin-top: 8px; }
            .cta { margin-top: 16px; font-size: 14px; color: #333; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="card">
            <h1>${restaurantName}</h1>
            <div class="sub">Scan to order</div>
            <img src="${dataUrl}" alt="QR code" />
            <div class="table">Table ${table.table_number}</div>
            <div class="cta">Point your phone camera at the QR code</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <Dialog open={!!table} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {table && (
          <>
            <DialogHeader>
              <DialogTitle>Table {table.table_number} - QR Code</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-3">
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dataUrl}
                  alt="QR"
                  className="w-64 h-64 border rounded-lg bg-white"
                />
              ) : (
                <div className="w-64 h-64 bg-muted animate-pulse rounded" />
              )}
              <p className="text-xs text-muted-foreground text-center break-all px-2">
                {url}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={print}>
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
              <Button onClick={download}>
                <Download className="w-4 h-4 mr-1" /> Download PNG
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
