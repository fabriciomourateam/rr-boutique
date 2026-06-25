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
  name text default 'RR Boutique',
  whatsapp text default '',
  pix_key text default '',
  instagram text default '',
  banner_url text default '',
  about_text text default '',
  exchange_text text default ''
);
insert into store_config (id) values (1) on conflict do nothing;
