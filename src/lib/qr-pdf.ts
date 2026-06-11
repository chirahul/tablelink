import { jsPDF } from "jspdf";

export type QrEntry = { tableNumber: string; dataUrl: string };

/**
 * Build a printable A4 PDF of table QR codes — 2 per row, each in a bordered
 * card with the restaurant name and table number. Returns a Blob.
 * Call client-side (jsPDF runs in the browser).
 */
export function buildQrPdf(entries: QrEntry[], restaurantName: string): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;
  const gap = 8;
  const cols = 2;
  const cellW = (pageW - margin * 2 - gap * (cols - 1)) / cols;
  const cellH = cellW + 22; // QR square + caption space
  const rowsPerPage = Math.max(1, Math.floor((pageH - margin * 2) / cellH));
  const perPage = cols * rowsPerPage;

  entries.forEach((entry, idx) => {
    const posInPage = idx % perPage;
    if (idx > 0 && posInPage === 0) doc.addPage();
    const col = posInPage % cols;
    const row = Math.floor(posInPage / cols);
    const x = margin + col * (cellW + gap);
    const y = margin + row * cellH;

    doc.setDrawColor(220);
    doc.roundedRect(x, y, cellW, cellH, 3, 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(restaurantName, x + cellW / 2, y + 8, {
      align: "center",
      maxWidth: cellW - 8,
    });

    const qrSize = cellW - 24;
    doc.addImage(entry.dataUrl, "PNG", x + (cellW - qrSize) / 2, y + 12, qrSize, qrSize);

    doc.setFontSize(13);
    doc.text(`Table ${entry.tableNumber}`, x + cellW / 2, y + cellH - 6, {
      align: "center",
    });
  });

  return doc.output("blob");
}

/** Trigger a browser download of a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
