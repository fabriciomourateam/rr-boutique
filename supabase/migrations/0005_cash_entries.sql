-- Movimentações de caixa (entradas e saídas) — dados privados, só admin
create table cash_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('entrada', 'saida')),
  description text not null default '',
  amount_cents integer not null default 0,
  entry_date date not null default current_date,
  created_at timestamptz default now()
);

alter table cash_entries enable row level security;
create policy "adm_cash_entries" on cash_entries for all to authenticated using (true) with check (true);
