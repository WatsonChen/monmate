"use client";

import { useState } from "react";
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

export function VenueQrButton({ eventId, eventName, token }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<VenueQrData | null>(null);
  const [loading, setLoading] = useState(false);

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
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.venueUrl)}`
    : null;

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
            <p className="mt-1 text-sm text-charcoal/60">{eventName}</p>

            <div className="mt-5 flex flex-col items-center">
              {loading && <div className="flex justify-center py-10"><LogoSpinner size={72} /></div>}
              {qrImageUrl && (
                <>
                  <img src={qrImageUrl} alt="Venue QR Code" className="h-56 w-56 rounded-lg border border-charcoal/10" />
                  <p className="mt-3 text-center text-xs text-charcoal/50">
                    將此 QR Code 列印後張貼於活動現場，受邀者掃描後即可自助報到
                  </p>
                  <a
                    href={qrImageUrl}
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
