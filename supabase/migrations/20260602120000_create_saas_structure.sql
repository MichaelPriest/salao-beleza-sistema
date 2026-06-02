-- Estrutura SaaS: empresas, unidades, planos, assinaturas e cobrança.
-- Mantém o mesmo padrão documental usado pela aplicação (document_id + data JSONB).

create extension if not exists pgcrypto;

create or replace function public.set_document_table_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.create_document_table(p_table_name text)
returns void as $$
begin
  execute format($sql$
    create table if not exists public.%I (
      id uuid primary key default gen_random_uuid(),
      document_id text not null unique,
      data jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  $sql$, p_table_name);

  execute format('create index if not exists %I on public.%I (document_id)', p_table_name || '_document_id_idx', p_table_name);
  execute format('create index if not exists %I on public.%I using gin (data)', p_table_name || '_data_gin_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''empresaId''))', p_table_name || '_empresa_id_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''unidadeId''))', p_table_name || '_unidade_id_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''status''))', p_table_name || '_status_idx', p_table_name);

  execute format('drop trigger if exists %I on public.%I', p_table_name || '_set_updated_at', p_table_name);
  execute format(
    'create trigger %I before update on public.%I for each row execute function public.set_document_table_updated_at()',
    p_table_name || '_set_updated_at',
    p_table_name
  );

  execute format('alter table public.%I enable row level security', p_table_name);
  execute format('grant select, insert, update, delete on public.%I to anon, authenticated', p_table_name);

  execute format('drop policy if exists %I on public.%I', p_table_name || '_select_anon_auth', p_table_name);
  execute format('create policy %I on public.%I for select to anon, authenticated using (true)', p_table_name || '_select_anon_auth', p_table_name);

  execute format('drop policy if exists %I on public.%I', p_table_name || '_insert_anon_auth', p_table_name);
  execute format('create policy %I on public.%I for insert to anon, authenticated with check (true)', p_table_name || '_insert_anon_auth', p_table_name);

  execute format('drop policy if exists %I on public.%I', p_table_name || '_update_anon_auth', p_table_name);
  execute format('create policy %I on public.%I for update to anon, authenticated using (true) with check (true)', p_table_name || '_update_anon_auth', p_table_name);

  execute format('drop policy if exists %I on public.%I', p_table_name || '_delete_anon_auth', p_table_name);
  execute format('create policy %I on public.%I for delete to anon, authenticated using (true)', p_table_name || '_delete_anon_auth', p_table_name);
end;
$$ language plpgsql;

do $$
declare
  table_name text;
  saas_tables text[] := array[
    'empresas',
    'unidades',
    'planos_saas',
    'assinaturas',
    'faturas_saas',
    'pagamentos_saas',
    'convites_saas',
    'uso_saas',
    'eventos_cobranca_saas'
  ];
begin
  foreach table_name in array saas_tables loop
    perform public.create_document_table(table_name);
  end loop;
end;
$$;

insert into public.planos_saas (document_id, data)
values
  ('individual', jsonb_build_object(
    'id', 'individual',
    'nome', 'Individual',
    'descricao', 'Para uma empresa com uma única unidade',
    'tipo', 'individual',
    'precoMensal', 99,
    'moeda', 'BRL',
    'limites', jsonb_build_object('empresas', 1, 'unidades', 1, 'usuarios', 5, 'clientes', 1000),
    'recursos', jsonb_build_array('agenda', 'clientes', 'financeiro_basico', 'fidelidade'),
    'status', 'ativo',
    'createdAt', now(),
    'updatedAt', now()
  )),
  ('multiunidades', jsonb_build_object(
    'id', 'multiunidades',
    'nome', 'Multiunidades',
    'descricao', 'Para redes com múltiplas unidades e gestão centralizada',
    'tipo', 'multiunidades',
    'precoMensal', 249,
    'precoPorUnidade', 49,
    'moeda', 'BRL',
    'limites', jsonb_build_object('empresas', 1, 'unidades', 999, 'usuarios', 999, 'clientes', 999999),
    'recursos', jsonb_build_array('agenda', 'clientes', 'financeiro_completo', 'fidelidade', 'multiunidades', 'relatorios_rede'),
    'status', 'ativo',
    'createdAt', now(),
    'updatedAt', now()
  ))
on conflict (document_id) do update
  set data = excluded.data,
      updated_at = now();
