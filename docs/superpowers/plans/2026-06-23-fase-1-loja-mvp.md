# Fase 1 — Loja RR Boutiques (MVP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar no ar a loja RR Boutiques como vitrine pública (catálogo) + painel interno onde a dona cadastra produtos com fotos/preços/estoque, com botão "Comprar pelo WhatsApp".

**Architecture:** App Next.js (App Router) hospedado na Vercel. Dados, autenticação e fotos no Supabase (Postgres + Auth + Storage). Lógica de negócio (preço final, desconto, slug, mensagem de WhatsApp, estoque) isolada em funções puras em `lib/`, testadas com Vitest (TDD). Páginas e formulários consomem essas funções. Preços guardados em **centavos (inteiro)** para evitar erro de ponto flutuante.

**Tech Stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS, shadcn/ui, Supabase JS, react-hook-form + zod, Vitest.

**Escopo:** Apenas Fase 1 do spec (`docs/superpowers/specs/2026-06-23-rr-boutiques-loja-design.md`). Financeiro completo, cupons e carrinho são Fase 2 (plano próprio). Pagamento online é Fase 3.

**Convenções de teste:** funções puras em `lib/` → TDD com Vitest (teste falhando → implementação → teste passando → commit). Páginas/Server Components e fluxos com Supabase → verificação por execução real (rodar o app e observar), pois testá-los unitariamente exigiria mock pesado de pouco valor.

**Identidade visual:** preto `#0A0A0A`, rosa blush `#E89BB0` (principal), branco `#FFFFFF`, rosa claro `#F3C6D3`. Serifa elegante nos títulos. Logo em `public/logo.png` (a fornecer).

---

## Estrutura de arquivos (decisões de decomposição)

```
rr-boutiques/
├─ app/
│  ├─ (loja)/                      # vitrine pública
│  │  ├─ layout.tsx                # header/footer da loja
│  │  ├─ page.tsx                  # home
│  │  ├─ categoria/[slug]/page.tsx # listagem com filtros
│  │  └─ produto/[slug]/page.tsx   # página do produto
│  ├─ (painel)/painel/             # área interna (protegida)
│  │  ├─ layout.tsx                # menu lateral + guarda de auth
│  │  ├─ page.tsx                  # início do painel
│  │  ├─ produtos/                 # lista + form de produtos
│  │  ├─ categorias/               # CRUD categorias
│  │  └─ config/                   # configurações da loja
│  ├─ login/page.tsx               # login do painel
│  ├─ layout.tsx                   # root layout (fontes, metadata)
│  └─ globals.css                  # Tailwind + tema da marca
├─ lib/
│  ├─ money.ts                     # centavos <-> reais, formatação BRL
│  ├─ pricing.ts                   # preço final com desconto
│  ├─ slug.ts                      # geração de slug
│  ├─ whatsapp.ts                  # monta link/mensagem do WhatsApp
│  ├─ stock.ts                     # disponibilidade/estoque
│  ├─ supabase/client.ts           # client browser
│  ├─ supabase/server.ts           # client server (cookies)
│  └─ types.ts                     # tipos do domínio
├─ components/                     # componentes de UI compartilhados
├─ supabase/migrations/            # SQL de schema
├─ middleware.ts                   # protege /painel
└─ (config: package.json, tailwind, tsconfig, vitest.config.ts, .env.local)
```

---

## Task 0: Scaffold do projeto Next.js

**Files:**
- Create: projeto inteiro via CLI em `C:\Users\fhbom\RR BOUTIQUE`

- [ ] **Step 1: Criar o app Next.js no diretório atual**

Run (na raiz `C:\Users\fhbom\RR BOUTIQUE`, que já contém `docs/`):
```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --yes
```
Expected: cria `app/`, `package.json`, `tailwind`, `tsconfig.json`. Aceita conviver com a pasta `docs/` existente.

- [ ] **Step 2: Instalar dependências do projeto**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr react-hook-form zod @hookform/resolvers
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```
Expected: instala sem erro.

- [ ] **Step 3: Configurar Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
})
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verificar build e teste vazio**

Run:
```bash
npm run build
npm test
```
Expected: build conclui; `vitest` informa "No test files found" (ok nesta etapa).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + Vitest"
```

---

## Task 1: Tipos do domínio

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Definir os tipos centrais**

Create `lib/types.ts`:
```ts
export type DiscountType = 'none' | 'percent' | 'amount'

export interface Variant {
  id: string
  size: string | null
  color: string | null
  stock: number
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  categoryId: string | null
  costCents: number        // preço de custo (privado)
  priceCents: number       // preço de venda
  discountType: DiscountType
  discountValue: number    // % (0-100) quando percent; centavos quando amount
  visible: boolean
  featured: boolean
  hasGrid: boolean         // true = usa variants; false = estoque simples
  stock: number            // usado quando hasGrid = false
  variants: Variant[]
  photos: { url: string; order: number }[]
}

export interface Category {
  id: string
  slug: string
  name: string
  parentId: string | null
}

export interface StoreConfig {
  name: string
  whatsapp: string         // só dígitos, com DDI: ex 5511999999999
  pixKey: string
  instagram: string
  bannerUrl: string
  aboutText: string
  exchangeText: string
}
```

- [ ] **Step 2: Commit** (tipos não têm teste próprio; serão exercidos pelas funções seguintes)

```bash
git add lib/types.ts
git commit -m "feat: tipos do domínio"
```

---

## Task 2: Dinheiro (centavos e formatação BRL)

**Files:**
- Create: `lib/money.ts`
- Test: `lib/money.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

Create `lib/money.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatBRL, reaisToCents, centsToReais } from './money'

describe('money', () => {
  it('formata centavos como BRL', () => {
    expect(formatBRL(8990)).toBe('R$ 89,90')
    expect(formatBRL(0)).toBe('R$ 0,00')
    expect(formatBRL(100000)).toBe('R$ 1.000,00')
  })
  it('converte reais (string) para centavos', () => {
    expect(reaisToCents('89,90')).toBe(8990)
    expect(reaisToCents('1.000,00')).toBe(100000)
    expect(reaisToCents('5')).toBe(500)
  })
  it('converte centavos para reais numérico', () => {
    expect(centsToReais(8990)).toBe(89.9)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run lib/money.test.ts`
Expected: FAIL ("formatBRL is not a function" / módulo não encontrado).

- [ ] **Step 3: Implementar**

Create `lib/money.ts`:
```ts
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function reaisToCents(input: string): number {
  const normalized = input.trim().replace(/\./g, '').replace(',', '.')
  const value = Number(normalized)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}

export function centsToReais(cents: number): number {
  return cents / 100
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run lib/money.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add lib/money.ts lib/money.test.ts
git commit -m "feat: utilitários de dinheiro (centavos/BRL)"
```

---

## Task 3: Preço final com desconto

**Files:**
- Create: `lib/pricing.ts`
- Test: `lib/pricing.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

Create `lib/pricing.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { finalPriceCents, hasDiscount } from './pricing'

const base = { priceCents: 10000, discountType: 'none' as const, discountValue: 0 }

describe('pricing', () => {
  it('sem desconto retorna o preço cheio', () => {
    expect(finalPriceCents(base)).toBe(10000)
    expect(hasDiscount(base)).toBe(false)
  })
  it('desconto percentual', () => {
    const p = { ...base, discountType: 'percent' as const, discountValue: 10 }
    expect(finalPriceCents(p)).toBe(9000)
    expect(hasDiscount(p)).toBe(true)
  })
  it('desconto em valor (centavos)', () => {
    const p = { ...base, discountType: 'amount' as const, discountValue: 1500 }
    expect(finalPriceCents(p)).toBe(8500)
  })
  it('nunca fica negativo', () => {
    const p = { ...base, discountType: 'amount' as const, discountValue: 999999 }
    expect(finalPriceCents(p)).toBe(0)
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run lib/pricing.test.ts`
Expected: FAIL (módulo não encontrado).

- [ ] **Step 3: Implementar**

Create `lib/pricing.ts`:
```ts
import type { DiscountType } from './types'

interface Priceable {
  priceCents: number
  discountType: DiscountType
  discountValue: number
}

export function hasDiscount(p: Priceable): boolean {
  return p.discountType !== 'none' && p.discountValue > 0
}

export function finalPriceCents(p: Priceable): number {
  if (!hasDiscount(p)) return p.priceCents
  let result = p.priceCents
  if (p.discountType === 'percent') {
    result = Math.round(p.priceCents * (1 - p.discountValue / 100))
  } else if (p.discountType === 'amount') {
    result = p.priceCents - p.discountValue
  }
  return Math.max(0, result)
}
```

- [ ] **Step 4: Rodar e confirmar passa**

Run: `npx vitest run lib/pricing.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add lib/pricing.ts lib/pricing.test.ts
git commit -m "feat: cálculo de preço final com desconto"
```

---

## Task 4: Slug

**Files:**
- Create: `lib/slug.ts`
- Test: `lib/slug.test.ts`

- [ ] **Step 1: Teste que falha**

Create `lib/slug.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { toSlug } from './slug'

describe('toSlug', () => {
  it('normaliza acentos e espaços', () => {
    expect(toSlug('Vestido Floral')).toBe('vestido-floral')
    expect(toSlug('Camisa Coração ')).toBe('camisa-coracao')
    expect(toSlug('Calça   Jeans!!')).toBe('calca-jeans')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run lib/slug.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `lib/slug.ts`:
```ts
export function toSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 4: Rodar e confirmar passa**

Run: `npx vitest run lib/slug.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/slug.ts lib/slug.test.ts
git commit -m "feat: geração de slug"
```

---

## Task 5: Mensagem do WhatsApp

**Files:**
- Create: `lib/whatsapp.ts`
- Test: `lib/whatsapp.test.ts`

- [ ] **Step 1: Teste que falha**

Create `lib/whatsapp.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { whatsappLink } from './whatsapp'

describe('whatsappLink', () => {
  it('monta link com mensagem da peça', () => {
    const url = whatsappLink('5511999999999', {
      name: 'Vestido Floral', size: 'M', color: 'Preto', priceCents: 8990,
    })
    expect(url).toContain('https://wa.me/5511999999999?text=')
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Vestido Floral')
    expect(text).toContain('M')
    expect(text).toContain('Preto')
    expect(text).toContain('89,90')
  })
  it('omite tamanho/cor quando ausentes', () => {
    const url = whatsappLink('5511999999999', { name: 'Bolsa', priceCents: 5000 })
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Bolsa')
    expect(text).not.toContain('Tamanho')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run lib/whatsapp.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `lib/whatsapp.ts`:
```ts
import { formatBRL } from './money'

interface WaItem {
  name: string
  size?: string | null
  color?: string | null
  priceCents: number
}

export function whatsappLink(phone: string, item: WaItem): string {
  const parts = [`Olá! Tenho interesse na peça: ${item.name}`]
  if (item.size) parts.push(`Tamanho: ${item.size}`)
  if (item.color) parts.push(`Cor: ${item.color}`)
  parts.push(`Valor: ${formatBRL(item.priceCents)}`)
  const text = encodeURIComponent(parts.join('\n'))
  return `https://wa.me/${phone}?text=${text}`
}
```

- [ ] **Step 4: Rodar e confirmar passa**

Run: `npx vitest run lib/whatsapp.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add lib/whatsapp.ts lib/whatsapp.test.ts
git commit -m "feat: link de compra via WhatsApp"
```

---

## Task 6: Estoque / disponibilidade

**Files:**
- Create: `lib/stock.ts`
- Test: `lib/stock.test.ts`

- [ ] **Step 1: Teste que falha**

Create `lib/stock.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { totalStock, isSoldOut, isLowStock } from './stock'
import type { Product } from './types'

function make(p: Partial<Product>): Product {
  return {
    id: '1', slug: 's', name: 'n', description: '', categoryId: null,
    costCents: 0, priceCents: 1000, discountType: 'none', discountValue: 0,
    visible: true, featured: false, hasGrid: false, stock: 0, variants: [], photos: [],
    ...p,
  }
}

describe('stock', () => {
  it('produto simples usa o campo stock', () => {
    expect(totalStock(make({ hasGrid: false, stock: 4 }))).toBe(4)
  })
  it('produto com grade soma as variações', () => {
    const p = make({ hasGrid: true, variants: [
      { id: 'a', size: 'P', color: null, stock: 2 },
      { id: 'b', size: 'M', color: null, stock: 3 },
    ]})
    expect(totalStock(p)).toBe(5)
  })
  it('esgotado quando total = 0', () => {
    expect(isSoldOut(make({ stock: 0 }))).toBe(true)
    expect(isSoldOut(make({ stock: 1 }))).toBe(false)
  })
  it('estoque baixo quando 1..3', () => {
    expect(isLowStock(make({ stock: 2 }))).toBe(true)
    expect(isLowStock(make({ stock: 0 }))).toBe(false)
    expect(isLowStock(make({ stock: 10 }))).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run lib/stock.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `lib/stock.ts`:
```ts
import type { Product } from './types'

const LOW_STOCK_THRESHOLD = 3

export function totalStock(p: Product): number {
  if (p.hasGrid) return p.variants.reduce((sum, v) => sum + v.stock, 0)
  return p.stock
}

export function isSoldOut(p: Product): boolean {
  return totalStock(p) <= 0
}

export function isLowStock(p: Product): boolean {
  const total = totalStock(p)
  return total > 0 && total <= LOW_STOCK_THRESHOLD
}
```

- [ ] **Step 4: Rodar e confirmar passa**

Run: `npx vitest run lib/stock.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add lib/stock.ts lib/stock.test.ts
git commit -m "feat: helpers de estoque/disponibilidade"
```

---

## Task 7: Projeto Supabase + variáveis de ambiente

**Files:**
- Create: `.env.local`, `.env.example`

- [ ] **Step 1: Criar projeto Supabase**

Criar projeto gratuito em supabase.com (região South America / São Paulo). Anotar: Project URL, anon/publishable key, service role key. (No fluxo agentic, pode-se usar a MCP do Supabase para `create_project` + `get_project_url` + `get_publishable_keys`.)

- [ ] **Step 2: Gravar variáveis**

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

Create `.env.example` (mesmas chaves, valores vazios). Confirmar que `.env.local` está no `.gitignore` (o create-next-app já inclui).

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: variáveis de ambiente Supabase (exemplo)"
```

---

## Task 8: Schema do banco (migração SQL)

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Escrever a migração**

Create `supabase/migrations/0001_init.sql`:
```sql
-- Categorias
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  parent_id uuid references categories(id) on delete set null,
  created_at timestamptz default now()
);

-- Produtos (preços em centavos)
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text default '',
  category_id uuid references categories(id) on delete set null,
  cost_cents integer not null default 0,
  price_cents integer not null default 0,
  discount_type text not null default 'none' check (discount_type in ('none','percent','amount')),
  discount_value integer not null default 0,
  visible boolean not null default false,
  featured boolean not null default false,
  has_grid boolean not null default false,
  stock integer not null default 0,
  created_at timestamptz default now()
);

-- Variações (grade tamanho/cor)
create table variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text,
  color text,
  stock integer not null default 0
);

-- Fotos
create table photos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  "order" integer not null default 0
);

-- Configuração da loja (linha única)
create table store_config (
  id integer primary key default 1 check (id = 1),
  name text default 'RR Boutiques',
  whatsapp text default '',
  pix_key text default '',
  instagram text default '',
  banner_url text default '',
  about_text text default '',
  exchange_text text default ''
);
insert into store_config (id) values (1) on conflict do nothing;
```

- [ ] **Step 2: Aplicar a migração**

Aplicar no projeto Supabase (via SQL Editor do dashboard ou MCP `apply_migration`). Verificar com `list_tables` que as 5 tabelas existem.
Expected: tabelas `categories`, `products`, `variants`, `photos`, `store_config` criadas.

- [ ] **Step 3: Configurar RLS (segurança)**

Create `supabase/migrations/0002_rls.sql`:
```sql
alter table categories enable row level security;
alter table products enable row level security;
alter table variants enable row level security;
alter table photos enable row level security;
alter table store_config enable row level security;

-- Leitura pública apenas do que é visível na loja
create policy "público lê categorias" on categories for select using (true);
create policy "público lê produtos visíveis" on products for select using (visible = true);
create policy "público lê variações" on variants for select using (true);
create policy "público lê fotos" on photos for select using (true);
create policy "público lê config" on store_config for select using (true);

-- Usuários autenticados (a dona) têm acesso total
create policy "admin tudo categorias" on categories for all to authenticated using (true) with check (true);
create policy "admin tudo produtos" on products for all to authenticated using (true) with check (true);
create policy "admin tudo variações" on variants for all to authenticated using (true) with check (true);
create policy "admin tudo fotos" on photos for all to authenticated using (true) with check (true);
create policy "admin tudo config" on store_config for all to authenticated using (true) with check (true);
```
Aplicar a migração.
> Nota de segurança: `cost_cents` fica na tabela `products`, legível publicamente pela policy de produtos visíveis. Para nunca expor o custo na vitrine, as **consultas públicas selecionam colunas explícitas** (sem `cost_cents`) — ver Task 11. (Endurecimento opcional na Fase 2: mover custo para tabela separada só-admin.)

- [ ] **Step 4: Criar bucket de fotos**

No Storage do Supabase, criar bucket público `produtos`. Policy: leitura pública; escrita apenas `authenticated`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations
git commit -m "feat: schema inicial do banco + RLS"
```

---

## Task 9: Clients do Supabase

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: Client de browser**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 2: Client de server**

Create `lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(toSet) {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
          catch { /* chamado de Server Component sem resposta — ignorável */ }
        },
      },
    },
  )
}
```

- [ ] **Step 3: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros de tipo.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase
git commit -m "feat: clients Supabase (browser e server)"
```

---

## Task 10: Autenticação do painel

**Files:**
- Create: `app/login/page.tsx`, `middleware.ts`, `app/(painel)/painel/layout.tsx`

- [ ] **Step 1: Criar a usuária no Supabase**

No painel Supabase → Authentication → Users → criar a usuária (e-mail + senha da dona). (Desligar "Enable signups" para que ninguém mais se cadastre.)

- [ ] **Step 2: Página de login**

Create `app/login/page.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('E-mail ou senha incorretos.'); return }
    router.push('/painel')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-serif text-[#E89BB0] text-center">RR Boutiques</h1>
        <input className="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
          type="email" placeholder="E-mail" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full p-3 rounded bg-neutral-900 border border-neutral-700"
          type="password" placeholder="Senha" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full p-3 rounded bg-[#E89BB0] text-black font-medium" type="submit">
          Entrar
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: Middleware que protege /painel**

Create `middleware.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && request.nextUrl.pathname.startsWith('/painel')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return response
}

export const config = { matcher: ['/painel/:path*'] }
```

- [ ] **Step 4: Layout do painel com botão sair**

Create `app/(painel)/painel/layout.tsx`:
```tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="w-56 bg-[#0A0A0A] text-white p-4 space-y-2">
        <p className="font-serif text-[#E89BB0] text-lg mb-4">RR Boutiques</p>
        <Link className="block py-2" href="/painel">Início</Link>
        <Link className="block py-2" href="/painel/produtos">Produtos</Link>
        <Link className="block py-2" href="/painel/categorias">Categorias</Link>
        <Link className="block py-2" href="/painel/config">Configurações</Link>
        <form action="/auth/sign-out" method="post" className="pt-6">
          <button className="text-sm text-neutral-400">Sair</button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 5: Rota de sign-out**

Create `app/auth/sign-out/route.ts`:
```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', request.url), { status: 302 })
}
```

- [ ] **Step 6: Verificar (execução real)**

Run: `npm run dev`. Acessar `/painel` sem login → redireciona para `/login`. Logar com a usuária criada → entra no painel. Clicar "Sair" → volta para `/login`.
Expected: proteção funcionando.

- [ ] **Step 7: Commit**

```bash
git add app/login app/auth middleware.ts "app/(painel)"
git commit -m "feat: autenticação e proteção do painel"
```

---

## Task 11: Camada de dados (queries)

**Files:**
- Create: `lib/data.ts`

- [ ] **Step 1: Funções de leitura/escrita**

Create `lib/data.ts` (consultas públicas selecionam colunas explícitas, **sem `cost_cents`**):
```ts
import { createClient } from '@/lib/supabase/server'
import type { Product, Category, StoreConfig } from '@/lib/types'

const PUBLIC_PRODUCT_COLS =
  'id, slug, name, description, category_id, price_cents, discount_type, discount_value, ' +
  'visible, featured, has_grid, stock, variants(id,size,color,stock), photos(url,order)'

function mapProduct(row: any): Product {
  return {
    id: row.id, slug: row.slug, name: row.name, description: row.description ?? '',
    categoryId: row.category_id, costCents: row.cost_cents ?? 0, priceCents: row.price_cents,
    discountType: row.discount_type, discountValue: row.discount_value,
    visible: row.visible, featured: row.featured, hasGrid: row.has_grid, stock: row.stock,
    variants: (row.variants ?? []).map((v: any) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock })),
    photos: (row.photos ?? []).map((p: any) => ({ url: p.url, order: p.order })).sort((a: any, b: any) => a.order - b.order),
  }
}

export async function getVisibleProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select(PUBLIC_PRODUCT_COLS)
    .eq('visible', true).order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select(PUBLIC_PRODUCT_COLS)
    .eq('visible', true).eq('featured', true).order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select(PUBLIC_PRODUCT_COLS)
    .eq('slug', slug).eq('visible', true).maybeSingle()
  return data ? mapProduct(data) : null
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
  if (!cat) return []
  const { data } = await supabase.from('products').select(PUBLIC_PRODUCT_COLS)
    .eq('visible', true).eq('category_id', cat.id).order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('id,slug,name,parent_id').order('name')
  return (data ?? []).map((c: any) => ({ id: c.id, slug: c.slug, name: c.name, parentId: c.parent_id }))
}

export async function getStoreConfig(): Promise<StoreConfig> {
  const supabase = await createClient()
  const { data } = await supabase.from('store_config').select('*').eq('id', 1).single()
  return {
    name: data?.name ?? 'RR Boutiques', whatsapp: data?.whatsapp ?? '', pixKey: data?.pix_key ?? '',
    instagram: data?.instagram ?? '', bannerUrl: data?.banner_url ?? '',
    aboutText: data?.about_text ?? '', exchangeText: data?.exchange_text ?? '',
  }
}
```

- [ ] **Step 2: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add lib/data.ts
git commit -m "feat: camada de dados (queries públicas sem custo)"
```

---

## Task 12: Tema da marca (Tailwind + fontes)

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Tokens de cor da marca**

Add ao topo de `app/globals.css` (após o import do Tailwind):
```css
:root {
  --brand-black: #0A0A0A;
  --brand-rose: #E89BB0;
  --brand-rose-light: #F3C6D3;
  --brand-white: #FFFFFF;
}
```

- [ ] **Step 2: Fontes (serifa elegante + sans)**

Replace `app/layout.tsx` por:
```tsx
import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'RR Boutiques — Moda Feminina',
  description: 'Estilo, elegância e confiança. Moda feminina RR Boutiques.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verificar (execução real)**

Run: `npm run dev` e abrir a home. Expected: sem erro de fonte; página carrega.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: tema da marca (cores e fontes)"
```

---

## Task 13: Configurações da loja (painel)

**Files:**
- Create: `app/(painel)/painel/config/page.tsx`, `app/(painel)/painel/config/actions.ts`

- [ ] **Step 1: Server Action para salvar config**

Create `app/(painel)/painel/config/actions.ts`:
```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveConfig(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('store_config').update({
    name: String(formData.get('name') ?? ''),
    whatsapp: String(formData.get('whatsapp') ?? '').replace(/\D/g, ''),
    pix_key: String(formData.get('pixKey') ?? ''),
    instagram: String(formData.get('instagram') ?? ''),
    about_text: String(formData.get('aboutText') ?? ''),
    exchange_text: String(formData.get('exchangeText') ?? ''),
  }).eq('id', 1)
  revalidatePath('/painel/config')
  revalidatePath('/', 'layout')
}
```

- [ ] **Step 2: Página de config**

Create `app/(painel)/painel/config/page.tsx`:
```tsx
import { getStoreConfig } from '@/lib/data'
import { saveConfig } from './actions'

export default async function ConfigPage() {
  const c = await getStoreConfig()
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-serif mb-4">Configurações da loja</h1>
      <form action={saveConfig} className="space-y-4">
        <Field name="name" label="Nome da loja" defaultValue={c.name} />
        <Field name="whatsapp" label="WhatsApp (com DDD, ex 11999998888)" defaultValue={c.whatsapp} />
        <Field name="pixKey" label="Chave Pix" defaultValue={c.pixKey} />
        <Field name="instagram" label="Instagram (@)" defaultValue={c.instagram} />
        <Area name="aboutText" label="Sobre a loja" defaultValue={c.aboutText} />
        <Area name="exchangeText" label="Política de troca" defaultValue={c.exchangeText} />
        <button className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">Salvar</button>
      </form>
    </div>
  )
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <input name={name} defaultValue={defaultValue}
        className="mt-1 w-full p-2 border rounded" />
    </label>
  )
}
function Area({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={3}
        className="mt-1 w-full p-2 border rounded" />
    </label>
  )
}
```

> Nota: o WhatsApp é salvo só com dígitos. Adicionar DDI 55 na hora de montar o link (Task 18) caso a dona digite só com DDD.

- [ ] **Step 3: Verificar (execução real)**

Logar no painel → `/painel/config` → preencher WhatsApp e Pix → Salvar → recarregar e confirmar que persistiu.
Expected: dados salvos.

- [ ] **Step 4: Commit**

```bash
git add "app/(painel)/painel/config"
git commit -m "feat: configurações da loja no painel"
```

---

## Task 14: CRUD de categorias (painel)

**Files:**
- Create: `app/(painel)/painel/categorias/page.tsx`, `app/(painel)/painel/categorias/actions.ts`

- [ ] **Step 1: Server Actions**

Create `app/(painel)/painel/categorias/actions.ts`:
```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { toSlug } from '@/lib/slug'

export async function createCategory(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return
  const supabase = await createClient()
  await supabase.from('categories').insert({ name, slug: toSlug(name) })
  revalidatePath('/painel/categorias')
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = await createClient()
  await supabase.from('categories').delete().eq('id', id)
  revalidatePath('/painel/categorias')
}
```

- [ ] **Step 2: Página**

Create `app/(painel)/painel/categorias/page.tsx`:
```tsx
import { getCategories } from '@/lib/data'
import { createCategory, deleteCategory } from './actions'

export default async function CategoriasPage() {
  const cats = await getCategories()
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-serif mb-4">Categorias</h1>
      <form action={createCategory} className="flex gap-2 mb-6">
        <input name="name" placeholder="Nova categoria (ex: Vestidos)"
          className="flex-1 p-2 border rounded" required />
        <button className="px-4 rounded bg-[#E89BB0] text-black font-medium">Adicionar</button>
      </form>
      <ul className="divide-y">
        {cats.map((c) => (
          <li key={c.id} className="flex justify-between items-center py-2">
            <span>{c.name}</span>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button className="text-sm text-red-600">Excluir</button>
            </form>
          </li>
        ))}
        {cats.length === 0 && <li className="py-2 text-neutral-500">Nenhuma categoria ainda.</li>}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3: Verificar (execução real)**

No painel, criar "Vestidos" e "Blusas", excluir uma. Expected: lista atualiza.

- [ ] **Step 4: Commit**

```bash
git add "app/(painel)/painel/categorias"
git commit -m "feat: CRUD de categorias"
```

---

## Task 15: Lista de produtos + alternar visibilidade (painel)

**Files:**
- Create: `app/(painel)/painel/produtos/page.tsx`, `app/(painel)/painel/produtos/actions.ts`

- [ ] **Step 1: Actions de listagem (toggle visível + excluir)**

Create `app/(painel)/painel/produtos/actions.ts`:
```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleVisible(formData: FormData) {
  const id = String(formData.get('id'))
  const next = String(formData.get('next')) === 'true'
  const supabase = await createClient()
  await supabase.from('products').update({ visible: next }).eq('id', id)
  revalidatePath('/painel/produtos')
  revalidatePath('/', 'layout')
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get('id'))
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/painel/produtos')
  revalidatePath('/', 'layout')
}
```

- [ ] **Step 2: Função admin para listar todos os produtos**

Add ao `lib/data.ts`:
```ts
export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('products')
    .select('id, slug, name, description, category_id, cost_cents, price_cents, discount_type, discount_value, visible, featured, has_grid, stock, variants(id,size,color,stock), photos(url,order)')
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapProduct)
}
```

- [ ] **Step 3: Página de listagem**

Create `app/(painel)/painel/produtos/page.tsx`:
```tsx
import Link from 'next/link'
import { getAllProductsAdmin } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { totalStock } from '@/lib/stock'
import { toggleVisible, deleteProduct } from './actions'

export default async function ProdutosPage() {
  const products = await getAllProductsAdmin()
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-serif">Produtos</h1>
        <Link href="/painel/produtos/novo" className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">
          + Cadastrar peça
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-neutral-500 border-b">
          <th className="py-2">Peça</th><th>Preço</th><th>Estoque</th><th>Na loja?</th><th></th>
        </tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">
                <Link href={`/painel/produtos/${p.id}`} className="hover:underline">{p.name}</Link>
              </td>
              <td>{formatBRL(p.priceCents)}</td>
              <td>{totalStock(p)}</td>
              <td>
                <form action={toggleVisible}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="next" value={(!p.visible).toString()} />
                  <button className={p.visible ? 'text-green-600' : 'text-neutral-400'}>
                    {p.visible ? 'Visível' : 'Oculto'}
                  </button>
                </form>
              </td>
              <td>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-red-600 text-xs">Excluir</button>
                </form>
              </td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={5} className="py-4 text-neutral-500">Nenhuma peça cadastrada.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros (form de produto vem na Task 16; o link "Cadastrar" levará a 404 até lá — ok).

- [ ] **Step 5: Commit**

```bash
git add "app/(painel)/painel/produtos" lib/data.ts
git commit -m "feat: lista de produtos no painel (visível/excluir)"
```

---

## Task 16: Cadastro/edição de produto + upload de fotos + variações (painel)

**Files:**
- Create: `app/(painel)/painel/produtos/novo/page.tsx`, `app/(painel)/painel/produtos/[id]/page.tsx`, `app/(painel)/painel/produtos/product-form.tsx`, `app/(painel)/painel/produtos/save.ts`

- [ ] **Step 1: Server Action de salvar produto (cria e edita)**

Create `app/(painel)/painel/produtos/save.ts`:
```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { toSlug } from '@/lib/slug'
import { reaisToCents } from '@/lib/money'

export async function saveProduct(formData: FormData) {
  const supabase = await createClient()
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const hasGrid = String(formData.get('hasGrid')) === 'on'

  const fields = {
    name,
    slug: toSlug(name) + '-' + Math.random().toString(36).slice(2, 6),
    description: String(formData.get('description') ?? ''),
    category_id: String(formData.get('categoryId') || '') || null,
    cost_cents: reaisToCents(String(formData.get('cost') ?? '0')),
    price_cents: reaisToCents(String(formData.get('price') ?? '0')),
    discount_type: String(formData.get('discountType') ?? 'none'),
    discount_value: Number(formData.get('discountValue') ?? 0),
    visible: String(formData.get('visible')) === 'on',
    featured: String(formData.get('featured')) === 'on',
    has_grid: hasGrid,
    stock: hasGrid ? 0 : Number(formData.get('stock') ?? 0),
  }

  let productId = id
  if (id) {
    await supabase.from('products').update(fields).eq('id', id)
  } else {
    const { data } = await supabase.from('products').insert(fields).select('id').single()
    productId = data!.id
  }

  // Fotos: URLs já enviadas ao Storage (campo escondido photoUrls, separadas por vírgula)
  const photoUrls = String(formData.get('photoUrls') ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (photoUrls.length) {
    await supabase.from('photos').delete().eq('product_id', productId)
    await supabase.from('photos').insert(photoUrls.map((url, i) => ({ product_id: productId, url, order: i })))
  }

  // Variações: campos variantSize[], variantColor[], variantStock[]
  if (hasGrid) {
    const sizes = formData.getAll('variantSize').map(String)
    const colors = formData.getAll('variantColor').map(String)
    const stocks = formData.getAll('variantStock').map((v) => Number(v))
    await supabase.from('variants').delete().eq('product_id', productId)
    const rows = sizes.map((size, i) => ({
      product_id: productId, size: size || null, color: colors[i] || null, stock: stocks[i] || 0,
    })).filter(r => r.size || r.color)
    if (rows.length) await supabase.from('variants').insert(rows)
  }

  revalidatePath('/painel/produtos')
  revalidatePath('/', 'layout')
  redirect('/painel/produtos')
}
```

- [ ] **Step 2: Componente de formulário (client, com upload e variações)**

Create `app/(painel)/painel/produtos/product-form.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Product } from '@/lib/types'
import { saveProduct } from './save'

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const [hasGrid, setHasGrid] = useState(product?.hasGrid ?? false)
  const [photoUrls, setPhotoUrls] = useState<string[]>(product?.photos.map(p => p.url) ?? [])
  const [variants, setVariants] = useState(product?.variants ?? [])
  const [uploading, setUploading] = useState(false)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error } = await supabase.storage.from('produtos').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('produtos').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setPhotoUrls((prev) => [...prev, ...urls])
    setUploading(false)
  }

  return (
    <form action={saveProduct} className="max-w-2xl space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="photoUrls" value={photoUrls.join(',')} />

      <Field name="name" label="Nome da peça" defaultValue={product?.name} required />
      <label className="block">
        <span className="text-sm text-neutral-600">Descrição</span>
        <textarea name="description" defaultValue={product?.description} rows={3}
          className="mt-1 w-full p-2 border rounded" />
      </label>

      <label className="block">
        <span className="text-sm text-neutral-600">Categoria</span>
        <select name="categoryId" defaultValue={product?.categoryId ?? ''} className="mt-1 w-full p-2 border rounded">
          <option value="">— sem categoria —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Field name="cost" label="Preço de custo (privado) ex 45,00"
          defaultValue={product ? (product.costCents / 100).toString() : ''} />
        <Field name="price" label="Preço de venda ex 89,90"
          defaultValue={product ? (product.priceCents / 100).toString() : ''} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-600">Tipo de desconto</span>
          <select name="discountType" defaultValue={product?.discountType ?? 'none'} className="mt-1 w-full p-2 border rounded">
            <option value="none">Sem desconto</option>
            <option value="percent">Porcentagem (%)</option>
            <option value="amount">Valor (R$)</option>
          </select>
        </label>
        <Field name="discountValue" label="Valor do desconto (% ou centavos)"
          defaultValue={product?.discountValue?.toString() ?? '0'} />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="hasGrid" checked={hasGrid} onChange={(e) => setHasGrid(e.target.checked)} />
        <span>Esta peça tem grade (tamanho/cor)</span>
      </label>

      {!hasGrid && (
        <Field name="stock" label="Estoque (unidades)" defaultValue={product?.stock?.toString() ?? '0'} />
      )}

      {hasGrid && (
        <div className="border rounded p-3 space-y-2">
          <p className="text-sm font-medium">Grade</p>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input name="variantSize" defaultValue={v.size ?? ''} placeholder="Tamanho (P/M/G)" className="p-2 border rounded" />
              <input name="variantColor" defaultValue={v.color ?? ''} placeholder="Cor" className="p-2 border rounded" />
              <input name="variantStock" type="number" defaultValue={v.stock} placeholder="Qtd" className="p-2 border rounded" />
            </div>
          ))}
          <button type="button" onClick={() => setVariants([...variants, { id: '', size: '', color: '', stock: 0 }])}
            className="text-sm text-[#E89BB0]">+ Adicionar variação</button>
        </div>
      )}

      <div>
        <span className="text-sm text-neutral-600 block mb-1">Fotos</span>
        <input type="file" accept="image/*" multiple onChange={onUpload} />
        {uploading && <p className="text-sm text-neutral-500">Enviando…</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {photoUrls.map((u, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="w-20 h-20 object-cover rounded" />
              <button type="button" onClick={() => setPhotoUrls(photoUrls.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="visible" defaultChecked={product?.visible} /> Visível na loja
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Destaque na home
        </label>
      </div>

      <button className="px-6 py-2 rounded bg-[#E89BB0] text-black font-medium">Salvar peça</button>
    </form>
  )
}

function Field({ name, label, defaultValue, required }: { name: string; label: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <input name={name} defaultValue={defaultValue} required={required} className="mt-1 w-full p-2 border rounded" />
    </label>
  )
}
```

- [ ] **Step 3: Página "novo"**

Create `app/(painel)/painel/produtos/novo/page.tsx`:
```tsx
import { getCategories } from '@/lib/data'
import { ProductForm } from '../product-form'

export default async function NovoProduto() {
  const categories = await getCategories()
  return (
    <div>
      <h1 className="text-2xl font-serif mb-4">Cadastrar peça</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
```

- [ ] **Step 4: Página de edição**

Create `app/(painel)/painel/produtos/[id]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { getCategories, getAllProductsAdmin } from '@/lib/data'
import { ProductForm } from '../product-form'

export default async function EditarProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [categories, products] = await Promise.all([getCategories(), getAllProductsAdmin()])
  const product = products.find((p) => p.id === id)
  if (!product) notFound()
  return (
    <div>
      <h1 className="text-2xl font-serif mb-4">Editar peça</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
```

- [ ] **Step 5: Verificar (execução real)**

No painel: cadastrar uma peça simples (com foto, custo, venda, estoque, visível) e uma com grade (P/M/G). Conferir que aparece na lista e que editar recarrega os dados.
Expected: cadastro, upload de foto e edição funcionando.

- [ ] **Step 6: Commit**

```bash
git add "app/(painel)/painel/produtos"
git commit -m "feat: cadastro/edição de produto com fotos e grade"
```

---

## Task 17: Início do painel (resumo)

**Files:**
- Create: `app/(painel)/painel/page.tsx`

- [ ] **Step 1: Página de início**

Create `app/(painel)/painel/page.tsx`:
```tsx
import Link from 'next/link'
import { getAllProductsAdmin } from '@/lib/data'
import { isLowStock, isSoldOut } from '@/lib/stock'

export default async function PainelHome() {
  const products = await getAllProductsAdmin()
  const ativos = products.filter((p) => p.visible).length
  const baixo = products.filter((p) => isLowStock(p) || isSoldOut(p)).length
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Olá! 👋</h1>
      <div className="grid grid-cols-2 gap-4 max-w-md mb-6">
        <Card label="Peças na loja" value={ativos} />
        <Card label="Estoque baixo/esgotado" value={baixo} />
      </div>
      <div className="flex gap-3">
        <Link href="/painel/produtos/novo" className="px-4 py-2 rounded bg-[#E89BB0] text-black font-medium">Cadastrar peça</Link>
        <Link href="/painel/produtos" className="px-4 py-2 rounded border">Ver produtos</Link>
      </div>
    </div>
  )
}
function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-4 bg-white">
      <p className="text-3xl font-serif">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  )
}
```

- [ ] **Step 2: Verificar (execução real)**

Abrir `/painel`. Expected: contadores corretos.

- [ ] **Step 3: Commit**

```bash
git add "app/(painel)/painel/page.tsx"
git commit -m "feat: início do painel com resumo"
```

---

## Task 18: Vitrine — layout (header/footer)

**Files:**
- Create: `app/(loja)/layout.tsx`

- [ ] **Step 1: Layout da loja**

Create `app/(loja)/layout.tsx`:
```tsx
import Link from 'next/link'
import { getCategories, getStoreConfig } from '@/lib/data'

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const [categories, config] = await Promise.all([getCategories(), getStoreConfig()])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-[#0A0A0A] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-[#E89BB0]">{config.name}</Link>
          <nav className="hidden md:flex gap-4 text-sm">
            {categories.filter(c => !c.parentId).map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="hover:text-[#E89BB0]">{c.name}</Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="bg-[#0A0A0A] text-neutral-300 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm space-y-2">
          <p className="font-serif text-[#E89BB0] text-lg">{config.name}</p>
          <p>Moda Feminina — Estilo • Elegância • Confiança</p>
          {config.pixKey && <p>Pix: {config.pixKey}</p>}
          {config.instagram && <p>Instagram: {config.instagram}</p>}
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros (páginas da loja vêm a seguir).

- [ ] **Step 3: Commit**

```bash
git add "app/(loja)/layout.tsx"
git commit -m "feat: layout da vitrine (header/footer)"
```

---

## Task 19: Vitrine — componente de card de produto

**Files:**
- Create: `components/product-card.tsx`

- [ ] **Step 1: Card reutilizável**

Create `components/product-card.tsx`:
```tsx
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatBRL } from '@/lib/money'
import { finalPriceCents, hasDiscount } from '@/lib/pricing'
import { isSoldOut } from '@/lib/stock'

export function ProductCard({ product }: { product: Product }) {
  const final = finalPriceCents(product)
  const promo = hasDiscount(product)
  const sold = isSoldOut(product)
  const cover = product.photos[0]?.url
  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-neutral-100 rounded overflow-hidden">
        {cover
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={cover} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
          : <div className="w-full h-full flex items-center justify-center text-neutral-400">sem foto</div>}
        {promo && <span className="absolute top-2 left-2 bg-[#E89BB0] text-black text-xs px-2 py-1 rounded">Promoção</span>}
        {sold && <span className="absolute top-2 right-2 bg-neutral-800 text-white text-xs px-2 py-1 rounded">Esgotado</span>}
      </div>
      <p className="mt-2 text-sm">{product.name}</p>
      <p className="text-sm">
        {promo && <span className="line-through text-neutral-400 mr-2">{formatBRL(product.priceCents)}</span>}
        <span className="font-medium">{formatBRL(final)}</span>
      </p>
    </Link>
  )
}
```

- [ ] **Step 2: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add components/product-card.tsx
git commit -m "feat: card de produto da vitrine"
```

---

## Task 20: Vitrine — home

**Files:**
- Create: `app/(loja)/page.tsx`

- [ ] **Step 1: Home**

Create `app/(loja)/page.tsx`:
```tsx
import Link from 'next/link'
import { getFeaturedProducts, getVisibleProducts, getCategories } from '@/lib/data'
import { ProductCard } from '@/components/product-card'

export default async function Home() {
  const [featured, all, categories] = await Promise.all([
    getFeaturedProducts(), getVisibleProducts(), getCategories(),
  ])
  const destaques = featured.length ? featured : all.slice(0, 8)
  return (
    <div>
      <section className="bg-[#0A0A0A] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-4xl text-[#E89BB0]">Nova Coleção</h1>
          <p className="mt-2 text-neutral-300">Estilo • Elegância • Confiança</p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex gap-3 flex-wrap">
            {categories.filter(c => !c.parentId).map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`}
                className="px-4 py-2 rounded-full border border-[#E89BB0] text-sm hover:bg-[#F3C6D3]">{c.name}</Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="font-serif text-2xl mb-6">Destaques</h2>
        {destaques.length === 0
          ? <p className="text-neutral-500">Em breve, novidades! 💕</p>
          : <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destaques.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verificar (execução real)**

`npm run dev` → abrir `/`. Com peças visíveis cadastradas, elas aparecem. Sem peças, mostra "Em breve".
Expected: home renderiza com destaques.

- [ ] **Step 3: Commit**

```bash
git add "app/(loja)/page.tsx"
git commit -m "feat: home da vitrine"
```

---

## Task 21: Vitrine — listagem por categoria com filtros

**Files:**
- Create: `app/(loja)/categoria/[slug]/page.tsx`, `components/product-grid-filtered.tsx`

- [ ] **Step 1: Grade com filtros (client)**

Create `components/product-grid-filtered.tsx`:
```tsx
'use client'
import { useState, useMemo } from 'react'
import type { Product } from '@/lib/types'
import { ProductCard } from '@/components/product-card'
import { finalPriceCents } from '@/lib/pricing'

export function ProductGridFiltered({ products }: { products: Product[] }) {
  const [size, setSize] = useState('')
  const [sort, setSort] = useState('recent')

  const sizes = useMemo(() => {
    const s = new Set<string>()
    products.forEach((p) => p.variants.forEach((v) => v.size && s.add(v.size)))
    return Array.from(s)
  }, [products])

  const list = useMemo(() => {
    let l = products
    if (size) l = l.filter((p) => p.variants.some((v) => v.size === size))
    if (sort === 'price-asc') l = [...l].sort((a, b) => finalPriceCents(a) - finalPriceCents(b))
    if (sort === 'price-desc') l = [...l].sort((a, b) => finalPriceCents(b) - finalPriceCents(a))
    return l
  }, [products, size, sort])

  return (
    <div>
      <div className="flex gap-3 mb-6 flex-wrap">
        {sizes.length > 0 && (
          <select value={size} onChange={(e) => setSize(e.target.value)} className="p-2 border rounded text-sm">
            <option value="">Todos os tamanhos</option>
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="p-2 border rounded text-sm">
          <option value="recent">Mais recentes</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>
      {list.length === 0
        ? <p className="text-neutral-500">Nenhuma peça encontrada.</p>
        : <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {list.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>}
    </div>
  )
}
```

- [ ] **Step 2: Página de categoria**

Create `app/(loja)/categoria/[slug]/page.tsx`:
```tsx
import { getProductsByCategory, getCategories } from '@/lib/data'
import { ProductGridFiltered } from '@/components/product-grid-filtered'

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [products, categories] = await Promise.all([getProductsByCategory(slug), getCategories()])
  const cat = categories.find((c) => c.slug === slug)
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl mb-6">{cat?.name ?? 'Produtos'}</h1>
      <ProductGridFiltered products={products} />
    </div>
  )
}
```

- [ ] **Step 3: Verificar (execução real)**

Acessar `/categoria/vestidos` (após cadastrar peças nessa categoria). Testar filtro de tamanho e ordenação.
Expected: filtros funcionam no cliente.

- [ ] **Step 4: Commit**

```bash
git add "app/(loja)/categoria" components/product-grid-filtered.tsx
git commit -m "feat: listagem por categoria com filtros"
```

---

## Task 22: Vitrine — página do produto + botão WhatsApp

**Files:**
- Create: `app/(loja)/produto/[slug]/page.tsx`, `components/buy-box.tsx`

- [ ] **Step 1: Caixa de compra (client, seleção tamanho/cor + WhatsApp)**

Create `components/buy-box.tsx`:
```tsx
'use client'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import { finalPriceCents } from '@/lib/pricing'
import { whatsappLink } from '@/lib/whatsapp'

export function BuyBox({ product, whatsapp }: { product: Product; whatsapp: string }) {
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)

  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[]
  const colors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[]
  const needsSize = product.hasGrid && sizes.length > 0
  const needsColor = product.hasGrid && colors.length > 0
  const ready = (!needsSize || size) && (!needsColor || color)

  const phone = whatsapp.startsWith('55') ? whatsapp : `55${whatsapp}`
  const link = whatsappLink(phone, { name: product.name, size, color, priceCents: finalPriceCents(product) })

  return (
    <div className="space-y-4">
      {needsSize && (
        <div>
          <p className="text-sm text-neutral-600 mb-1">Tamanho</p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)}
                className={`px-3 py-1 border rounded ${size === s ? 'bg-[#E89BB0] text-black' : ''}`}>{s}</button>
            ))}
          </div>
        </div>
      )}
      {needsColor && (
        <div>
          <p className="text-sm text-neutral-600 mb-1">Cor</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`px-3 py-1 border rounded ${color === c ? 'bg-[#E89BB0] text-black' : ''}`}>{c}</button>
            ))}
          </div>
        </div>
      )}
      {whatsapp ? (
        <a href={ready ? link : undefined}
          target="_blank" rel="noopener noreferrer"
          className={`block text-center px-6 py-3 rounded font-medium ${ready ? 'bg-[#E89BB0] text-black' : 'bg-neutral-200 text-neutral-400 pointer-events-none'}`}>
          {ready ? 'Comprar pelo WhatsApp' : 'Selecione tamanho/cor'}
        </a>
      ) : (
        <p className="text-sm text-neutral-500">WhatsApp não configurado.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Página do produto**

Create `app/(loja)/produto/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { getProductBySlug, getStoreConfig } from '@/lib/data'
import { formatBRL } from '@/lib/money'
import { finalPriceCents, hasDiscount } from '@/lib/pricing'
import { isLowStock, isSoldOut } from '@/lib/stock'
import { BuyBox } from '@/components/buy-box'

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  const config = await getStoreConfig()
  const final = finalPriceCents(product)
  const promo = hasDiscount(product)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        {product.photos.length === 0 && <div className="aspect-[3/4] bg-neutral-100 rounded flex items-center justify-center text-neutral-400">sem foto</div>}
        {product.photos.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={p.url} alt={product.name} className="w-full rounded object-cover" />
        ))}
      </div>
      <div>
        <h1 className="font-serif text-3xl">{product.name}</h1>
        <p className="mt-2 text-2xl">
          {promo && <span className="line-through text-neutral-400 mr-2 text-lg">{formatBRL(product.priceCents)}</span>}
          {formatBRL(final)}
        </p>
        {isSoldOut(product) && <p className="text-red-600 mt-1">Esgotado</p>}
        {isLowStock(product) && !isSoldOut(product) && <p className="text-amber-600 mt-1 text-sm">Últimas peças!</p>}
        <p className="mt-4 whitespace-pre-line text-neutral-700">{product.description}</p>
        <div className="mt-6">
          {!isSoldOut(product) && <BuyBox product={product} whatsapp={config.whatsapp} />}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar (execução real)**

Abrir uma peça pela vitrine. Conferir: galeria, preço com desconto riscado, seleção de tamanho/cor (na peça com grade), e que o botão abre o WhatsApp com a mensagem certa.
Expected: fluxo completo até o WhatsApp.

- [ ] **Step 4: Commit**

```bash
git add "app/(loja)/produto" components/buy-box.tsx
git commit -m "feat: página do produto com compra via WhatsApp"
```

---

## Task 23: Páginas de apoio (Sobre / Trocas)

**Files:**
- Create: `app/(loja)/sobre/page.tsx`

- [ ] **Step 1: Página Sobre/Trocas**

Create `app/(loja)/sobre/page.tsx`:
```tsx
import { getStoreConfig } from '@/lib/data'

export default async function SobrePage() {
  const c = await getStoreConfig()
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <section>
        <h1 className="font-serif text-2xl mb-2">Sobre a {c.name}</h1>
        <p className="whitespace-pre-line text-neutral-700">{c.aboutText || 'Moda feminina com estilo, elegância e confiança.'}</p>
      </section>
      <section>
        <h2 className="font-serif text-xl mb-2">Política de troca</h2>
        <p className="whitespace-pre-line text-neutral-700">{c.exchangeText || 'Fale conosco pelo WhatsApp para trocas.'}</p>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verificar compilação + execução**

Run: `npx tsc --noEmit` e abrir `/sobre`.
Expected: textos da config aparecem.

- [ ] **Step 3: Commit**

```bash
git add "app/(loja)/sobre"
git commit -m "feat: página sobre/trocas"
```

---

## Task 24: Suite completa + deploy na Vercel

**Files:**
- Modify: nenhum novo (deploy)

- [ ] **Step 1: Rodar todos os testes**

Run: `npm test`
Expected: PASS em money, pricing, slug, whatsapp, stock.

- [ ] **Step 2: Build de produção**

Run: `npm run build`
Expected: build conclui sem erro.

- [ ] **Step 3: Subir o repositório no GitHub**

Run:
```bash
git add -A && git commit -m "chore: fase 1 completa" || echo "nada a commitar"
```
Criar repositório remoto e fazer push (seguir o protocolo de push do CLAUDE.md do usuário).

- [ ] **Step 4: Deploy na Vercel**

Importar o repositório na Vercel (ou `vercel` CLI). Configurar as variáveis de ambiente:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
No Supabase → Authentication → URL Configuration, adicionar o domínio da Vercel.

- [ ] **Step 5: Verificar produção (execução real)**

Abrir a URL da Vercel: logar no `/painel`, cadastrar uma peça visível, e conferir que ela aparece na vitrine e o botão do WhatsApp funciona no celular.
Expected: loja no ar e operável. 🎉

- [ ] **Step 6: Commit final / tag**

```bash
git tag fase-1-mvp
```

---

## Self-Review (cobertura do spec)

- Vitrine (home, listagem+filtros, produto, WhatsApp) → Tasks 18–22 ✅
- "Só aparece o que ela liberar" (visível) → Tasks 8 (RLS), 11 (query), 15 (toggle) ✅
- Custo privado (nunca na vitrine) → Task 8 (nota) + Task 11 (colunas explícitas) ✅
- Produtos simples e com grade → Tasks 8, 16 ✅
- Fotos → Tasks 8 (bucket), 16 (upload) ✅
- Categorias → Task 14 ✅
- Preço/desconto → Tasks 3, 16, 19, 22 ✅
- Estoque (simples/por variação, esgotado, baixo) → Tasks 6, 16, 22 ✅
- Config (WhatsApp, Pix, Sobre, Trocas, logo) → Tasks 13, 18, 23 ✅
- Painel à prova de erro / login só da dona → Tasks 10 (auth + signups off), 15 (confirmações na Fase 2) ✅
- Identidade da marca → Task 12 + estilos nas páginas ✅
- Deploy R$0 → Task 24 ✅

**Fora de escopo desta fase (vão para planos próprios):** financeiro completo, cupons, carrinho de orçamento, pagamento online, frete, domínio próprio. (Conforme Seção 6 do spec.)
