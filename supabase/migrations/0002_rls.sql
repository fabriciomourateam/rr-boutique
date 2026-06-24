alter table categories enable row level security;
alter table products enable row level security;
alter table variants enable row level security;
alter table photos enable row level security;
alter table store_config enable row level security;

-- Leitura pública
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
