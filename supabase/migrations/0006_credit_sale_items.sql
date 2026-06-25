-- Itens de um pedido fiado (um pedido pode ter várias peças)
create table credit_sale_items (
  id uuid primary key default gen_random_uuid(),
  credit_sale_id uuid not null references credit_sales(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references variants(id) on delete set null,
  description text not null default '',
  quantity integer not null default 1,
  amount_cents integer not null default 0
);

alter table credit_sale_items enable row level security;
create policy "adm_credit_sale_items" on credit_sale_items for all to authenticated using (true) with check (true);
