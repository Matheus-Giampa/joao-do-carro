import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { DemoBanner } from "@/components/site/DemoBanner";
import { getStoreSettings } from "@/services/settings";
import { generalMessage, whatsappLink } from "@/lib/whatsapp";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  const waHref = whatsappLink(settings.whatsapp, generalMessage(settings.company_name));

  return (
    <>
      {!isSupabaseConfigured && <DemoBanner />}
      <Header companyName={settings.company_name} logoUrl={settings.logo_url} phone={settings.phone} whatsappHref={waHref} />
      <main id="conteudo" className="min-h-[60vh]">
        {children}
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat href={waHref} />
    </>
  );
}
