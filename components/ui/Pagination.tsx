import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      const value = Array.isArray(v) ? v[0] : v;
      if (value && k !== "pagina") sp.set(k, value);
    }
    if (p > 1) sp.set("pagina", String(p));
    return `${basePath}${sp.size ? `?${sp}` : ""}`;
  };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-6" aria-label="Paginação">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn("btn btn-outline btn-sm h-10 w-10 p-0", page === 1 && "pointer-events-none opacity-40")}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-ink-400">…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn("btn btn-sm h-10 min-w-10 px-3", p === page ? "btn-dark" : "btn-outline")}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={href(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn("btn btn-outline btn-sm h-10 w-10 p-0", page === totalPages && "pointer-events-none opacity-40")}
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
