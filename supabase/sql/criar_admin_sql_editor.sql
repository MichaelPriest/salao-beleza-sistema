-- Cria/atualiza o documento do usuário administrador pelo Supabase SQL Editor.
-- Este SQL NÃO altera senha. A senha deve ser definida no Supabase Auth
-- (Dashboard > Authentication > Users) ou pela Admin API/service role.
--
-- Usuário Auth existente informado:
--   id:    a420ce6a-c852-48e2-ad49-7bd050f854d1
--   email: michael.rodrigoraimundo@gmail.com

create extension if not exists pgcrypto;

-- Garante que a tabela documental `usuarios` exista mesmo se a migration geral
-- ainda não tiver sido executada.
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  document_id text not null unique,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists usuarios_document_id_idx on public.usuarios (document_id);
create index if not exists usuarios_data_gin_idx on public.usuarios using gin (data);

create or replace function public.set_document_table_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists usuarios_set_updated_at on public.usuarios;
create trigger usuarios_set_updated_at
before update on public.usuarios
for each row execute function public.set_document_table_updated_at();

alter table public.usuarios enable row level security;
grant select, insert, update, delete on public.usuarios to anon, authenticated;

drop policy if exists usuarios_select_anon_auth on public.usuarios;
create policy usuarios_select_anon_auth
on public.usuarios for select
to anon, authenticated
using (true);

drop policy if exists usuarios_insert_anon_auth on public.usuarios;
create policy usuarios_insert_anon_auth
on public.usuarios for insert
to anon, authenticated
with check (true);

drop policy if exists usuarios_update_anon_auth on public.usuarios;
create policy usuarios_update_anon_auth
on public.usuarios for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists usuarios_delete_anon_auth on public.usuarios;
create policy usuarios_delete_anon_auth
on public.usuarios for delete
to anon, authenticated
using (true);

do $$
declare
  v_user_id text := 'a420ce6a-c852-48e2-ad49-7bd050f854d1';
  v_email text := 'michael.rodrigoraimundo@gmail.com';
  v_nome text := 'Administrador';
  v_now timestamptz := now();
  v_permissoes jsonb := to_jsonb(array[
    'admin',
    'gerenciar_usuarios',
    'gerenciar_clientes',
    'gerenciar_agendamentos',
    'gerenciar_servicos',
    'gerenciar_profissionais',
    'gerenciar_estoque',
    'visualizar_relatorios',
    'configurar_sistema',
    'visualizar_comissoes',
    'gerenciar_backup',
    'gerenciar_fidelidade',
    'visualizar_todos_pontos'
  ]::text[]);
  v_usuario jsonb;
begin
  v_usuario := jsonb_build_object(
    'id', v_user_id,
    'uid', v_user_id,
    'nome', v_nome,
    'email', v_email,
    'cargo', 'admin',
    'status', 'ativo',
    'permissoes', v_permissoes,
    'isCliente', false,
    'criadoViaSqlEditor', true,
    'dataCadastro', v_now,
    'createdAt', v_now,
    'updatedAt', v_now
  );

  -- Tabela usada pelo modo atual da aplicação (REACT_APP_SUPABASE_USE_COLLECTION_TABLES=true).
  insert into public.usuarios (document_id, data, created_at, updated_at)
  values (v_user_id, v_usuario, v_now, v_now)
  on conflict (document_id) do update
    set data = public.usuarios.data || excluded.data,
        updated_at = now();

  -- Compatibilidade com o modo legado `public.registros`, caso a tabela exista.
  if to_regclass('public.registros') is not null then
    insert into public.registros (collection, document_id, data, created_at, updated_at)
    values ('usuarios', v_user_id, v_usuario, v_now, v_now)
    on conflict (collection, document_id) do update
      set data = public.registros.data || excluded.data,
          updated_at = now();
  end if;

  -- Atualiza metadados do usuário Auth existente para facilitar auditoria/identificação.
  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
        'nome', v_nome,
        'cargo', 'admin',
        'email_verified', true
      ),
      email_confirmed_at = coalesce(email_confirmed_at, v_now),
      confirmed_at = coalesce(confirmed_at, v_now),
      updated_at = v_now
  where id = v_user_id::uuid;

  if not found then
    raise notice 'Usuário Auth % não encontrado. Crie-o em Authentication > Users e rode este SQL novamente.', v_email;
  else
    raise notice 'Administrador % configurado com sucesso.', v_email;
  end if;
end $$;
