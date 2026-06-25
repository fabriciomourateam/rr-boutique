-- Permissões do bucket de fotos "produtos"
-- Leitura pública (bucket já é público, mas deixamos explícito)
create policy "produtos_read" on storage.objects
  for select using (bucket_id = 'produtos');

-- Envio/edição/remoção apenas para a dona (autenticada)
create policy "produtos_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos');

create policy "produtos_update" on storage.objects
  for update to authenticated using (bucket_id = 'produtos') with check (bucket_id = 'produtos');

create policy "produtos_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos');
