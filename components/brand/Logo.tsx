import { cn } from "@/lib/utils";

/**
 * Logo João do Carro — silhueta do carro (linha branca + teto vermelho)
 * sobre o nome em tipografia chanfrada. Vetorial: nítida em qualquer tela.
 *
 * tone="light" → para fundos escuros (padrão, como a logo original)
 * tone="dark"  → para fundos claros
 *
 * Se uma logo for enviada no painel (Configurações → Logo), ela substitui esta.
 */
export function CarSwoosh({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const line = tone === "light" ? "#ffffff" : "#0a0a0c";
  return (
    <svg viewBox="160 118 1110 170" className={className} aria-hidden="true" focusable="false">
      <path d="M632 214 C 740 140 965 104 1114 180 C 1080 178 1060 172 1040 168 C 940 140 780 156 662 214 Z" fill="#e1101d" />
      <path
        d="M342 272 C 402 236 522 214 650 212 C 822 210 1010 232 1180 200 Q 1236 191 1256 218"
        fill="none"
        stroke={line}
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path d="M704 214 Q 730 193 762 196 Q 770 206 760 213 Z" fill={line} />
      <path d="M926 258 Q 950 244 972 249 Q 968 260 940 261 Z" fill={line} />
    </svg>
  );
}

export function Logo({
  tone = "light",
  name = "João do Carro",
  logoUrl,
  className,
  size = "md",
}: {
  tone?: "light" | "dark";
  name?: string;
  logoUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={name} className={cn("h-11 w-auto object-contain", className)} />;
  }
  const text = {
    sm: "text-[15px]",
    md: "text-[15px] min-[400px]:text-[17px] sm:text-[20px] xl:text-[22px]",
    lg: "text-3xl sm:text-4xl",
  }[size];
  return (
    <span className={cn("inline-flex flex-col items-stretch leading-none", className)} aria-label={name} role="img">
      {/* w-0 + min-w-full: o desenho acompanha a largura do texto sem alargar a logo */}
      <CarSwoosh tone={tone} className="-mb-[2px] h-auto w-0 min-w-full" />
      <span
        className={cn(
          "font-logo font-bold uppercase tracking-[0.09em] whitespace-nowrap",
          tone === "light" ? "text-white" : "text-ink-950",
          text,
        )}
      >
        {name}
      </span>
    </span>
  );
}
