# JOÃO DO CARRO 🚗

> **Seu próximo carro está aqui.**

Site profissional + painel administrativo para a loja de veículos **João do Carro**.
O cliente pesquisa o estoque, filtra, vê fotos e detalhes, simula financiamento e chama no WhatsApp.
A loja administra tudo pelo painel `/admin`, **sem precisar mexer em código**.

🔗 **Demonstração online:** https://matheus-giampa.github.io/joao-do-carro/
*(versão estática com veículos fictícios, publicada automaticamente pelo GitHub Pages a cada push — veja `.github/workflows/pages.yml`. O painel `/admin` e o salvamento de leads funcionam apenas na versão completa, publicada na Vercel com Supabase.)*

**Tecnologias:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage, RLS) · Vercel

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Estrutura do projeto](#estrutura-do-projeto)
- [1. Instalar o projeto](#1-instalar-o-projeto)
- [2. Configurar o Supabase](#2-configurar-o-supabase)
- [3. Criar as tabelas](#3-criar-as-tabelas)
- [4. Configurar o Storage](#4-configurar-o-storage)
- [5. Variáveis de ambiente](#5-variáveis-de-ambiente)
- [6. Criar o primeiro administrador](#6-criar-o-primeiro-administrador)
- [7. Executar localmente](#7-executar-localmente)
- [8. Subir para o GitHub](#8-subir-para-o-github)
- [9. Deploy na Vercel](#9-deploy-na-vercel)
- [10. Conectar um domínio próprio](#10-conectar-um-domínio-próprio)
- [Uso do painel](#uso-do-painel)
- [Segurança](#segurança)
- [Personalização](#personalização)

---

## Funcionalidades

### Site público
| Página | O que tem |
|---|---|
| `/` | Banner principal, busca rápida (marca, modelo, ano, preço mín./máx.), atalhos, veículos em destaque, carrocerias, ofertas, banner de financiamento, “Onde estamos” com mapa |
| `/estoque` | Todos os veículos, filtros (marca, modelo, preço, ano, km, combustível, câmbio, carroceria, ofertas), busca por texto (“Corolla”, “Honda Civic”…), 5 ordenações, paginação, gaveta de filtros no celular |
| `/estoque?oferta=1` | Página de ofertas |
| `/veiculos/[slug]` | URL amigável (ex.: `/veiculos/toyota-corolla-xei-2024`), galeria com miniaturas, setas, swipe, tela cheia e **zoom**, ficha técnica, itens e opcionais, descrição, simulador, formulário de proposta, semelhantes, barra fixa “Tenho interesse” no celular |
| `/financiamento` | Simulador (valor, entrada, 12x a 60x) com visualização gráfica e formulário “Solicitar financiamento” |
| `/sobre` | História, missão, valores, experiência, qualidade e atendimento (textos editáveis no painel) |
| `/contato` | WhatsApp, telefone, Instagram, Facebook, e-mail, endereço, horário, formulário e mapa |

- Botão flutuante de WhatsApp em todas as páginas; “Tenho interesse” abre o WhatsApp com mensagem automática:
  *“Olá! Vi no site da João do Carro o Toyota Corolla XEi 2.0 Flex Automático 2024 por R$ 129.900 e gostaria de saber mais informações.”*
- Etiquetas: **OFERTA**, **DESTAQUE**, **RECÉM-CHEGADO**, **RESERVADO**, **VENDIDO**.
- SEO: títulos e descrições dinâmicos, Open Graph (com imagem gerada), `sitemap.xml`, `robots.txt`, Schema.org (`AutoDealer`, `Car`, `BreadcrumbList`).
- Performance: `next/image` (AVIF/WebP, lazy loading), fotos comprimidas no upload, ISR (cache de 60 s + atualização imediata ao salvar no painel), skeleton loading.

### Conta do cliente e favoritos
- **Entrar / Criar conta** (`/entrar`): cadastro com nome, e-mail e senha, confirmação por e-mail e “Esqueci a senha”.
- **Favoritos:** coração nos cards e na página do veículo; lista em **Meus favoritos** (`/favoritos`), disponível em qualquer aparelho.
- Se a pessoa tocar no coração sem estar logada, vai para o login e o carro é salvo assim que ela entra.
- Na versão de demonstração (sem Supabase), os favoritos ficam salvos só no navegador.

### Painel administrativo (`/admin`)
- Login seguro (Supabase Auth) — só quem faz parte da **equipe** (tabela `admins`) entra.
- **Dois cargos:**
  - **Administrador:** tudo — anúncios, leads, configurações da loja e equipe.
  - **Funcionário:** cadastra, edita e exclui anúncios e atende os leads, mas **não** acessa Configurações nem Equipe.
- **Equipe** (`/admin/equipe`, só administrador): adicionar pessoas, trocar o cargo e remover o acesso. Ninguém consegue rebaixar ou remover o próprio acesso (sempre sobra um administrador).
- **Dashboard:** total de veículos, disponíveis, vendidos, em destaque, leads e leads recentes.
- **Veículos:** adicionar, editar, excluir, marcar vendido/reservado, destaque, oferta, ocultar/publicar, alterar preço direto na lista.
- **Fotos:** upload múltiplo (arrastar e soltar), compressão automática para WebP, definir capa, reorganizar (arrastar ou setas), remover.
- **Leads** (`/admin/leads`): nome, telefone, WhatsApp, e-mail, veículo, data, mensagem, origem; status *Novo → Em atendimento → Negociação → Venda realizada / Perdido*; anotações internas; responder no WhatsApp com 1 clique.
- **Configurações:** nome, logo, slogan, telefone, WhatsApp, e-mail, Instagram, Facebook, endereço, horário, textos do banner, taxa de juros da simulação e textos da página Sobre. Tudo atualiza o site automaticamente.

### Modo demonstração
Sem o Supabase configurado, o site funciona com **10 veículos fictícios** (`data/demo-vehicles.json`, com imagens ilustrativas em `public/demo/`). Uma faixa vermelha avisa que é demonstração.

---

## Estrutura do projeto

```
app/
  (site)/                 páginas públicas (home, estoque, veículo, financiamento, sobre, contato)
  admin/login/            tela de login
  admin/(panel)/          painel: dashboard, veiculos, leads, configuracoes
  actions/                server actions (leads, autenticação, administração)
  sitemap.ts robots.ts opengraph-image.tsx icon.svg
components/
  brand/                  logo (vetorial)
  site/                   header, footer, WhatsApp flutuante, busca rápida, localização…
  vehicle/                card, galeria, filtros, etiquetas…
  finance/                simulador de financiamento
  forms/                  formulário de lead
  admin/                  componentes do painel (formulário de veículo, fotos, leads…)
  ui/                     componentes genéricos
lib/                      utilitários, constantes, WhatsApp, cálculo de financiamento, clientes Supabase
services/                 acesso a dados (veículos, configurações, autenticação)
types/                    tipos TypeScript
data/demo-vehicles.json   veículos de demonstração
supabase/migrations/      SQL do banco (tabelas, RLS, storage)
supabase/seed.sql         seed de demonstração
scripts/                  gerador das imagens/seed de demonstração
middleware.ts             proteção das rotas /admin
```

---

## 1. Instalar o projeto

Pré-requisitos: **Node.js 18.18+** (recomendado 20 ou 22) e **Git**.

```bash
git clone https://github.com/SEU-USUARIO/joao-do-carro.git
cd joao-do-carro
npm install
```

> Para só ver o site funcionando (modo demonstração), rode `npm run dev` e abra http://localhost:3000.

## 2. Configurar o Supabase

1. Crie uma conta gratuita em https://supabase.com e clique em **New project**.
2. Dê um nome (ex.: `joao-do-carro`), crie uma senha forte para o banco e escolha a região **South America (São Paulo)**.
3. Aguarde o projeto ficar pronto (1–2 minutos).
4. Em **Authentication → Sign In / Providers → Email**, mantenha o login por e-mail ativo. Recomendado: **desativar “Allow new users to sign up”** (assim ninguém cria conta sozinho; os administradores são criados por você).

## 3. Criar as tabelas

No Supabase, abra **SQL Editor → New query** e execute, **nesta ordem**, o conteúdo de cada arquivo:

1. `supabase/migrations/20260101000001_schema.sql` — tabelas `vehicles`, `vehicle_images`, `leads`, `store_settings`, `admins`
2. `supabase/migrations/20260101000002_security_rls.sql` — políticas de segurança (RLS)
3. `supabase/migrations/20260101000003_storage.sql` — bucket de imagens e suas permissões
4. `supabase/migrations/20260101000004_roles_favorites.sql` — cargos da equipe (admin/funcionário) e favoritos dos clientes
5. *(opcional)* `supabase/seed.sql` — 10 veículos **fictícios** de demonstração (marcados com `is_demo = true`)

Para apagar os veículos de demonstração depois:

```sql
delete from public.vehicles where is_demo = true;
```

> Usa a Supabase CLI? Também funciona: `supabase link --project-ref SEU_REF` e `supabase db push`.

## 4. Configurar o Storage

O arquivo `20260101000003_storage.sql` já cria o bucket **`media`** (público para leitura, até 8 MB por arquivo) e as permissões:
- qualquer visitante pode **ver** as imagens;
- somente administradores podem **enviar, alterar e excluir**.

Confira em **Storage**: deve existir o bucket `media` marcado como *Public*. As fotos dos veículos ficam em `media/vehicles/` e a logo em `media/branding/`.

## 5. Variáveis de ambiente

Copie o modelo:

```bash
cp .env.example .env.local
```

Preencha com os dados de **Project Settings → API** (ou **Connect**) do Supabase:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` localmente; em produção, o domínio do site |
| `NEXT_PUBLIC_SUPABASE_URL` | *Project URL* (ex.: `https://abcd1234.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave *anon / public* |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | `media` |

| `SUPABASE_SERVICE_ROLE_KEY` | *(opcional)* chave *service_role*. Só serve para o administrador **criar contas da equipe direto no painel**. Sem ela, a pessoa cria a conta no site e o administrador libera o acesso pelo e-mail. |

> ⚠️ A chave `service_role` dá acesso total ao banco: **nunca** coloque `NEXT_PUBLIC_` no nome dela e **nunca** envie o `.env.local` para o GitHub (ele já está no `.gitignore`). Ela só é usada no servidor, depois de confirmar que quem pediu é administrador. A chave *anon* é pública por natureza — a segurança é garantida pelas políticas RLS.

### Login de clientes (e-mails de confirmação)
No Supabase, em **Authentication → URL Configuration**:
- **Site URL:** o endereço do site (ex.: `https://www.seudominio.com.br`);
- **Redirect URLs:** adicione `https://www.seudominio.com.br/**` (e `http://localhost:3000/**` para testar localmente).

Sem isso, os links de confirmação de cadastro e de “Esqueci a senha” não voltam para o site.

## 6. Criar o primeiro administrador

1. No Supabase, vá em **Authentication → Users → Add user → Create new user**.
2. Informe o e-mail e uma senha forte e marque **Auto Confirm User**.
3. No **SQL Editor**, execute (troque o e-mail):

```sql
insert into public.admins (user_id, name, email, role)
select id, 'João', email, 'admin' from auth.users where email = 'seu-email@exemplo.com';
```

Pronto: acesse `/admin` e entre com esse e-mail e senha. **Os próximos administradores e funcionários você cadastra pelo próprio painel, em Equipe** — não precisa mais de SQL. Se um dia precisar remover alguém pelo SQL:

```sql
delete from public.admins where user_id = (select id from auth.users where email = 'email@exemplo.com');
```

## 7. Executar localmente

```bash
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

Outros comandos:

```bash
npm run build      # build de produção
npm run start      # roda o build de produção
npm run typecheck  # verificação de tipos
npm run demo-images  # regenera imagens e seed de demonstração a partir de data/demo-vehicles.json
```

## 8. Subir para o GitHub

1. Crie um repositório vazio em https://github.com/new (ex.: `joao-do-carro`, de preferência **Private**).
2. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Site João do Carro"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/joao-do-carro.git
git push -u origin main
```

Confirme que o arquivo `.env.local` **não** aparece no GitHub.

## 9. Deploy na Vercel

1. Acesse https://vercel.com e entre com sua conta do GitHub.
2. **Add New → Project** e importe o repositório `joao-do-carro`. O framework *Next.js* é detectado automaticamente.
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`
   (em `NEXT_PUBLIC_SITE_URL` coloque a URL final, ex.: `https://joao-do-carro.vercel.app` ou seu domínio).
4. Clique em **Deploy**. Em ~1 minuto o site estará no ar.
5. No Supabase, em **Authentication → URL Configuration**, defina **Site URL** com a URL do site.

A cada `git push` na branch `main`, a Vercel publica a nova versão automaticamente.

## 10. Conectar um domínio próprio

1. Registre o domínio (ex.: em https://registro.br para `.com.br`).
2. Na Vercel: **Project → Settings → Domains → Add** e digite `www.seudominio.com.br` (e também `seudominio.com.br`).
3. A Vercel mostrará os registros DNS. No painel do registro do domínio, crie:
   - `A` para `seudominio.com.br` → `76.76.21.21`
   - `CNAME` para `www` → `cname.vercel-dns.com`
   *(use exatamente os valores que a Vercel exibir)*. No Registro.br, ative “Editar zona” para poder criar esses registros.
4. Aguarde a propagação (minutos até algumas horas). O HTTPS é configurado automaticamente.
5. Atualize `NEXT_PUBLIC_SITE_URL` na Vercel para `https://www.seudominio.com.br`, faça **Redeploy**, e atualize o **Site URL** no Supabase.

---

## Uso do painel

- **Adicionar veículo:** Painel → *Adicionar veículo*. Preencha os dados, envie as fotos (a primeira é a capa; clique na ⭐ para definir outra como capa; arraste para reordenar) e salve. A URL é criada automaticamente.
- **Vendido:** na lista, mude o status para *Vendido*. O anúncio continua no site com a marca **VENDIDO** (e o botão vira “Quero um similar”). Para tirar do ar, use *Ocultar anúncio* no menu ⋮.
- **Preço:** clique no preço na lista para editar na hora, ou use *Preço anterior* no formulário para exibir “de / por”.
- **Leads:** chegam dos formulários de interesse/proposta, financiamento e contato. Atualize o status conforme o atendimento avança.
- **Configurações:** o **WhatsApp** cadastrado aqui é o número que recebe todas as mensagens do site.

## Segurança

- Row Level Security ativo em todas as tabelas:
  - visitantes só leem veículos **publicados**, suas fotos e as configurações;
  - visitantes só podem **inserir** leads (sempre com status “novo”), nunca ler;
  - cadastrar/editar/excluir veículos, ver leads e alterar configurações: **somente administradores** (`public.is_admin()`).
- Storage: escrita somente para administradores.
- `/admin` protegido por middleware + verificação no servidor + RLS (três camadas).
- Credenciais apenas em variáveis de ambiente; `.env*` ignorado pelo Git.
- Formulários com validação no servidor, limites de tamanho e campo *honeypot* anti-spam.
- Cabeçalhos de segurança (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

## Personalização

- **Logo:** a logo vetorial padrão fica em `components/brand/Logo.tsx`. Para usar um arquivo, envie em *Painel → Configurações → Logo*.
- **Cores:** `tailwind.config.ts` (`ink` = preto/grafite, `brand` = vermelho).
- **Slogan, textos do banner e da página Sobre:** *Painel → Configurações*.
- **Lista de opcionais, combustíveis, carrocerias:** `lib/constants.ts`.

---

© João do Carro. Imagens de demonstração são ilustrações vetoriais genéricas, sem relação com fabricantes.
