"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin, assertStaff } from "@/services/auth";
import { STORAGE_BUCKET } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { ActionResult, LeadStatus, VehicleStatus } from "@/types";

const VEHICLE_STATUS: VehicleStatus[] = ["disponivel", "reservado", "vendido"];
const LEAD_STATUS: LeadStatus[] = ["novo", "em_atendimento", "negociacao", "venda_realizada", "perdido"];

function refreshSite() {
  revalidatePath("/", "layout");
}

function str(fd: FormData, key: string, max = 200) {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}

function int(fd: FormData, key: string) {
  const v = str(fd, key, 20);
  if (!v) return null;
  const n = Number(v.replace(/\D/g, ""));
  return Number.isFinite(n) ? n : null;
}

function money(fd: FormData, key: string) {
  const v = str(fd, key, 20);
  if (!v) return null;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Erro inesperado.";
}

type ImageInput = { url: string; storage_path: string | null };

// -------------------------------------------------------------------
// VEÍCULOS
// -------------------------------------------------------------------

/** Cria ou atualiza um veículo (incluindo fotos, ordem e capa). */
export async function saveVehicle(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  let supabase;
  try {
    ({ supabase } = await assertStaff());
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }

  const id = str(fd, "id", 60);
  const currentYear = new Date().getFullYear();
  const data = {
    brand: str(fd, "brand", 60),
    model: str(fd, "model", 80),
    version: str(fd, "version", 120),
    year_manufacture: int(fd, "year_manufacture"),
    year_model: int(fd, "year_model"),
    price: money(fd, "price"),
    previous_price: money(fd, "previous_price"),
    mileage: int(fd, "mileage") ?? 0,
    fuel: str(fd, "fuel", 30),
    transmission: str(fd, "transmission", 30),
    body_type: str(fd, "body_type", 30),
    color: str(fd, "color", 40),
    doors: int(fd, "doors"),
    plate_end: str(fd, "plate_end", 1),
    description: str(fd, "description", 5000),
    options: fd.getAll("options").map(String).map((o) => o.trim().slice(0, 60)).filter(Boolean).slice(0, 80),
    status: (str(fd, "status", 20) ?? "disponivel") as VehicleStatus,
    featured: fd.get("featured") === "on",
    is_offer: fd.get("is_offer") === "on",
    is_new_arrival: fd.get("is_new_arrival") === "on",
    published: fd.get("published") === "on",
  };

  const errors: Record<string, string> = {};
  if (!data.brand) errors.brand = "Informe a marca.";
  if (!data.model) errors.model = "Informe o modelo.";
  if (!data.year_manufacture || data.year_manufacture < 1950 || data.year_manufacture > currentYear + 1) errors.year_manufacture = "Ano inválido.";
  if (!data.year_model || data.year_model < 1950 || data.year_model > currentYear + 2) errors.year_model = "Ano inválido.";
  if (data.price == null || data.price <= 0) errors.price = "Informe o preço.";
  if (!data.fuel) errors.fuel = "Selecione o combustível.";
  if (!data.transmission) errors.transmission = "Selecione o câmbio.";
  if (!data.body_type) errors.body_type = "Selecione a carroceria.";
  if (data.plate_end && !/^\d$/.test(data.plate_end)) errors.plate_end = "Use um dígito (0-9).";
  if (!VEHICLE_STATUS.includes(data.status)) errors.status = "Status inválido.";
  if (data.previous_price != null && data.previous_price <= 0) data.previous_price = null;
  if (Object.keys(errors).length) return { ok: false, message: "Confira os campos destacados.", errors };

  let images: ImageInput[] = [];
  try {
    const parsed = JSON.parse(String(fd.get("images") ?? "[]"));
    if (Array.isArray(parsed)) {
      images = parsed
        .filter((i) => i && typeof i.url === "string")
        .slice(0, 40)
        .map((i) => ({ url: String(i.url).slice(0, 1000), storage_path: i.storage_path ? String(i.storage_path).slice(0, 300) : null }));
    }
  } catch {
    return { ok: false, message: "Lista de fotos inválida." };
  }

  let vehicleId = id;

  if (id) {
    const { error } = await supabase.from("vehicles").update(data).eq("id", id);
    if (error) return { ok: false, message: `Erro ao salvar: ${error.message}` };
  } else {
    // URL amigável: marca-modelo-versao-ano (ex.: toyota-corolla-xei-2024)
    const base = slugify([data.brand, data.model, data.version?.split(" ")[0], data.year_model].filter(Boolean).join(" "));
    const { data: existing } = await supabase.from("vehicles").select("slug").like("slug", `${base}%`);
    const taken = new Set((existing ?? []).map((r) => r.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

    const { data: created, error } = await supabase.from("vehicles").insert({ ...data, slug }).select("id").single();
    if (error || !created) return { ok: false, message: `Erro ao cadastrar: ${error?.message}` };
    vehicleId = created.id;
  }

  // Sincroniza fotos: remove do Storage as que saíram e regrava a ordem (posição 0 = capa)
  const { data: oldImages } = await supabase.from("vehicle_images").select("storage_path").eq("vehicle_id", vehicleId!);
  const keep = new Set(images.map((i) => i.storage_path).filter(Boolean));
  const removed = (oldImages ?? []).map((i) => i.storage_path).filter((p): p is string => !!p && !keep.has(p));
  if (removed.length) await supabase.storage.from(STORAGE_BUCKET).remove(removed);

  const { error: delErr } = await supabase.from("vehicle_images").delete().eq("vehicle_id", vehicleId!);
  if (delErr) return { ok: false, message: `Erro nas fotos: ${delErr.message}` };
  if (images.length) {
    const { error: imgErr } = await supabase
      .from("vehicle_images")
      .insert(images.map((img, position) => ({ vehicle_id: vehicleId, url: img.url, storage_path: img.storage_path, position })));
    if (imgErr) return { ok: false, message: `Erro ao salvar fotos: ${imgErr.message}` };
  }

  refreshSite();
  if (!id) redirect("/admin/veiculos?salvo=1");
  return { ok: true, message: "Veículo atualizado com sucesso." };
}

/** Atualizações rápidas da listagem: status, destaque, publicado, oferta, preço. */
export async function updateVehicleQuick(
  id: string,
  patch: Partial<{ status: VehicleStatus; featured: boolean; published: boolean; is_offer: boolean; price: number }>,
): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const clean: Record<string, unknown> = {};
    if (patch.status && VEHICLE_STATUS.includes(patch.status)) clean.status = patch.status;
    if (typeof patch.featured === "boolean") clean.featured = patch.featured;
    if (typeof patch.published === "boolean") clean.published = patch.published;
    if (typeof patch.is_offer === "boolean") clean.is_offer = patch.is_offer;
    if (typeof patch.price === "number" && patch.price > 0 && patch.price < 100_000_000) clean.price = patch.price;
    if (!Object.keys(clean).length) return { ok: false, message: "Nada para atualizar." };
    const { error } = await supabase.from("vehicles").update(clean).eq("id", id);
    if (error) return { ok: false, message: error.message };
    refreshSite();
    return { ok: true, message: "Atualizado." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { data: imgs } = await supabase.from("vehicle_images").select("storage_path").eq("vehicle_id", id);
    const paths = (imgs ?? []).map((i) => i.storage_path).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    refreshSite();
    return { ok: true, message: "Veículo excluído." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

// -------------------------------------------------------------------
// LEADS
// -------------------------------------------------------------------

export async function updateLead(id: string, patch: { status?: LeadStatus; notes?: string }): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const clean: Record<string, unknown> = {};
    if (patch.status && LEAD_STATUS.includes(patch.status)) clean.status = patch.status;
    if (typeof patch.notes === "string") clean.notes = patch.notes.slice(0, 2000) || null;
    const { error } = await supabase.from("leads").update(clean).eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Lead atualizado." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await assertStaff();
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Lead excluído." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

// -------------------------------------------------------------------
// CONFIGURAÇÕES DA LOJA
// -------------------------------------------------------------------

export async function saveSettings(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await assertAdmin();
    const rate = Number(String(fd.get("finance_monthly_rate") ?? "").replace(",", "."));
    const data = {
      company_name: str(fd, "company_name", 80) ?? "João do Carro",
      slogan: str(fd, "slogan", 160) ?? "",
      logo_url: str(fd, "logo_url", 1000),
      phone: str(fd, "phone", 30),
      whatsapp: str(fd, "whatsapp", 30),
      email: str(fd, "email", 160),
      instagram: str(fd, "instagram", 200),
      facebook: str(fd, "facebook", 200),
      address: str(fd, "address", 300),
      business_hours: str(fd, "business_hours", 500),
      hero_title: str(fd, "hero_title", 120) ?? "Encontre o carro ideal para você",
      hero_subtitle: str(fd, "hero_subtitle", 240) ?? "",
      finance_monthly_rate: Number.isFinite(rate) && rate >= 0 && rate <= 20 ? rate : 1.79,
      about_history: str(fd, "about_history", 5000),
      about_mission: str(fd, "about_mission", 2000),
      about_values: str(fd, "about_values", 2000),
      about_experience: str(fd, "about_experience", 2000),
      about_quality: str(fd, "about_quality", 2000),
      about_service: str(fd, "about_service", 2000),
    };
    if (data.whatsapp && data.whatsapp.replace(/\D/g, "").length < 10) {
      return { ok: false, message: "WhatsApp inválido: inclua o DDD.", errors: { whatsapp: "Inclua o DDD." } };
    }
    const { data: updated, error } = await supabase.from("store_settings").update(data).eq("id", 1).select("id");
    if (error) return { ok: false, message: error.message };
    if (!updated?.length) return { ok: false, message: "Linha de configurações não encontrada. Execute novamente a migration do banco." };
    refreshSite();
    return { ok: true, message: "Configurações salvas! O site já foi atualizado." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
