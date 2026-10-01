"use client";

import { useCallback, useEffect, useState } from "react";
import { DEMO_VEHICLES } from "@/lib/demo-data";
import { asset } from "@/lib/paths";
import type { LeadSource, LeadStatus, StaffRole, Vehicle } from "@/types";

/**
 * Dados do PAINEL DE DEMONSTRAÇÃO (/painel-demo).
 * Tudo fica no localStorage de quem está testando — nada vai para um servidor.
 * Serve para mostrar o painel a um cliente sem precisar de Supabase.
 */

export type DemoLead = {
  id: string;
  name: string;
  whatsapp: string;
  vehicle_label: string;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  created_at: string;
};

export type DemoMember = { id: string; name: string; email: string; role: StaffRole };

export type DemoSettings = { company_name: string; slogan: string; whatsapp: string; finance_monthly_rate: number };

export type DemoData = {
  vehicles: Vehicle[];
  leads: DemoLead[];
  team: DemoMember[];
  settings: DemoSettings;
};

const KEY = "jdc-painel-demo-v1";
const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

/** Membro "logado" em cada cargo (o seletor do topo troca entre eles). */
export const DEMO_LOGIN: Record<StaffRole, DemoMember> = {
  admin: { id: "m-1", name: "João (dono)", email: "joao@joaodocarro.com.br", role: "admin" },
  funcionario: { id: "m-2", name: "Carla Vendas", email: "carla@joaodocarro.com.br", role: "funcionario" },
};

function initialData(): DemoData {
  return {
    // Fotos de demonstração com o caminho do site (no GitHub Pages há o prefixo /joao-do-carro)
    vehicles: DEMO_VEHICLES.map((v) => ({ ...v, images: v.images.map((i) => ({ ...i, url: asset(i.url) })) })),
    leads: [
      { id: "l-1", name: "Marcos Oliveira", whatsapp: "(11) 98877-1234", vehicle_label: "Honda Civic EXL 2.0 CVT 2021", message: "Aceita meu Gol 2015 na troca?", source: "interesse", status: "novo", created_at: ago(2) },
      { id: "l-2", name: "Fernanda Lima", whatsapp: "(11) 97766-4321", vehicle_label: "Jeep Compass Longitude 2023", message: "Quero simular com R$ 40 mil de entrada em 48x.", source: "financiamento", status: "em_atendimento", created_at: ago(20) },
      { id: "l-3", name: "Ricardo Santos", whatsapp: "(11) 96655-0000", vehicle_label: "Toyota Corolla XEi 2024", message: "Ainda está disponível? Posso ver sábado?", source: "proposta", status: "negociacao", created_at: ago(46) },
      { id: "l-4", name: "Juliana Costa", whatsapp: "(11) 95544-8888", vehicle_label: "", message: "Vocês compram carro usado?", source: "contato", status: "venda_realizada", created_at: ago(120) },
    ],
    team: [
      DEMO_LOGIN.admin,
      DEMO_LOGIN.funcionario,
      { id: "m-3", name: "Pedro Pátio", email: "pedro@joaodocarro.com.br", role: "funcionario" },
    ],
    settings: { company_name: "João do Carro", slogan: "Seu próximo carro está aqui.", whatsapp: "(11) 99999-0000", finance_monthly_rate: 1.79 },
  };
}

function read(): DemoData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initialData(), ...JSON.parse(raw) };
  } catch {}
  return initialData();
}

/** Estado do painel + gravação automática no navegador. */
export function useDemoData() {
  const [data, setData] = useState<DemoData | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => setData(read()), []);

  const update = useCallback((fn: (d: DemoData) => DemoData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
        setSaveError(null);
      } catch {
        // Normalmente: muitas fotos e o navegador ficou sem espaço
        setSaveError("O navegador ficou sem espaço para salvar (muitas fotos). Remova algumas fotos ou restaure os dados de exemplo.");
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setData(initialData());
    setSaveError(null);
  }, []);

  return { data, update, reset, saveError };
}

/** Reduz a foto enviada (máx. 1100 px, JPEG) para caber no armazenamento do navegador. */
export async function fileToDataUrl(file: File, max = 1100): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
