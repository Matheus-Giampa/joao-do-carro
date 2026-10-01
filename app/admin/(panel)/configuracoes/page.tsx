import { AdminHeader } from "@/components/admin/AdminHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/services/auth";
import { mergeSettings } from "@/lib/defaults";
import type { StoreSettings } from "@/types";

export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  // Mostra os valores salvos; campos de texto vazios exibem o padrão como ponto de partida.
  const settings = mergeSettings(data as Partial<StoreSettings> | null);
  return (
    <>
      <AdminHeader title="Configurações da loja" subtitle="Essas informações atualizam automaticamente todo o site." />
      <SettingsForm settings={{ ...settings, logo_url: (data as StoreSettings | null)?.logo_url ?? null }} />
    </>
  );
}
