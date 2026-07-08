"use client";

import { useEffect, useState } from "react";
import { QrCode, X, Download } from "lucide-react";
import { apiFetch } from "../lib/api";
import { LogoSpinner } from "./LogoSpinner";

type VenueQrData = {
  venueCode: string;
  venueUrl: string;
};

type Props = {
  eventId: string;
  eventName: string;
  token: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildBrandedQrCanvas(qrImageUrl: string, eventName: string): Promise<HTMLCanvasElement> {
  const [qrImg, markImg] = await Promise.all([loadImage(qrImageUrl), loadImage("/brand/logo-mark.png")]);

  const width = 480;
  const padding = 40;
  const qrSize = width - padding * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.font = "700 22px system-ui, sans-serif";
  const eventNameLines = wrapText(ctx, eventName, width - padding * 2);
  const eventNameLineHeight = 30;

  const headerHeight = padding + eventNameLines.length * eventNameLineHeight + 16;
  const footerHeight = 60;
  const height = headerHeight + qrSize + footerHeight;
  canvas.height = height;

  ctx.fillStyle = "#FBFAF7";
  ctx.fillRect(0, 0, width, height);

  let y = padding;
  ctx.fillStyle = "#1A2421";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  for (const line of eventNameLines) {
    y += eventNameLineHeight;
    ctx.fillText(line, width / 2, y - eventNameLineHeight / 2 + 8);
  }
  y = headerHeight;

  ctx.drawImage(qrImg, padding, y, qrSize, qrSize);

  // Center mark sized to stay within the QR's ecc=H error-correction budget (~30%).
  const markBadge = qrSize * 0.2;
  const markPadding = markBadge * 0.15;
  const badgeX = padding + (qrSize - markBadge) / 2;
  const badgeY = y + (qrSize - markBadge) / 2;
  const badgeRadius = 10;

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, markBadge, markBadge, badgeRadius);
  ctx.fill();
  ctx.drawImage(
    markImg,
    badgeX + markPadding,
    badgeY + markPadding,
    markBadge - markPadding * 2,
    markBadge - markPadding * 2,
  );

  y += qrSize + 32;

  ctx.fillStyle = "#1A242199";
  ctx.font = "400 13px system-ui, sans-serif";
  ctx.fillText("將此 QR Code 列印後張貼於活動現場，掃描即可自助報到", width / 2, y);

  return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function VenueQrButton({ eventId, eventName, token }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<VenueQrData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function openModal() {
    setOpen(true);
    if (data) return;
    setLoading(true);
    try {
      const res = await apiFetch<VenueQrData>(`/events/${eventId}/venue-qr`, { token });
      if (res.success && res.data) setData(res.data);
    } finally {
      setLoading(false);
    }
  }

  const qrImageUrl = data
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(data.venueUrl)}`
    : null;

  useEffect(() => {
    if (!qrImageUrl) return;
    let cancelled = false;
    void buildBrandedQrCanvas(qrImageUrl, eventName).then((canvas) => {
      if (!cancelled) setDownloadUrl(canvas.toDataURL("image/png"));
    });
    return () => {
      cancelled = true;
    };
  }, [qrImageUrl, eventName]);

  return (
    <>
      <button
        type="button"
        onClick={() => void openModal()}
        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-charcoal/15 bg-white px-3 text-sm font-bold hover:bg-paper sm:w-auto sm:px-4"
      >
        <QrCode size={14} />
        現場 QR
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-charcoal/10 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">現場報到 QR Code</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-cloud">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center">
              {(loading || (qrImageUrl && !downloadUrl)) && (
                <div className="flex justify-center py-10"><LogoSpinner size={72} /></div>
              )}
              {qrImageUrl && downloadUrl && (
                <>
                  <img src={downloadUrl} alt="Venue QR Code" className="w-full max-w-[280px] rounded-lg border border-charcoal/10" />
                  <a
                    href={downloadUrl}
                    download={`venue-qr-${eventId}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-orange text-sm font-bold text-white"
                  >
                    <Download size={16} />
                    下載 QR Code
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
