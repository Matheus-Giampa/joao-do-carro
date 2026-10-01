-- =============================================================
-- João do Carro — Segurança (Row Level Security)
-- Execute depois de 20260101000001_schema.sql
-- =============================================================

-- -------------------------------------------------------------
-- is_admin(): verdadeiro se o usuário logado está na tabela admins.
-- SECURITY DEFINER evita recursão nas políticas da própria tabela admins.
-- -------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins          enable row level security;
alter table public.vehicles        enable row level security;
alter table public.vehicle_images  enable row level security;
alter table public.leads           enable row level security;
alter table public.store_settings  enable row level security;

-- -------------------------------------------------------------
-- admins: o usuário só enxerga o próprio registro.
-- Inclusão/remoção de administradores somente pelo SQL Editor (service role).
-- -------------------------------------------------------------
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- -------------------------------------------------------------
-- vehicles: público vê apenas publicados; administradores fazem tudo.
-- -------------------------------------------------------------
drop policy if exists "vehicles_public_read" on public.vehicles;
create policy "vehicles_public_read" on public.vehicles
  for select to anon, authenticated
  using (published = true or public.is_admin());

drop policy if exists "vehicles_admin_insert" on public.vehicles;
create policy "vehicles_admin_insert" on public.vehicles
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "vehicles_admin_update" on public.vehicles;
create policy "vehicles_admin_update" on public.vehicles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "vehicles_admin_delete" on public.vehicles;
create policy "vehicles_admin_delete" on public.vehicles
  for delete to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------
-- vehicle_images: público vê fotos de veículos publicados.
-- -------------------------------------------------------------
drop policy if exists "vehicle_images_public_read" on public.vehicle_images;
create policy "vehicle_images_public_read" on public.vehicle_images
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_images.vehicle_id and v.published = true
    )
  );

drop policy if exists "vehicle_images_admin_write" on public.vehicle_images;
create policy "vehicle_images_admin_write" on public.vehicle_images
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------------
-- leads: qualquer visitante pode ENVIAR um lead (sempre com status 'novo').
-- Somente administradores podem ver, alterar e excluir.
-- -------------------------------------------------------------
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert to anon, authenticated
  with check (status = 'novo' and notes is null);

drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select" on public.leads
  for select to authenticated
  using (public.is_admin());

drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update" on public.leads
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "leads_admin_delete" on public.leads;
create policy "leads_admin_delete" on public.leads
  for delete to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------
-- store_settings: leitura pública, alteração somente por administradores.
-- -------------------------------------------------------------
drop policy if exists "settings_public_read" on public.store_settings;
create policy "settings_public_read" on public.store_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "settings_admin_update" on public.store_settings;
create policy "settings_admin_update" on public.store_settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Permissões de tabela (RLS continua valendo por cima delas)
grant usage on schema public to anon, authenticated;
grant select on public.vehicles, public.vehicle_images, public.store_settings to anon, authenticated;
grant insert on public.leads to anon, authenticated;
grant select, insert, update, delete on public.vehicles, public.vehicle_images, public.leads to authenticated;
grant update on public.store_settings to authenticated;
grant select on public.admins to authenticated;
