"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import type { ActionResult, LeadSource } from "@/types";

const SOURCES: LeadSource[] = ["interesse", "proposta", "financiamento", "contato"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function field(fd: FormData, key: string, max = 200) {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}

/** Recebe os formulários públicos (interesse, proposta, financiamento, contato) e salva o lead. */
export async function submitLead(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  // Honeypot anti-spam: campo invisível que pessoas reais não preenchem.
  if (field(fd, "website")) return { ok: true, message: "Recebemos sua mensagem!" };

  const name = field(fd, "name", 120);
  const phone = field(fd, "phone", 30);
  const whatsapp = field(fd, "whatsapp", 30);
  const email = field(fd, "email", 160);
  const message = field(fd, "message", 2000);
  const vehicleLabel = field(fd, "vehicle_label", 200);
  const vehicleIdRaw = field(fd, "vehicle_id", 60);
  const sourceRaw = field(fd, "source", 20) as LeadSource | null;
  const downPayment = Number(String(fd.get("down_payment") ?? "").replace(/\D/g, "")) || null;
  const installments = Number(fd.get("installments")) || null;

  const errors: Record<string, string> = {};
  if (!name || name.length < 2) errors.name = "Informe seu nome.";
  if (!phone && !whatsapp && !email) errors.whatsapp = "Informe ao menos um contato (WhatsApp, telefone ou e-mail).";
  if (email && !EMAIL.test(email)) errors.email = "E-mail inválido.";
  for (const [k, v] of [["phone", phone], ["whatsapp", whatsapp]] as const) {
    if (v && v.replace(/\D/g, "").length < 10) errors[k] = "Número incompleto (inclua o DDD).";
  }
  if (Object.keys(errors).length) return { ok: false, message: "Confira os campos destacados.", errors };

  const lead = {
    name,
    phone,
    whatsapp,
    email,
    message,
    vehicle_label: vehicleLabel,
    vehicle_id: vehicleIdRaw && UUID.test(vehicleIdRaw) ? vehicleIdRaw : null,
    source: sourceRaw && SOURCES.includes(sourceRaw) ? sourceRaw : "contato",
    down_payment: downPayment,
    installments: installments && [12, 24, 36, 48, 60].includes(installments) ? installments : null,
  };

  if (!isSupabaseConfigured) {
    console.info("[lead - modo demonstração, não salvo]", lead);
    return { ok: true, message: "Mensagem recebida! (modo demonstração: configure o Supabase para salvar os leads)" };
  }

  const { error } = await createPublicClient().from("leads").insert(lead);
  if (error) {
    console.error("[submitLead]", error.message);
    return { ok: false, message: "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp." };
  }
  return { ok: true, message: "Recebemos seus dados! Em breve nossa equipe entrará em contato." };
}
