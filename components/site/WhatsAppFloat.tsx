"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./icons";
import { cn } from "@/lib/utils";

/** Botão flutuante de WhatsApp presente em todas as páginas públicas. */
export function WhatsAppFloat({ href }: { href: string }) {
  const pathname = usePathname();
  // Na página do veículo existe uma barra fixa inferior no celular: sobe o botão.
  const hasBottomBar = pathname.startsWith("/veiculos/");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className={cn(
        "group fixed right-4 z-30 flex items-center gap-2 rounded-full bg-whatsapp p-3.5 text-white shadow-xl shadow-black/25 transition hover:bg-whatsapp-dark sm:right-6",
        hasBottomBar ? "bottom-24 lg:bottom-6" : "bottom-5 sm:bottom-6",
      )}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-whatsapp/40 [animation-duration:2.5s]" />
      <WhatsAppIcon className="h-7 w-7" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-[160px] group-hover:pr-1 sm:inline">
        Fale conosco
      </span>
    </a>
  );
}
