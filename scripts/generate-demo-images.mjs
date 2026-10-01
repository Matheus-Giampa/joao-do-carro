/**
 * Gera as imagens ILUSTRATIVAS dos veículos de demonstração (public/demo/*.svg)
 * e o arquivo supabase/seed.sql a partir de data/demo-vehicles.json.
 *
 * Uso: npm run demo-images
 *
 * As imagens são desenhos vetoriais genéricos (sem marcas reais) apenas para
 * permitir testar o site antes de cadastrar as fotos verdadeiras.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vehicles = JSON.parse(readFileSync(join(root, "data/demo-vehicles.json"), "utf8"));
const outDir = join(root, "public/demo");
mkdirSync(outDir, { recursive: true });

const IMAGES_PER_VEHICLE = 4;

const scenes = [
  ["#0a0a0c", "#2b2c31", "#e1101d"], // showroom escuro
  ["#f1f1f3", "#d6d7db", "#85888f"], // estúdio claro
  ["#141518", "#3a3c42", "#ff5f67"], // grafite com luz vermelha
];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/** Perfil lateral genérico de acordo com a carroceria */
function carShape(type, color) {
  const dark = shade(color, -45);
  const light = shade(color, 35);
  const glass = "#9fb4d1";
  let wheelR = 46;
  let wheels = [235, 565];
  let body = "";
  let cabin = "";
  let extra = "";
  switch (type) {
    case "SUV":
      wheelR = 52;
      body = "M120 365 Q110 300 160 285 L240 270 L640 268 Q690 272 695 310 L698 365 Z";
      cabin = "M220 272 L285 190 Q295 182 310 182 L575 184 Q592 186 600 198 L650 270 Z";
      break;
    case "Picape":
      wheelR = 50;
      wheels = [225, 580];
      body = "M105 365 Q100 305 150 292 L230 280 L700 282 L705 365 Z";
      cabin = "M210 284 L270 200 Q278 192 292 192 L425 192 L440 284 Z";
      extra = `<rect x="450" y="250" width="252" height="36" rx="6" fill="${dark}"/>`;
      break;
    case "Utilitário":
      wheelR = 46;
      wheels = [225, 585];
      body = "M110 368 L112 300 Q115 285 140 282 L700 280 L702 368 Z";
      cabin = "M150 282 L210 175 Q220 165 240 165 L690 165 Q700 166 700 180 L700 282 Z";
      break;
    case "Minivan":
      wheelR = 46;
      body = "M115 365 Q108 305 150 292 L230 282 L670 280 Q695 285 698 320 L700 365 Z";
      cabin = "M200 285 L275 195 Q285 186 300 186 L630 190 Q650 192 660 210 L680 284 Z";
      break;
    case "Hatch":
      wheels = [240, 545];
      body = "M140 365 Q130 305 175 295 L250 285 L630 284 Q660 290 662 325 L664 365 Z";
      cabin = "M235 287 L305 205 Q315 196 330 196 L560 198 Q578 200 590 215 L640 286 Z";
      break;
    case "Conversível":
      wheels = [240, 560];
      body = "M130 365 Q122 310 170 298 L260 290 L640 288 Q675 294 678 330 L680 365 Z";
      cabin = "";
      extra = `<path d="M330 292 L372 236" stroke="${glass}" stroke-width="10" stroke-linecap="round"/>
        <path d="M420 290 Q470 262 540 268 L560 290 Z" fill="${dark}"/>`;
      break;
    default: // Sedan
      body = "M110 365 Q102 308 150 297 L240 288 L660 286 Q700 292 702 330 L704 365 Z";
      cabin = "M240 290 L310 210 Q320 200 338 200 L520 200 Q540 202 552 214 L620 288 Z";
  }
  const windows = cabin
    ? `<path d="${cabin}" fill="${dark}"/><path d="${cabin}" fill="${glass}" opacity=".55" transform="translate(12 10) scale(.97)"/>`
    : "";
  const wheel = (x) => `
    <g transform="translate(${x} 365)">
      <circle r="${wheelR + 6}" fill="#0b0f18"/>
      <circle r="${wheelR}" fill="#1c222e"/>
      <circle r="${wheelR * 0.62}" fill="#a9b3c2"/>
      <circle r="${wheelR * 0.5}" fill="#6b7686"/>
      <circle r="${wheelR * 0.15}" fill="#d6dce5"/>
    </g>`;
  return `
    <ellipse cx="405" cy="420" rx="330" ry="22" fill="#000" opacity=".28"/>
    ${windows}
    ${extra}
    <path d="${body}" fill="${color}"/>
    <path d="${body}" fill="url(#shine)" opacity=".6"/>
    <path d="M150 330 L690 326" stroke="${light}" stroke-width="3" opacity=".7"/>
    <rect x="672" y="300" width="26" height="12" rx="5" fill="#fff6c9"/>
    <rect x="110" y="304" width="20" height="12" rx="5" fill="#e0453a"/>
    ${wheels.map(wheel).join("")}`;
}

function interior(color) {
  return `
    <rect x="0" y="300" width="800" height="240" fill="#151b27"/>
    <path d="M0 300 Q400 210 800 300 L800 360 L0 360 Z" fill="#232b3a"/>
    <rect x="300" y="250" width="200" height="90" rx="10" fill="#0b0f18"/>
    <rect x="312" y="262" width="176" height="66" rx="6" fill="#2b2c31"/>
    <rect x="322" y="272" width="60" height="8" rx="4" fill="#e1101d"/>
    <rect x="322" y="290" width="120" height="6" rx="3" fill="#9aafd0"/>
    <rect x="322" y="304" width="90" height="6" rx="3" fill="#9aafd0"/>
    <g transform="translate(180 360)">
      <circle r="110" fill="none" stroke="#0b0f18" stroke-width="26"/>
      <circle r="34" fill="#0b0f18"/>
      <path d="M-100 10 L-34 4 M100 10 L34 4 M0 34 L0 100" stroke="#0b0f18" stroke-width="22"/>
    </g>
    <path d="M560 500 Q570 380 640 360 L780 360 L800 500 Z" fill="${shade(color, -60)}"/>`;
}

function svg(v, i) {
  const [c1, c2, accent] = scenes[i % scenes.length];
  const isInterior = i === IMAGES_PER_VEHICLE - 1;
  const mirror = i === 1;
  const zoom = i === 2;
  const label = `${v.brand} ${v.model}`;
  const textColor = c1 === "#f1f1f3" ? "#141518" : "#ffffff";
  const content = isInterior
    ? interior(v.color_hex)
    : `<g transform="${mirror ? "translate(800 0) scale(-1 1)" : ""} ${zoom ? "translate(-160 -120) scale(1.4)" : ""}">${carShape(v.body_type, v.color_hex)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -60 800 600" width="1600" height="1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect y="-60" width="800" height="600" fill="url(#bg)"/>
  <circle cx="640" cy="110" r="140" fill="${accent}" opacity=".12"/>
  <rect y="410" width="800" height="130" fill="#000" opacity=".12"/>
  ${content}
  <rect x="532" y="-42" width="250" height="28" rx="14" fill="#000" opacity=".35"/>
  <text x="548" y="-23" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#ffffff">IMAGEM ILUSTRATIVA · DEMO</text>
  <text x="24" y="514" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="${textColor}" opacity=".85">${label}</text>
</svg>`;
}

const esc = (s) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const num = (n) => (n == null ? "null" : String(n));

let sql = `-- =============================================================
-- João do Carro — SEED DE DEMONSTRAÇÃO
-- ATENÇÃO: todos os veículos abaixo são FICTÍCIOS (is_demo = true).
-- Eles existem apenas para testar o site. Para removê-los:
--   delete from public.vehicles where is_demo = true;
-- Arquivo gerado por scripts/generate-demo-images.mjs
-- =============================================================

`;

for (const v of vehicles) {
  for (let i = 0; i < IMAGES_PER_VEHICLE; i++) {
    writeFileSync(join(outDir, `${v.slug}-${i + 1}.svg`), svg(v, i));
  }
  const opts = `array[${v.options.map(esc).join(", ")}]::text[]`;
  sql += `with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values (${esc(v.slug)}, ${esc(v.brand)}, ${esc(v.model)}, ${esc(v.version)}, ${v.year_manufacture}, ${v.year_model}, ${num(v.price)}, ${num(v.previous_price)}, ${v.mileage}, ${esc(v.fuel)}, ${esc(v.transmission)}, ${esc(v.body_type)}, ${esc(v.color)}, ${num(v.doors)}, ${esc(v.plate_end)}, ${esc(v.description)}, ${opts}, '${v.status}', ${v.featured}, ${v.is_offer}, ${v.is_new_arrival}, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ${Array.from({ length: IMAGES_PER_VEHICLE }, (_, i) => `('/demo/${v.slug}-${i + 1}.svg', ${i})`).join(", ")}) as img(url, pos);

`;
}

writeFileSync(join(root, "supabase/seed.sql"), sql);
console.log(`Geradas ${vehicles.length * IMAGES_PER_VEHICLE} imagens em public/demo e supabase/seed.sql`);
