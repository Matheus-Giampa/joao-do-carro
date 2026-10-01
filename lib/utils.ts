import type { Vehicle } from "@/types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const brlCents = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatPrice(value: number | null | undefined, cents = false) {
  if (value == null || Number.isNaN(value)) return "—";
  return (cents ? brlCents : brl).format(value);
}

export function formatKm(value: number) {
  return `${new Intl.NumberFormat("pt-BR").format(value)} km`;
}

export function formatDate(value: string | Date, withTime = true) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** "Toyota Corolla" */
export function vehicleName(v: Pick<Vehicle, "brand" | "model">) {
  return `${v.brand} ${v.model}`;
}

/** "Toyota Corolla XEi 2.0 Flex Automático 2024" */
export function vehicleFullName(v: Pick<Vehicle, "brand" | "model" | "version" | "year_model">) {
  return [v.brand, v.model, v.version, v.year_model].filter(Boolean).join(" ");
}

/** "2023/2024" */
export function vehicleYears(v: Pick<Vehicle, "year_manufacture" | "year_model">) {
  return `${v.year_manufacture}/${v.year_model}`;
}

export function coverImage(v: Pick<Vehicle, "images">) {
  return v.images[0]?.url ?? "/placeholder-car.svg";
}

export function onlyDigits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function formatPhone(value: string | null | undefined) {
  const d = onlyDigits(value).replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return value ?? "";
}

export function toNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(String(value).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function absoluteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
