/**
 * Versão estática (GitHub Pages): o site fica em /joao-do-carro, então
 * caminhos locais de imagens precisam desse prefixo. Em produção normal fica vazio.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export function asset(src: string) {
  return BASE_PATH && src.startsWith("/") && !src.startsWith(BASE_PATH + "/") ? `${BASE_PATH}${src}` : src;
}
