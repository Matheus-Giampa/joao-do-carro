/** Rotas do painel de demonstração, guardadas no "#" da URL (funciona em site estático). */
export type Route = { page: "inicio" | "veiculos" | "novo" | "editar" | "leads" | "equipe" | "config"; id?: string };

const PAGES: Route["page"][] = ["inicio", "veiculos", "novo", "editar", "leads", "equipe", "config"];

export function parseHash(): Route {
  const [page, id] = window.location.hash.replace(/^#\/?/, "").split("/");
  return PAGES.includes(page as Route["page"]) ? { page: page as Route["page"], id } : { page: "inicio" };
}

export function go(route: Route) {
  window.location.hash = `/${route.page}${route.id ? `/${route.id}` : ""}`;
  window.scrollTo({ top: 0 });
}
