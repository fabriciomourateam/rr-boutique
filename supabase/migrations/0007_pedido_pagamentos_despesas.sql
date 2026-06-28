-- Pedido: data da compra e frete
alter table credit_sales add column if not exists purchase_date date;
alter table credit_sales add column if not exists freight_cents integer not null default 0;

-- Pagamentos parciais de um pedido
create table if not exists credit_sale_payments (
  id uuid primary key default gen_random_uuid(),
  credit_sale_id uuid not null references credit_sales(id) on delete cascade,
  amount_cents integer not null default 0,
  paid_date date not null default current_date,
  method text default '',
  created_at timestamptz default now()
);
alter table credit_sale_payments enable row level security;
create policy "adm_credit_sale_payments" on credit_sale_payments for all to authenticated using (true) with check (true);

-- Migra pedidos já marcados como pagos para um pagamento equivalente (preserva histórico)
insert into credit_sale_payments (credit_sale_id, amount_cents, paid_date)
select id, amount_cents, coalesce(paid_at, current_date)
from credit_sales
where paid = true
  and not exists (select 1 from credit_sale_payments p where p.credit_sale_id = credit_sales.id);

-- Despesas: fornecedor e categoria
alter table cash_entries add column if not exists supplier text default '';
alter table cash_entries add column if not exists category text default '';
