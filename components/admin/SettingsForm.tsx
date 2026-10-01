"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { saveSettings } from "@/app/actions/admin";
import { uploadToStorage } from "./ImageManager";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import type { ActionResult, StoreSettings } from "@/types";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-7">
      <h2 className="font-display text-lg font-bold text-ink-950">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function F({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function SettingsForm({ settings: s }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveSettings, null);
  const [logo, setLogo] = useState<string | null>(s.logo_url);
  const [uploading, setUploading] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  async function onLogo(f: File) {
    setUploading(true);
    try {
      const { url } = await uploadToStorage(f, "branding");
      setLogo(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha no envio da logo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-6 pb-24"
    >
      <input type="hidden" name="logo_url" value={logo ?? ""} />

      <Section title="Identidade">
        <F label="Nome da empresa">
          <input name="company_name" defaultValue={s.company_name} className="input" required />
        </F>
        <F label="Slogan">
          <input name="slogan" defaultValue={s.slogan} className="input" />
        </F>
        <F label="Logo" wide hint="Sem logo enviada, o site usa a logo vetorial padrão da João do Carro. Prefira PNG com fundo transparente.">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-20 min-w-[200px] place-items-center rounded-xl bg-ink-950 px-5">
              <Logo logoUrl={logo} size="sm" name={s.company_name} />
            </div>
            <button type="button" onClick={() => file.current?.click()} className="btn btn-outline btn-sm" disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Enviar logo
            </button>
            {logo && (
              <button type="button" onClick={() => setLogo(null)} className="btn btn-ghost btn-sm text-brand-700">
                <Trash2 className="h-4 w-4" /> Usar logo padrão
              </button>
            )}
            <input ref={file} type="file" accept="image/png,image/webp,image/svg+xml,image/jpeg" className="hidden" onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])} />
          </div>
        </F>
      </Section>

      <Section title="Contato" description="Usados no cabeçalho, rodapé, botões de WhatsApp e página de contato.">
        <F label="WhatsApp" hint="Com DDD. Ex.: (11) 99999-9999. É o número que recebe as mensagens do site.">
          <input name="whatsapp" defaultValue={s.whatsapp ?? ""} className={cn("input", state?.errors?.whatsapp && "border-brand-500")} inputMode="tel" />
        </F>
        <F label="Telefone">
          <input name="phone" defaultValue={s.phone ?? ""} className="input" inputMode="tel" />
        </F>
        <F label="E-mail">
          <input name="email" type="email" defaultValue={s.email ?? ""} className="input" />
        </F>
        <F label="Instagram" hint="@usuario ou link completo">
          <input name="instagram" defaultValue={s.instagram ?? ""} className="input" />
        </F>
        <F label="Facebook" hint="Nome da página ou link completo">
          <input name="facebook" defaultValue={s.facebook ?? ""} className="input" />
        </F>
      </Section>

      <Section title="Localização e horário" description="Exibidos na seção “Onde estamos”, com mapa e botão “Como chegar”.">
        <F label="Endereço completo" wide hint="Ex.: Rua Exemplo, 123 - Bairro, Cidade - UF, CEP">
          <input name="address" defaultValue={s.address ?? ""} className="input" />
        </F>
        <F label="Horário de funcionamento" wide hint="Uma linha por período. Ex.: Seg a Sex: 8h às 18h">
          <textarea name="business_hours" rows={3} defaultValue={s.business_hours ?? ""} className="input" />
        </F>
      </Section>

      <Section title="Página inicial e financiamento">
        <F label="Título do banner">
          <input name="hero_title" defaultValue={s.hero_title} className="input" />
        </F>
        <F label="Subtítulo do banner">
          <input name="hero_subtitle" defaultValue={s.hero_subtitle} className="input" />
        </F>
        <F label="Taxa de juros de referência (% ao mês)" hint="Usada apenas na simulação de financiamento.">
          <input name="finance_monthly_rate" type="number" step="0.01" min={0} max={20} defaultValue={s.finance_monthly_rate} className="input" />
        </F>
      </Section>

      <Section title="Página Sobre" description="Textos da página /sobre. Deixe em branco para ocultar um bloco.">
        <F label="História da loja" wide>
          <textarea name="about_history" rows={5} defaultValue={s.about_history ?? ""} className="input" />
        </F>
        <F label="Missão" wide>
          <textarea name="about_mission" rows={3} defaultValue={s.about_mission ?? ""} className="input" />
        </F>
        <F label="Valores" wide hint="Um valor por linha.">
          <textarea name="about_values" rows={4} defaultValue={s.about_values ?? ""} className="input" />
        </F>
        <F label="Experiência">
          <textarea name="about_experience" rows={4} defaultValue={s.about_experience ?? ""} className="input" />
        </F>
        <F label="Qualidade dos veículos">
          <textarea name="about_quality" rows={4} defaultValue={s.about_quality ?? ""} className="input" />
        </F>
        <F label="Atendimento" wide>
          <textarea name="about_service" rows={3} defaultValue={s.about_service ?? ""} className="input" />
        </F>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <span className={cn("text-sm font-semibold", state?.ok ? "text-emerald-700" : "text-brand-700")} role="status">
            {state?.message}
          </span>
          <button type="submit" disabled={pending || uploading} className="btn btn-primary">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar configurações
          </button>
        </div>
      </div>
    </form>
  );
}
