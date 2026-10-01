/**
 * Prepara o código para gerar a VERSÃO DE DEMONSTRAÇÃO ESTÁTICA (GitHub Pages).
 *
 * O GitHub Pages só hospeda arquivos estáticos, então esta versão:
 *  - usa os veículos de demonstração (data/demo-vehicles.json);
 *  - remove o painel /admin, o middleware e as ações de servidor;
 *  - faz os formulários levarem o visitante ao WhatsApp.
 *
 * ATENÇÃO: este script ALTERA/APAGA arquivos. Ele roda apenas no GitHub Actions
 * (.github/workflows/pages.yml), numa cópia descartável do repositório.
 * O site completo (com painel e Supabase) deve ser publicado na Vercel.
 */
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

if (!process.env.GITHUB_ACTIONS && !process.argv.includes("--force")) {
  console.error("Este script modifica o projeto e só deve rodar no GitHub Actions. Use --force por sua conta e risco.");
  process.exit(1);
}

const root = process.cwd();
const remove = (p) => existsSync(join(root, p)) && rmSync(join(root, p), { recursive: true, force: true });

// 1. Remove o que depende de servidor
remove("middleware.ts");
remove("app/admin");
remove("components/admin");
remove("services/auth.ts");
remove("app/actions/admin.ts");
remove("app/actions/auth.ts");
remove("app/actions/team.ts");
remove("lib/supabase/admin.ts");

// 2. Formulários: em vez de salvar no banco, orientam o visitante a seguir pelo WhatsApp
writeFileSync(
  join(root, "app/actions/leads.ts"),
  `import type { ActionResult } from "@/types";

export async function submitLead(_prev: ActionResult | null, _fd: FormData): Promise<ActionResult> {
  return { ok: true, message: "Esta é uma versão de demonstração do site. Para falar com a loja, continue pelo WhatsApp." };
}
`,
);

// 3. Remove configurações de revalidação (não se aplicam a sites estáticos)
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name)) {
      const src = readFileSync(p, "utf8");
      const out = src.replace(/^export const revalidate = .*;\r?\n/gm, "").replace(/^export const dynamic = "force-dynamic";\r?\n/gm, "");
      if (out !== src) writeFileSync(p, out);
    }
  }
}
walk(join(root, "app"));

// 4. Rotas de metadados (imagem de compartilhamento, sitemap, robots) geradas no build
for (const f of ["app/opengraph-image.tsx", "app/sitemap.ts", "app/robots.ts"]) {
  const p = join(root, f);
  if (existsSync(p)) writeFileSync(p, `export const dynamic = "force-static";\n${readFileSync(p, "utf8")}`);
}

console.log("Projeto preparado para exportação estática (GitHub Pages).");
