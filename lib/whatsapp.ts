import type { Vehicle } from "@/types";
import { formatPrice, onlyDigits, vehicleFullName } from "./utils";

/** Monta o link wa.me. Sem número configurado, o WhatsApp abre para o usuário escolher o contato. */
export function whatsappLink(number: string | null | undefined, message?: string) {
  let digits = onlyDigits(number);
  if (digits && digits.length <= 11) digits = `55${digits}`; // adiciona DDI do Brasil
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function vehicleInterestMessage(v: Vehicle, companyName: string) {
  if (v.status === "vendido") {
    return `Olá! Vi no site da ${companyName} que o ${vehicleFullName(v)} foi vendido. Vocês têm algum veículo semelhante disponível?`;
  }
  return `Olá! Vi no site da ${companyName} o ${vehicleFullName(v)} por ${formatPrice(v.price)} e gostaria de saber mais informações.`;
}

export function generalMessage(companyName: string) {
  return `Olá! Vim pelo site da ${companyName} e gostaria de mais informações.`;
}
