-- Tabela documental genérica usada pela camada de compatibilidade do sistema.
-- Cada antiga coleção do Firebase passa a ser identificada por `collection`, e
-- o documento completo é guardado no JSONB `data`.

create extension if not exists pgcrypto;

create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  document_id text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection, document_id)
);

create index if not exists registros_collection_idx on public.registros (collection);
create index if not exists registros_collection_document_idx on public.registros (collection, document_id);
create index if not exists registros_data_gin_idx on public.registros using gin (data);

create or replace function public.set_registros_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_registros_updated_at on public.registros;
create trigger set_registros_updated_at
before update on public.registros
for each row execute function public.set_registros_updated_at();

alter table public.registros enable row level security;

-- Ajuste estas políticas conforme o nível de segurança desejado do salão.
-- O frontend usa a chave publishable/anon; por isso liberamos anon + authenticated
-- para manter os fluxos públicos já existentes (cadastro/login de cliente, agenda etc.).
drop policy if exists "registros_select_authenticated" on public.registros;
create policy "registros_select_authenticated"
on public.registros for select
to anon, authenticated
using (true);

drop policy if exists "registros_insert_authenticated" on public.registros;
create policy "registros_insert_authenticated"
on public.registros for insert
to anon, authenticated
with check (true);

drop policy if exists "registros_update_authenticated" on public.registros;
create policy "registros_update_authenticated"
on public.registros for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "registros_delete_authenticated" on public.registros;
create policy "registros_delete_authenticated"
on public.registros for delete
to anon, authenticated
using (true);
