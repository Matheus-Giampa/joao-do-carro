import type { LeadSource, LeadStatus, SortOption, StaffRole, VehicleStatus } from "@/types";

export const FUEL_OPTIONS = ["Flex", "Gasolina", "Etanol", "Diesel", "Híbrido", "Elétrico", "GNV"] as const;

export const TRANSMISSION_OPTIONS = ["Manual", "Automático", "Automatizado", "CVT"] as const;

export const BODY_TYPES = ["Hatch", "Sedan", "SUV", "Picape", "Utilitário", "Conversível", "Minivan"] as const;

export const VEHICLE_OPTIONS = [
  "Ar-condicionado",
  "Direção elétrica",
  "Vidros elétricos",
  "Travas elétricas",
  "Central multimídia",
  "Bluetooth",
  "Android Auto",
  "Apple CarPlay",
  "Câmera de ré",
  "Sensor de estacionamento",
  "Bancos de couro",
  "Controle de estabilidade",
  "Controle de tração",
  "Airbags",
  "ABS",
  "Piloto automático",
  "Chave presencial",
  "Teto solar",
  "Rodas de liga leve",
  "Faróis de LED",
  "Partida por botão",
  "Ar-condicionado digital",
] as const;

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  negociacao: "Negociação",
  venda_realizada: "Venda realizada",
  perdido: "Perdido",
};

export const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  novo: "bg-sky-100 text-sky-800 ring-sky-200",
  em_atendimento: "bg-amber-100 text-amber-800 ring-amber-200",
  negociacao: "bg-violet-100 text-violet-800 ring-violet-200",
  venda_realizada: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  perdido: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  interesse: "Interesse em veículo",
  proposta: "Proposta",
  financiamento: "Financiamento",
  contato: "Contato",
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "menor-km", label: "Menor quilometragem" },
  { value: "maior-ano", label: "Maior ano" },
];

export const INSTALLMENT_OPTIONS = [12, 24, 36, 48, 60] as const;

export const PAGE_SIZE = 12;

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "media";

export const ROLE_LABEL: Record<StaffRole, string> = { admin: "Administrador", funcionario: "Funcionário" };

export const ROLE_DESCRIPTION: Record<StaffRole, string> = {
  admin: "Acesso total: anúncios, leads, configurações da loja e equipe.",
  funcionario: "Cadastra, edita e exclui anúncios e atende os leads. Não mexe nas configurações nem na equipe.",
};
