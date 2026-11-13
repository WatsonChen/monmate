import QRCode from "qrcode";

/** 在瀏覽器內產生 QR Code（PNG data URL），不連外部服務：現場網路差也能顯示，內容也不會傳給第三方。 */
export function makeQrDataUrl(value: string, size: number, errorCorrectionLevel: "M" | "H" = "M") {
  return QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel });
}
