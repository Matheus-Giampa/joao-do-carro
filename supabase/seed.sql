-- =============================================================
-- João do Carro — SEED DE DEMONSTRAÇÃO
-- ATENÇÃO: todos os veículos abaixo são FICTÍCIOS (is_demo = true).
-- Eles existem apenas para testar o site. Para removê-los:
--   delete from public.vehicles where is_demo = true;
-- Arquivo gerado por scripts/generate-demo-images.mjs
-- =============================================================

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('toyota-corolla-xei-2024', 'Toyota', 'Corolla', 'XEi 2.0 Flex Automático', 2023, 2024, 129900, null, 32000, 'Flex', 'Automático', 'Sedan', 'Prata', 4, '7', 'VEÍCULO DE DEMONSTRAÇÃO. Sedan médio com câmbio automático CVT, motor 2.0 flex e pacote completo de conforto e segurança. Texto fictício para testes — substitua pelos dados reais no painel administrativo.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Central multimídia', 'Bluetooth', 'Android Auto', 'Apple CarPlay', 'Câmera de ré', 'Sensor de estacionamento', 'Controle de estabilidade', 'Controle de tração', 'Airbags', 'ABS', 'Piloto automático', 'Chave presencial']::text[], 'disponivel', true, false, false, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/toyota-corolla-xei-2024-1.jpg', 0), ('/demo/toyota-corolla-xei-2024-2.jpg', 1)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('honda-civic-exl-2021', 'Honda', 'Civic', 'EXL 2.0 CVT', 2021, 2021, 119900, 124900, 48500, 'Flex', 'Automático', 'Sedan', 'Cinza', 4, '2', 'VEÍCULO DE DEMONSTRAÇÃO. Sedan com acabamento em couro, câmbio CVT e central multimídia com espelhamento. Texto fictício para testes.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Central multimídia', 'Bluetooth', 'Android Auto', 'Apple CarPlay', 'Câmera de ré', 'Bancos de couro', 'Controle de estabilidade', 'Controle de tração', 'Airbags', 'ABS', 'Piloto automático']::text[], 'disponivel', true, true, false, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/honda-civic-exl-2021-1.jpg', 0)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('chevrolet-onix-lt-2023', 'Chevrolet', 'Onix', 'LT 1.0 Turbo', 2022, 2023, 79900, null, 28000, 'Flex', 'Manual', 'Hatch', 'Branco', 4, '5', 'VEÍCULO DE DEMONSTRAÇÃO. Hatch compacto econômico com motor turbo e multimídia. Texto fictício para testes.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Central multimídia', 'Bluetooth', 'Android Auto', 'Apple CarPlay', 'Controle de estabilidade', 'Airbags', 'ABS']::text[], 'disponivel', true, false, true, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/chevrolet-onix-lt-2023-1.jpg', 0)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('volkswagen-t-cross-highline-2022', 'Volkswagen', 'T-Cross', 'Highline 250 TSI', 2022, 2022, 134900, null, 39000, 'Flex', 'Automático', 'SUV', 'Cinza', 4, '9', 'VEÍCULO DE DEMONSTRAÇÃO. SUV compacto com motor turbo, painel digital e assistentes de condução. Texto fictício para testes.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Central multimídia', 'Bluetooth', 'Android Auto', 'Apple CarPlay', 'Câmera de ré', 'Sensor de estacionamento', 'Controle de estabilidade', 'Controle de tração', 'Airbags', 'ABS', 'Piloto automático', 'Chave presencial']::text[], 'disponivel', true, false, false, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/volkswagen-t-cross-highline-2022-1.jpg', 0), ('/demo/volkswagen-t-cross-highline-2022-2.jpg', 1)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('jeep-compass-longitude-2023', 'Jeep', 'Compass', 'Longitude 1.3 T270', 2023, 2023, 159900, 165900, 25000, 'Flex', 'Automático', 'SUV', 'Prata', 4, '1', 'VEÍCULO DE DEMONSTRAÇÃO. SUV médio com motor turbo, bancos em couro e pacote completo de segurança. Texto fictício para testes.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Central multimídia', 'Bluetooth', 'Android Auto', 'Apple CarPlay', 'Câmera de ré', 'Sensor de estacionamento', 'Bancos de couro', 'Controle de estabilidade', 'Controle de tração', 'Airbags', 'ABS', 'Piloto automático', 'Chave presencial']::text[], 'disponivel', true, true, false, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/jeep-compass-longitude-2023-1.jpg', 0), ('/demo/jeep-compass-longitude-2023-2.jpg', 1)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('fiat-toro-volcano-2022', 'Fiat', 'Toro', 'Volcano 2.0 Diesel 4x4', 2021, 2022, 149900, null, 61000, 'Diesel', 'Automático', 'Picape', 'Branco', 4, '4', 'VEÍCULO DE DEMONSTRAÇÃO. Picape média com tração 4x4, motor diesel e câmbio automático. Texto fictício para testes.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Central multimídia', 'Bluetooth', 'Android Auto', 'Apple CarPlay', 'Câmera de ré', 'Bancos de couro', 'Controle de estabilidade', 'Controle de tração', 'Airbags', 'ABS', 'Piloto automático']::text[], 'disponivel', false, false, false, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/fiat-toro-volcano-2022-1.jpg', 0)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('hyundai-hb20-comfort-2020', 'Hyundai', 'HB20', 'Comfort 1.0', 2020, 2020, 62900, null, 54000, 'Flex', 'Manual', 'Hatch', 'Prata', 4, '8', 'VEÍCULO DE DEMONSTRAÇÃO (exemplo de anúncio VENDIDO). Hatch econômico ideal para o dia a dia. Texto fictício para testes.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Bluetooth', 'Airbags', 'ABS']::text[], 'vendido', false, false, false, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/hyundai-hb20-comfort-2020-1.jpg', 0)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('renault-kangoo-express-2020', 'Renault', 'Kangoo', 'Express 1.6', 2019, 2020, 69900, null, 89000, 'Flex', 'Manual', 'Utilitário', 'Branco', 4, '3', 'VEÍCULO DE DEMONSTRAÇÃO (exemplo de anúncio RESERVADO). Utilitário com amplo espaço de carga. Texto fictício para testes.', array['Direção elétrica', 'Travas elétricas', 'Airbags', 'ABS']::text[], 'reservado', false, false, false, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/renault-kangoo-express-2020-1.jpg', 0)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('mini-cooper-s-cabrio-2019', 'Mini', 'Cooper', 'S Cabrio 2.0 Turbo', 2019, 2019, 189900, null, 35000, 'Gasolina', 'Automático', 'Conversível', 'Branco', 2, '6', 'VEÍCULO DE DEMONSTRAÇÃO. Conversível esportivo com capota elétrica e motor turbo. Texto fictício para testes.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Central multimídia', 'Bluetooth', 'Apple CarPlay', 'Sensor de estacionamento', 'Bancos de couro', 'Controle de estabilidade', 'Controle de tração', 'Airbags', 'ABS', 'Piloto automático', 'Chave presencial']::text[], 'disponivel', true, false, true, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/mini-cooper-s-cabrio-2019-1.jpg', 0), ('/demo/mini-cooper-s-cabrio-2019-2.jpg', 1), ('/demo/mini-cooper-s-cabrio-2019-3.jpg', 2)) as img(url, pos);

with v as (
  insert into public.vehicles (slug, brand, model, version, year_manufacture, year_model, price, previous_price, mileage, fuel, transmission, body_type, color, doors, plate_end, description, options, status, featured, is_offer, is_new_arrival, published, is_demo)
  values ('chevrolet-spin-premier-2023', 'Chevrolet', 'Spin', 'Premier 1.8 7 lugares', 2022, 2023, 104900, null, 30000, 'Flex', 'Automático', 'Minivan', 'Preto', 4, '0', 'VEÍCULO DE DEMONSTRAÇÃO. Minivan de 7 lugares, ideal para famílias. Texto fictício para testes.', array['Ar-condicionado', 'Direção elétrica', 'Vidros elétricos', 'Travas elétricas', 'Central multimídia', 'Bluetooth', 'Android Auto', 'Apple CarPlay', 'Câmera de ré', 'Sensor de estacionamento', 'Controle de estabilidade', 'Airbags', 'ABS']::text[], 'disponivel', false, false, true, true, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.vehicle_images (vehicle_id, url, position)
select v.id, img.url, img.pos from v, (values ('/demo/chevrolet-spin-premier-2023-1.jpg', 0)) as img(url, pos);

