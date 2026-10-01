import { ImageResponse } from "next/og";
import { getStoreSettings } from "@/services/settings";

export const alt = "João do Carro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem padrão de compartilhamento (WhatsApp, Facebook, etc.). */
export default async function OgImage() {
  const s = await getStoreSettings();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="780" height="120" viewBox="300 120 990 170">
          <path d="M632 214 C 740 140 965 104 1114 180 C 1080 178 1060 172 1040 168 C 940 140 780 156 662 214 Z" fill="#e1101d" />
          <path d="M342 272 C 402 236 522 214 650 212 C 822 210 1010 232 1180 200 Q 1236 191 1256 218" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
        </svg>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 10, textTransform: "uppercase" }}>{s.company_name}</div>
        <div style={{ fontSize: 36, color: "#b1b3ba", marginTop: 16 }}>{s.slogan}</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 14, background: "#e1101d" }} />
      </div>
    ),
    size,
  );
}
