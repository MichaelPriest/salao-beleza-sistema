-- Atualiza todas as tabelas usadas pelo sistema para o formato híbrido compatível
-- com a aplicação:
--   1. formato documental: document_id + data jsonb
--   2. formato direto: colunas comuns como empresaId, unidadeId, status etc.
--
-- Execute esta migration no SQL Editor/Supabase CLI para corrigir erros como:
--   Could not find the 'data' column of '<tabela>' in the schema cache
-- e permitir que registros existentes em tabelas diretas sejam lidos via data->>campo.

create extension if not exists pgcrypto;

create or replace function public.set_document_table_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.ensure_app_column(
  p_table_name text,
  p_column_name text,
  p_column_type text
)
returns void as $$
begin
  if to_regclass(format('public.%I', p_table_name)) is null then
    raise notice 'Tabela %.% não existe; coluna % não aplicada.', 'public', p_table_name, p_column_name;
    return;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = p_table_name
      and column_name = p_column_name
  ) then
    execute format('alter table public.%I add column %I %s', p_table_name, p_column_name, p_column_type);
  end if;
end;
$$ language plpgsql;

create or replace function public.upgrade_app_table(p_table_name text)
returns void as $$
declare
  common_columns text[][] := array[
    array['document_id', 'text'],
    array['data', 'jsonb not null default ''{}''::jsonb'],
    array['created_at', 'timestamptz not null default now()'],
    array['updated_at', 'timestamptz not null default now()'],
    array['empresaId', 'text'],
    array['empresaNome', 'text'],
    array['unidadeId', 'text'],
    array['unidadeNome', 'text'],
    array['createdAt', 'timestamptz'],
    array['updatedAt', 'timestamptz'],
    array['status', 'text'],
    array['tipo', 'text'],
    array['origem', 'text'],
    array['categoria', 'text'],
    array['prioridade', 'text'],
    array['titulo', 'text'],
    array['descricao', 'text'],
    array['mensagem', 'text'],
    array['link', 'text'],
    array['lida', 'boolean not null default false'],
    array['usuarioId', 'text'],
    array['clienteId', 'text'],
    array['clienteDocId', 'text'],
    array['clienteNome', 'text'],
    array['clienteEmail', 'text'],
    array['solicitanteId', 'text'],
    array['solicitanteNome', 'text'],
    array['solicitanteEmail', 'text'],
    array['atendenteId', 'text'],
    array['atendenteNome', 'text'],
    array['nome', 'text'],
    array['email', 'text'],
    array['telefone', 'text'],
    array['documento', 'text'],
    array['slug', 'text'],
    array['cargo', 'text'],
    array['role', 'text'],
    array['authUid', 'text'],
    array['googleUid', 'text'],
    array['planoId', 'text'],
    array['assinaturaId', 'text'],
    array['gateway', 'text'],
    array['metodoPagamento', 'text'],
    array['metodoPagamentoLabel', 'text'],
    array['moeda', 'text'],
    array['valor', 'numeric'],
    array['vencimentoEm', 'timestamptz'],
    array['pagoEm', 'timestamptz'],
    array['mensagens', 'jsonb not null default ''[]''::jsonb'],
    array['detalhes', 'jsonb not null default ''{}''::jsonb'],
    array['dados', 'jsonb not null default ''{}''::jsonb'],
    array['metodosPagamento', 'jsonb not null default ''{}''::jsonb'],
    array['dadosCobranca', 'jsonb not null default ''{}''::jsonb'],
    array['configPagamento', 'jsonb not null default ''{}''::jsonb'],
    array['cobranca', 'jsonb not null default ''{}''::jsonb'],
    array['metadata', 'jsonb not null default ''{}''::jsonb']
  ];
  col text[];
begin
  execute format($sql$
    create table if not exists public.%I (
      id uuid primary key default gen_random_uuid()
    )
  $sql$, p_table_name);

  foreach col slice 1 in array common_columns loop
    perform public.ensure_app_column(p_table_name, col[1], col[2]);
  end loop;

  -- Garante que document_id exista para linhas antigas de tabelas diretas.
  execute format('update public.%I set document_id = coalesce(document_id, id::text) where document_id is null', p_table_name);

  -- Garante compatibilidade com o padrão documental do app: data contém o payload completo.
  execute format($sql$
    update public.%I as t
       set data = jsonb_strip_nulls(to_jsonb(t) - 'data')
     where t.data is null
        or t.data = '{}'::jsonb
  $sql$, p_table_name);

  execute format('create unique index if not exists %I on public.%I (document_id)', p_table_name || '_document_id_uidx', p_table_name);
  execute format('create index if not exists %I on public.%I using gin (data)', p_table_name || '_data_gin_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ("empresaId")', p_table_name || '_empresaId_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ("unidadeId")', p_table_name || '_unidadeId_idx', p_table_name);
  execute format('create index if not exists %I on public.%I (status)', p_table_name || '_status_direct_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''empresaId''))', p_table_name || '_data_empresaId_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''unidadeId''))', p_table_name || '_data_unidadeId_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''status''))', p_table_name || '_data_status_idx', p_table_name);

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
    'chamados_suporte',
    'clientes',
    'cloud_config',
    'comissoes',
    'compras',
    'conciliacoes',
    'config_fidelidade',
    'configuracoes',
    'configuracoes_saas',
    'contas_pagar',
    'contas_receber',
    'convites_saas',
    'cupons',
    'disponibilidades',
    'entradas',
    'eventos_cobranca_saas',
    'faturas_saas',
    'formularios_anamnese',
    'fornecedores',
    'historico_precos_produtos',
    'indicacoes',
    'itens_venda',
    'leads_saas',
    'logs',
    'logs_anamnese',
    'modelos_anamnese',
    'movimentacoes_estoque',
    'notificacoes',
    'notificacoes_cliente',
    'orcamentos',
    'pagamentos',
    'pagamentos_saas',
    'planos_saas',
    'pontuacao',
    'produtos',
    'profissionais',
    'recompensas',
    'resgates_fidelidade',
    'respostas_anamnese',
    'servicos',
    'transacoes',
    'unidades',
    'uso_saas',
    'usos_cupons',
    'usuarios',
    'webhooks_cobranca_saas'
  ];
begin
  foreach table_name in array app_tables loop
    perform public.upgrade_app_table(table_name);
  end loop;
end;
$$;

-- Atualiza o cache do PostgREST/Supabase para as novas colunas ficarem disponíveis na API REST.
notify pgrst, 'reload schema';
