/**
 * Cabeçalho das páginas internas: fundo claro, título grande e sem sobreposição
 * com o conteúdo (o conteúdo começa logo abaixo, sem margem negativa).
 */
export function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="border-b border-ink-200/70 pb-10 pt-12 sm:pb-14 sm:pt-16">
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-950 sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-ink-600">{subtitle}</p>}
      </div>
    </section>
  );
}
