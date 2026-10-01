-- =============================================================
-- João do Carro — Esquema do banco de dados (PostgreSQL / Supabase)
-- Execute este arquivo primeiro no SQL Editor do Supabase.
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- Tipos enumerados
-- -------------------------------------------------------------
do $$ begin
  create type public.vehicle_status as enum ('disponivel', 'reservado', 'vendido');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum ('novo', 'em_atendimento', 'negociacao', 'venda_realizada', 'perdido');
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------------
-- Função utilitária: atualiza updated_at automaticamente
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------------------------------------------
-- Administradores
-- Cada linha liga um usuário do Supabase Auth ao papel de administrador.
-- -------------------------------------------------------------
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  name        text,
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Veículos
-- -------------------------------------------------------------
create table if not exists public.vehicles (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  brand            text not null,
  model            text not null,
  version          text,
  year_manufacture smallint not null check (year_manufacture between 1900 and 2100),
  year_model       smallint not null check (year_model between 1900 and 2100),
  price            numeric(12, 2) not null check (price >= 0),
  previous_price   numeric(12, 2) check (previous_price is null or previous_price >= 0),
  mileage          integer not null default 0 check (mileage >= 0),
  fuel             text not null,
  transmission     text not null,
  body_type        text not null,
  color            text,
  doors            smallint check (doors is null or doors between 0 and 10),
  plate_end        text check (plate_end is null or plate_end ~ '^[0-9]$'),
  description      text,
  options          text[] not null default '{}',
  status           public.vehicle_status not null default 'disponivel',
  featured         boolean not null default false,
  is_offer         boolean not null default false,
  is_new_arrival   boolean not null default false,
  published        boolean not null default true,
  is_demo          boolean not null default false,
  -- Texto de busca (minúsculo) para pesquisa livre: "corolla", "honda civic"...
  search_text      text generated always as (
    lower(brand || ' ' || model || ' ' || coalesce(version, '') || ' ' || year_model::text)
  ) stored,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on column public.vehicles.is_demo is 'TRUE = veículo fictício de demonstração (seed). Pode ser excluído com segurança.';

create index if not exists vehicles_published_idx on public.vehicles (published, status);
create index if not exists vehicles_brand_model_idx on public.vehicles (brand, model);
create index if not exists vehicles_price_idx on public.vehicles (price);
create index if not exists vehicles_created_idx on public.vehicles (created_at desc);
create index if not exists vehicles_featured_idx on public.vehicles (featured) where featured;

drop trigger if exists vehicles_updated_at on public.vehicles;
create trigger vehicles_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- Fotos dos veículos (position 0 = capa)
-- -------------------------------------------------------------
create table if not exists public.vehicle_images (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references public.vehicles (id) on delete cascade,
  url           text not null,
  storage_path  text,
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists vehicle_images_vehicle_idx on public.vehicle_images (vehicle_id, position);

-- -------------------------------------------------------------
-- Leads (interessados)
-- -------------------------------------------------------------
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 120),
  phone           text check (phone is null or char_length(phone) <= 30),
  whatsapp        text check (whatsapp is null or char_length(whatsapp) <= 30),
  email           text check (email is null or char_length(email) <= 160),
  vehicle_id      uuid references public.vehicles (id) on delete set null,
  vehicle_label   text check (vehicle_label is null or char_length(vehicle_label) <= 200),
  message         text check (message is null or char_length(message) <= 2000),
  source          text not null default 'contato'
                  check (source in ('interesse', 'proposta', 'financiamento', 'contato')),
  down_payment    numeric(12, 2),
  installments    smallint,
  status          public.lead_status not null default 'novo',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- Configurações da loja (linha única, id = 1)
-- -------------------------------------------------------------
create table if not exists public.store_settings (
  id                    smallint primary key default 1 check (id = 1),
  company_name          text not null default 'João do Carro',
  slogan                text not null default 'Seu próximo carro está aqui.',
  logo_url              text,
  phone                 text,
  whatsapp              text,
  email                 text,
  instagram             text,
  facebook              text,
  address               text,
  business_hours        text,
  hero_title            text not null default 'Encontre o carro ideal para você',
  hero_subtitle         text not null default 'Escolha entre os veículos disponíveis na João do Carro.',
  finance_monthly_rate  numeric(5, 2) not null default 1.79 check (finance_monthly_rate between 0 and 20),
  about_history         text,
  about_mission         text,
  about_values          text,
  about_experience      text,
  about_quality         text,
  about_service         text,
  updated_at            timestamptz not null default now()
);

drop trigger if exists store_settings_updated_at on public.store_settings;
create trigger store_settings_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

insert into public.store_settings (id) values (1) on conflict (id) do nothing;
