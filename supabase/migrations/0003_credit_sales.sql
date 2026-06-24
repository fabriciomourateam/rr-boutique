-- Vendas fiado / contas a receber (dados privados, só admin)
create table credit_sales (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_whatsapp text default '',
  product_id uuid references products(id) on delete set null,
  variant_id uuid references variants(id) on delete set null,
  description text not null,          -- snapshot do que foi comprado (nome + tam/cor)
  amount_cents integer not null default 0,
  quantity integer not null default 1,
  sale_date date not null default current_date,
  due_date date,                      -- "vence em" (combinado de pagamento)
  paid boolean not null default false,
  paid_at date,
  created_at timestamptz default now()
);

alter table credit_sales enable row level security;
-- Sem leitura pública: é financeiro privado. Só a dona (autenticada) acessa.
create policy "adm_credit_sales" on credit_sales for all to authenticated using (true) with check (true);
