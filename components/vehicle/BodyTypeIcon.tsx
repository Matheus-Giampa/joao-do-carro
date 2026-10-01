const PATHS: Record<string, string> = {
  Hatch: "M4 20 Q4 15 9 14 L18 13 L24 7 L42 7 L50 13 Q58 14 58 20 Z",
  Sedan: "M2 20 Q2 15 8 14 L18 13 L25 7 L40 7 L47 13 L58 14 Q62 15 62 20 Z",
  SUV: "M4 21 Q4 13 10 12 L16 11 L21 4 L48 4 L54 11 Q60 12 60 21 Z",
  Picape: "M2 21 Q2 14 8 13 L15 12 L20 5 L34 5 L36 12 L62 12 L62 21 Z",
  "Utilitário": "M3 21 L3 12 L10 3 L60 3 L61 21 Z",
  "Conversível": "M3 20 Q3 15 9 14 L22 13 L26 9 L28 13 L58 13 Q61 14 61 20 Z",
  Minivan: "M3 21 Q3 13 9 12 L15 4 L52 4 Q58 6 60 13 L61 21 Z",
};

/** Silhueta lateral simplificada por tipo de carroceria. */
export function BodyTypeIcon({ type, className = "h-7 w-16" }: { type: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 28" className={className} aria-hidden="true">
      <path d={PATHS[type] ?? PATHS.Sedan} fill="currentColor" />
      <circle cx="16" cy="21" r="5" fill="currentColor" stroke="white" strokeWidth="2" />
      <circle cx="48" cy="21" r="5" fill="currentColor" stroke="white" strokeWidth="2" />
    </svg>
  );
}
