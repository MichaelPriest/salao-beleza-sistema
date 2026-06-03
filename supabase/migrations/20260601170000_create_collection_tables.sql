-- Cria as tabelas documentais usadas pelo sistema no Supabase.
-- Cada tabela mantém compatibilidade com o formato anterior do app:
--   document_id = id lógico do documento
--   data        = payload JSONB completo do documento

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
  app_tables text[] := array[
    'agendamentos',
    'atendimentos',
    'auditoria',
    'ausencias',
    'avaliacoes',
    'backups',
    'caixa',
    'campanhas',
    'categorias_produtos',
    'clientes',
    'cloud_config',
    'comissoes',
    'compras',
    'conciliacoes',
    'config_fidelidade',
    'configuracoes',
    'contas_pagar',
    'contas_receber',
    'cupons',
    'disponibilidades',
    'entradas',
    'formularios_anamnese',
    'fornecedores',
    'indicacoes',
    'itens_venda',
    'logs',
    'logs_anamnese',
    'modelos_anamnese',
    'movimentacoes_estoque',
    'notificacoes',
    'notificacoes_cliente',
    'orcamentos',
    'pagamentos',
    'pontuacao',
    'produtos',
    'profissionais',
    'recompensas',
    'resgates_fidelidade',
    'respostas_anamnese',
    'servicos',
    'transacoes',
    'usos_cupons',
    'usuarios'
  ];
begin
  foreach table_name in array app_tables loop
    perform public.create_document_table(table_name);

    -- Se a tabela genérica `registros` já tiver dados, copia para a tabela
    -- específica correspondente sem sobrescrever documentos já existentes.
    if to_regclass('public.registros') is not null then
      execute format(
        'insert into public.%I (document_id, data, created_at, updated_at)
         select document_id, data, created_at, updated_at
         from public.registros
         where collection = %L
         on conflict (document_id) do nothing',
        table_name,
        table_name
      );
    end if;
  end loop;
end;
$$;
