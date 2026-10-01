-- =============================================================
-- João do Carro — Cargos da equipe + contas de clientes (favoritos)
-- Execute depois de 20260101000003_storage.sql
--
-- Cargos (coluna admins.role):
--   'admin'       → tudo: veículos, leads, configurações e equipe
--   'funcionario' → cadastra, edita e exclui anúncios e atende leads,
--                   mas NÃO mexe nas configurações nem na equipe
--
-- Qualquer pessoa pode criar conta no site (cliente). Cliente não tem
-- linha na tabela admins: só consegue salvar os próprios favoritos.
-- =============================================================

-- -------------------------------------------------------------
-- Cargo na tabela da equipe (quem já era admin continua admin)
-- -------------------------------------------------------------
alter table public.admins
  add column if not exists role text not null default 'admin'
  check (role in ('admin', 'funcionario'));

alter table public.admins add column if not exists email text;

-- -------------------------------------------------------------
-- is_staff(): qualquer membro da equipe (admin ou funcionário)
-- is_admin(): somente o cargo admin
-- -------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and role = 'admin');
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated;

-- -------------------------------------------------------------
-- Veículos, fotos e leads: liberados para toda a equipe
-- -------------------------------------------------------------
drop policy if exists "vehicles_public_read" on public.vehicles;
create policy "vehicles_public_read" on public.vehicles
  for select to anon, authenticated
  using (published = true or public.is_staff());

drop policy if exists "vehicles_admin_insert" on public.vehicles;
create policy "vehicles_admin_insert" on public.vehicles
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists "vehicles_admin_update" on public.vehicles;
create policy "vehicles_admin_update" on public.vehicles
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "vehicles_admin_delete" on public.vehicles;
create policy "vehicles_admin_delete" on public.vehicles
  for delete to authenticated
  using (public.is_staff());

drop policy if exists "vehicle_images_public_read" on public.vehicle_images;
create policy "vehicle_images_public_read" on public.vehicle_images
  for select to anon, authenticated
  using (
    public.is_staff()
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_images.vehicle_id and v.published = true
    )
  );

drop policy if exists "vehicle_images_admin_write" on public.vehicle_images;
create policy "vehicle_images_admin_write" on public.vehicle_images
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select" on public.leads
  for select to authenticated
  using (public.is_staff());

drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update" on public.leads
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "leads_admin_delete" on public.leads;
create policy "leads_admin_delete" on public.leads
  for delete to authenticated
  using (public.is_staff());

-- Fotos no Storage: toda a equipe pode enviar/remover
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());

-- store_settings continua usando is_admin() (somente o cargo admin).

-- -------------------------------------------------------------
-- Tabela da equipe: cada um vê o próprio registro; admin vê todos.
-- Alterações só pelas funções abaixo (que validam as regras).
-- -------------------------------------------------------------
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Adiciona (ou muda o cargo de) uma pessoa que JÁ TEM CONTA no site.
create or replace function public.staff_upsert(p_email text, p_role text, p_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Somente administradores podem gerenciar a equipe.' using errcode = '42501';
  end if;
  if p_role not in ('admin', 'funcionario') then
    raise exception 'Cargo inválido.';
  end if;

  select id into v_user from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_user is null then
    raise exception 'Nenhuma conta encontrada com este e-mail.' using errcode = 'P0002';
  end if;
  if v_user = auth.uid() and p_role <> 'admin' then
    raise exception 'Você não pode rebaixar o seu próprio acesso.';
  end if;

  insert into public.admins (user_id, name, email, role)
  values (v_user, nullif(trim(p_name), ''), lower(trim(p_email)), p_role)
  on conflict (user_id) do update
    set role = excluded.role,
        email = excluded.email,
        name = coalesce(excluded.name, public.admins.name);

  return v_user;
end;
$$;

-- Remove o acesso ao painel (a conta continua existindo como cliente).
create or replace function public.staff_remove(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Somente administradores podem gerenciar a equipe.' using errcode = '42501';
  end if;
  if p_user = auth.uid() then
    raise exception 'Você não pode remover o seu próprio acesso.';
  end if;
  delete from public.admins where user_id = p_user;
end;
$$;

revoke all on function public.staff_upsert(text, text, text) from public;
revoke all on function public.staff_remove(uuid) from public;
grant execute on function public.staff_upsert(text, text, text) to authenticated;
grant execute on function public.staff_remove(uuid) to authenticated;

-- -------------------------------------------------------------
-- Favoritos dos clientes
-- -------------------------------------------------------------
create table if not exists public.favorites (
  user_id     uuid not null references auth.users (id) on delete cascade,
  vehicle_id  uuid not null references public.vehicles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, delete on public.favorites to authenticated;
