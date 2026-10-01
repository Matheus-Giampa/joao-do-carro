import { CarSwoosh } from "@/components/brand/Logo";

export function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="speed-lines relative overflow-hidden bg-ink-950 pb-20 pt-12 text-white sm:pt-16">
      <div className="pointer-events-none absolute -right-24 -top-4 w-[640px] opacity-15">
        <CarSwoosh />
      </div>
      <div className="container relative">
        {eyebrow && <p className="eyebrow text-brand-400">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-ink-300">{subtitle}</p>}
      </div>
    </section>
  );
}
