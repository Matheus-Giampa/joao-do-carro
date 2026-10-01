export type VehicleStatus = "disponivel" | "reservado" | "vendido";

export type LeadStatus = "novo" | "em_atendimento" | "negociacao" | "venda_realizada" | "perdido";

export type LeadSource = "interesse" | "proposta" | "financiamento" | "contato";

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  url: string;
  storage_path: string | null;
  position: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string | null;
  year_manufacture: number;
  year_model: number;
  price: number;
  previous_price: number | null;
  mileage: number;
  fuel: string;
  transmission: string;
  body_type: string;
  color: string | null;
  doors: number | null;
  plate_end: string | null;
  description: string | null;
  options: string[];
  status: VehicleStatus;
  featured: boolean;
  is_offer: boolean;
  is_new_arrival: boolean;
  published: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  images: VehicleImage[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  vehicle_id: string | null;
  vehicle_label: string | null;
  message: string | null;
  source: LeadSource;
  down_payment: number | null;
  installments: number | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
}

export interface StoreSettings {
  company_name: string;
  slogan: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  address: string | null;
  business_hours: string | null;
  hero_title: string;
  hero_subtitle: string;
  finance_monthly_rate: number;
  about_history: string | null;
  about_mission: string | null;
  about_values: string | null;
  about_experience: string | null;
  about_quality: string | null;
  about_service: string | null;
}

export type SortOption = "recentes" | "menor-preco" | "maior-preco" | "menor-km" | "maior-ano";

export interface VehicleFilters {
  q?: string;
  marca?: string;
  modelo?: string;
  precoMin?: number;
  precoMax?: number;
  anoMin?: number;
  anoMax?: number;
  kmMax?: number;
  combustivel?: string;
  cambio?: string;
  carroceria?: string;
  oferta?: boolean;
  ordem?: SortOption;
  pagina?: number;
}

export interface FilterOptions {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
  years: number[];
  fuels: string[];
  transmissions: string[];
  bodyTypes: string[];
}

export interface PaginatedVehicles {
  vehicles: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}
