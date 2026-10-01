import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Inter, Saira } from "next/font/google";
import { getStoreSettings } from "@/services/settings";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Saira({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const logo = Chakra_Petch({ subsets: ["latin"], weight: ["700"], variable: "--font-logo", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  const title = `${s.company_name} | ${s.slogan}`;
  const description = `${s.company_name}: veículos seminovos e usados com fotos, preços, simulação de financiamento e atendimento pelo WhatsApp. ${s.slogan}`;
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: { default: title, template: `%s | ${s.company_name}` },
    description,
    applicationName: s.company_name,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: s.company_name,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} ${logo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
