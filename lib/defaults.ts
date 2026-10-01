import type { StoreSettings } from "@/types";

/**
 * Valores padrão usados quando o banco ainda não está configurado
 * ou quando algum campo das configurações está vazio.
 * Tudo isso pode ser alterado no painel em /admin/configuracoes.
 */
export const DEFAULT_SETTINGS: StoreSettings = {
  company_name: "João do Carro",
  slogan: "Seu próximo carro está aqui.",
  logo_url: null,
  phone: null,
  whatsapp: null,
  email: null,
  instagram: null,
  facebook: null,
  address: null,
  business_hours: null,
  hero_title: "Encontre o carro ideal para você",
  hero_subtitle: "Escolha entre os veículos disponíveis na João do Carro.",
  finance_monthly_rate: 1.79,
  about_history:
    "A João do Carro nasceu com um propósito simples: tornar a compra do seu próximo veículo mais fácil, transparente e segura. Este texto pode ser personalizado no painel administrativo para contar a história real da loja.",
  about_mission:
    "Ajudar cada cliente a encontrar o veículo certo para o seu momento, com informações claras e atendimento próximo.",
  about_values: "Transparência\nRespeito ao cliente\nCompromisso com a palavra\nAtendimento humano",
  about_experience:
    "Conte aqui a experiência da equipe no mercado automotivo. Edite este texto em Painel → Configurações → Página Sobre.",
  about_quality:
    "Descreva aqui como os veículos são selecionados e preparados antes de chegarem ao estoque.",
  about_service:
    "Atendimento pelo WhatsApp, telefone ou na loja, com simulação de financiamento e acompanhamento do início ao fim da negociação.",
};

export function mergeSettings(partial: Partial<StoreSettings> | null | undefined): StoreSettings {
  const result = { ...DEFAULT_SETTINGS };
  if (!partial) return result;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof StoreSettings)[]) {
    const value = partial[key];
    if (value !== null && value !== undefined && value !== "") {
      (result as Record<string, unknown>)[key] = key === "finance_monthly_rate" ? Number(value) : value;
    }
  }
  return result;
}
