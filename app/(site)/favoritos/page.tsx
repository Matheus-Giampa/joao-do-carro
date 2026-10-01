import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { FavoritesList } from "@/components/account/FavoritesList";
import { getStoreSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Meus favoritos", robots: { index: false, follow: false } };

export default async function FavoritosPage() {
  const s = await getStoreSettings();
  return (
    <>
      <PageHero eyebrow="Sua lista" title="Meus favoritos" subtitle="Os carros que você salvou tocando no coração." />
      <div className="container pt-10">
        <FavoritesList whatsapp={s.whatsapp} companyName={s.company_name} />
      </div>
    </>
  );
}
