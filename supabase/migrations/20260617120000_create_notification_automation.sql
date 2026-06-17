-- Automatiza a geração de notificações no Supabase para os fluxos usados pelo app.
--
-- O sistema usa tabelas documentais compatíveis com Firebase:
--   document_id = id lógico usado pela aplicação
--   data        = payload completo em JSONB
--
-- Esta migration:
--   1. garante estrutura/índices mínimos de notificacoes e notificacoes_cliente;
--   2. cria helpers idempotentes para inserir/atualizar notificações;
--   3. cria triggers em tabelas operacionais para gerar notificações automaticamente.

create extension if not exists pgcrypto;

create or replace function public.ensure_notification_column(
  p_table_name text,
  p_column_name text,
  p_column_type text
)
returns void as $$
begin
  if to_regclass(format('public.%I', p_table_name)) is null then
    execute format($sql$
      create table public.%I (
        id uuid primary key default gen_random_uuid(),
        document_id text not null unique,
        data jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    $sql$, p_table_name);
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

create or replace function public.ensure_notification_jsonb_data(p_table_name text)
returns void as $$
declare
  v_data_type text;
  v_legacy_column text;
  v_counter integer := 0;
begin
  select data_type
    into v_data_type
    from information_schema.columns
   where table_schema = 'public'
     and table_name = p_table_name
     and column_name = 'data';

  if v_data_type is null then
    perform public.ensure_notification_column(p_table_name, 'data', 'jsonb not null default ''{}''::jsonb');
    return;
  end if;

  if v_data_type <> 'jsonb' then
    v_legacy_column := 'data_legacy';
    while exists (
      select 1
        from information_schema.columns
       where table_schema = 'public'
         and table_name = p_table_name
         and column_name = v_legacy_column
    ) loop
      v_counter := v_counter + 1;
      v_legacy_column := 'data_legacy_' || v_counter::text;
    end loop;

    execute format('alter table public.%I rename column data to %I', p_table_name, v_legacy_column);
    perform public.ensure_notification_column(p_table_name, 'data', 'jsonb not null default ''{}''::jsonb');

    raise notice 'Coluna %.data era do tipo %, renomeada para %.% e recriada como jsonb.',
      p_table_name,
      v_data_type,
      p_table_name,
      v_legacy_column;
  end if;
end;
$$ language plpgsql;

create or replace function public.relax_notification_legacy_not_nulls(p_table_name text)
returns void as $$
declare
  v_column text;
begin
  for v_column in
    select column_name
      from information_schema.columns
     where table_schema = 'public'
       and table_name = p_table_name
       and is_nullable = 'NO'
       and column_name not in ('id', 'document_id', 'data', 'created_at', 'updated_at')
  loop
    execute format('alter table public.%I alter column %I drop not null', p_table_name, v_column);
  end loop;
end;
$$ language plpgsql;

create or replace function public.ensure_notification_table(p_table_name text)
returns void as $$
begin
  perform public.ensure_notification_column(p_table_name, 'document_id', 'text');
  perform public.ensure_notification_jsonb_data(p_table_name);
  perform public.relax_notification_legacy_not_nulls(p_table_name);
  perform public.ensure_notification_column(p_table_name, 'created_at', 'timestamptz not null default now()');
  perform public.ensure_notification_column(p_table_name, 'updated_at', 'timestamptz not null default now()');

  execute format('update public.%I set document_id = coalesce(document_id, id::text) where document_id is null', p_table_name);
  execute format('create unique index if not exists %I on public.%I (document_id)', p_table_name || '_document_id_uidx', p_table_name);
  execute format('drop index if exists public.%I', p_table_name || '_data_gin_idx');
  execute format('create index if not exists %I on public.%I using gin (data)', p_table_name || '_data_gin_idx', p_table_name);

  execute format('create index if not exists %I on public.%I ((data->>''empresaId''))', p_table_name || '_empresa_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''unidadeId''))', p_table_name || '_unidade_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''usuarioId''))', p_table_name || '_usuario_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''destinatarioId''))', p_table_name || '_destinatario_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''clienteId''))', p_table_name || '_cliente_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((data->>''tipo''))', p_table_name || '_tipo_idx', p_table_name);
  execute format('create index if not exists %I on public.%I (((data->>''lida'')::boolean))', p_table_name || '_lida_idx', p_table_name);
  execute format('create index if not exists %I on public.%I ((coalesce(data->>''createdAt'', data->>''data'')))', p_table_name || '_data_ordem_idx', p_table_name);

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

select public.ensure_notification_table('notificacoes');
select public.ensure_notification_table('notificacoes_cliente');

create or replace function public.app_notification_payload(p_row jsonb)
returns jsonb as $$
begin
  return jsonb_strip_nulls(coalesce(p_row->'data', '{}'::jsonb) || (p_row - 'data'));
end;
$$ language plpgsql immutable;

create or replace function public.text_or_dash(p_value text)
returns text as $$
begin
  return coalesce(nullif(trim(p_value), ''), '—');
end;
$$ language plpgsql immutable;

create or replace function public.numeric_or_null(p_value text)
returns numeric as $$
begin
  if p_value is null or trim(p_value) = '' then
    return null;
  end if;

  return replace(regexp_replace(p_value, '[^0-9,.-]', '', 'g'), ',', '.')::numeric;
exception
  when others then
    return null;
end;
$$ language plpgsql immutable;

create or replace function public.app_document_payload(p_table_name text, p_document_id text)
returns jsonb as $$
declare
  v_payload jsonb := '{}'::jsonb;
begin
  if p_document_id is null or trim(p_document_id) = '' or to_regclass(format('public.%I', p_table_name)) is null then
    return '{}'::jsonb;
  end if;

  execute format(
    'select public.app_notification_payload(to_jsonb(t)) from public.%I t where t.document_id = $1 or t.data->>''id'' = $1 limit 1',
    p_table_name
  )
  into v_payload
  using p_document_id;

  return coalesce(v_payload, '{}'::jsonb);
exception
  when others then
    return '{}'::jsonb;
end;
$$ language plpgsql;

create or replace function public.first_json_text(p_payload jsonb, variadic p_paths text[])
returns text as $$
declare
  v_path text;
  v_value text;
begin
  foreach v_path in array p_paths loop
    if v_path like '%.%' then
      v_value := p_payload #>> string_to_array(v_path, '.');
    else
      v_value := p_payload->>v_path;
    end if;

    if v_value is not null and trim(v_value) <> '' then
      return v_value;
    end if;
  end loop;

  return null;
end;
$$ language plpgsql immutable;

create or replace function public.upsert_admin_notification(
  p_document_id text,
  p_tipo text,
  p_titulo text,
  p_mensagem text,
  p_link text,
  p_payload jsonb,
  p_extra jsonb default '{}'::jsonb
)
returns void as $$
declare
  v_data jsonb;
begin
  if p_document_id is null or p_document_id = '' then
    return;
  end if;

  v_data := jsonb_strip_nulls(jsonb_build_object(
    'id', p_document_id,
    'tipo', p_tipo,
    'titulo', p_titulo,
    'mensagem', p_mensagem,
    'icone', coalesce(p_extra->>'icone', 'notifications'),
    'link', p_link,
    'lida', false,
    'todos', true,
    'broadcast', true,
    'tipoDestinatario', 'todos',
    'origem', 'supabase_trigger',
    'empresaId', p_payload->>'empresaId',
    'empresaNome', p_payload->>'empresaNome',
    'unidadeId', p_payload->>'unidadeId',
    'unidadeNome', p_payload->>'unidadeNome',
    'usuarioId', coalesce(p_payload->>'usuarioId', p_payload->>'profissionalId', p_payload->>'adminId'),
    'profissionalId', p_payload->>'profissionalId',
    'clienteId', p_payload->>'clienteId',
    'clienteNome', p_payload->>'clienteNome',
    'referenciaId', coalesce(p_payload->>'id', p_payload->>'document_id'),
    'referenciaTabela', p_extra->>'tabela',
    'prioridade', coalesce(p_extra->>'prioridade', 'normal'),
    'data', now(),
    'createdAt', now(),
    'updatedAt', now(),
    'dados', coalesce(p_payload, '{}'::jsonb) || coalesce(p_extra, '{}'::jsonb)
  ));

  insert into public.notificacoes (document_id, data, created_at, updated_at)
  values (p_document_id, v_data, now(), now())
  on conflict (document_id) do update
     set data = public.notificacoes.data
                || (excluded.data - 'createdAt' - 'data')
                || jsonb_build_object('updatedAt', now()),
         updated_at = now();
end;
$$ language plpgsql;

create or replace function public.upsert_cliente_notification(
  p_document_id text,
  p_cliente_id text,
  p_tipo text,
  p_titulo text,
  p_mensagem text,
  p_link text,
  p_payload jsonb,
  p_extra jsonb default '{}'::jsonb
)
returns void as $$
declare
  v_data jsonb;
begin
  if p_document_id is null or p_document_id = '' or p_cliente_id is null or p_cliente_id = '' then
    return;
  end if;

  v_data := jsonb_strip_nulls(jsonb_build_object(
    'id', p_document_id,
    'clienteId', p_cliente_id,
    'clienteUid', coalesce(p_payload->>'clienteUid', p_payload->>'authUid', p_payload->>'googleUid'),
    'clienteEmail', coalesce(p_payload->>'clienteEmail', p_payload->>'email'),
    'clienteIds', jsonb_build_array(
      p_cliente_id,
      p_payload->>'clienteId',
      p_payload->>'clienteDocId',
      p_payload->>'clienteUid',
      p_payload->>'authUid',
      p_payload->>'googleUid',
      p_payload->>'clienteEmail',
      p_payload->>'email'
    ),
    'tipo', p_tipo,
    'titulo', p_titulo,
    'mensagem', p_mensagem,
    'icone', coalesce(p_extra->>'icone', 'notifications'),
    'link', p_link,
    'lida', false,
    'origem', 'supabase_trigger',
    'empresaId', p_payload->>'empresaId',
    'empresaNome', p_payload->>'empresaNome',
    'unidadeId', p_payload->>'unidadeId',
    'unidadeNome', p_payload->>'unidadeNome',
    'referenciaId', coalesce(p_payload->>'id', p_payload->>'document_id'),
    'referenciaTabela', p_extra->>'tabela',
    'data', now(),
    'createdAt', now(),
    'updatedAt', now(),
    'dados', coalesce(p_payload, '{}'::jsonb) || coalesce(p_extra, '{}'::jsonb)
  ));

  insert into public.notificacoes_cliente (document_id, data, created_at, updated_at)
  values (p_document_id, v_data, now(), now())
  on conflict (document_id) do update
     set data = public.notificacoes_cliente.data
                || (excluded.data - 'createdAt' - 'data')
                || jsonb_build_object('updatedAt', now()),
         updated_at = now();
end;
$$ language plpgsql;

create or replace function public.handle_app_notification_events()
returns trigger as $$
declare
  payload jsonb;
  old_payload jsonb;
  ref_id text;
  status_atual text;
  status_anterior text;
  cliente_id text;
  cliente_payload jsonb;
  servico_payload jsonb;
  profissional_payload jsonb;
  produto_payload jsonb;
  recompensa_payload jsonb;
  servico_id text;
  profissional_id text;
  produto_id text;
  recompensa_id text;
  cliente_nome text;
  servico_nome text;
  profissional_nome text;
  produto_nome text;
  recompensa_nome text;
  titulo_ref text;
  valor_ref text;
  quantidade numeric;
  estoque_minimo numeric;
begin
  payload := public.app_notification_payload(to_jsonb(new));
  old_payload := case when tg_op = 'UPDATE' then public.app_notification_payload(to_jsonb(old)) else '{}'::jsonb end;
  ref_id := coalesce(new.document_id, payload->>'id', new.id::text);
  status_atual := coalesce(payload->>'status', payload->>'situacao');
  status_anterior := coalesce(old_payload->>'status', old_payload->>'situacao');
  cliente_id := coalesce(
    payload->>'clienteId',
    payload->>'clienteDocId',
    payload->>'clienteUid',
    payload->>'authUid',
    payload->>'googleUid',
    public.first_json_text(payload, 'cliente.id', 'cliente.uid', 'cliente.authUid', 'cliente.googleUid')
  );
  servico_id := public.first_json_text(payload, 'servicoId', 'servicos.0.id', 'servicos.0.servicoId');
  profissional_id := public.first_json_text(payload, 'profissionalId', 'profissional.id');
  produto_id := public.first_json_text(payload, 'produtoId', 'produto.id', 'itens.0.produtoId', 'itens.0.id', 'produto_id');
  recompensa_id := public.first_json_text(payload, 'recompensaId', 'recompensa.id', 'recompensa.idRecompensa');
  cliente_payload := public.app_document_payload('clientes', cliente_id);
  servico_payload := public.app_document_payload('servicos', servico_id);
  profissional_payload := public.app_document_payload('profissionais', profissional_id);
  produto_payload := public.app_document_payload('produtos', coalesce(produto_id, ref_id));
  recompensa_payload := public.app_document_payload('recompensas', recompensa_id);
  cliente_nome := public.first_json_text(payload, 'clienteNome', 'nomeCliente', 'cliente.nome', 'cliente.name');
  cliente_nome := coalesce(cliente_nome, public.first_json_text(cliente_payload, 'nome', 'name', 'clienteNome'));
  servico_nome := public.first_json_text(payload, 'servicoNome', 'servico', 'servicos.0.nome', 'servicos.0.name', 'servicos.0.servicoNome');
  servico_nome := coalesce(servico_nome, public.first_json_text(servico_payload, 'nome', 'name', 'servicoNome'));
  profissional_nome := public.first_json_text(payload, 'profissionalNome', 'profissional.nome', 'profissional.name');
  profissional_nome := coalesce(profissional_nome, public.first_json_text(profissional_payload, 'nome', 'name', 'profissionalNome'));
  produto_nome := public.first_json_text(payload, 'produtoNome', 'produto.nome', 'itens.0.produtoNome', 'itens.0.nome', 'nome');
  produto_nome := coalesce(produto_nome, public.first_json_text(produto_payload, 'nome', 'name', 'produtoNome'));
  recompensa_nome := public.first_json_text(payload, 'recompensaNome', 'nomeRecompensa', 'recompensa.nome', 'recompensa.titulo', 'nome');
  recompensa_nome := coalesce(recompensa_nome, public.first_json_text(recompensa_payload, 'nome', 'titulo', 'name', 'recompensaNome'));

  payload := payload || jsonb_strip_nulls(jsonb_build_object(
    'clienteNome', cliente_nome,
    'servicoNome', servico_nome,
    'profissionalNome', profissional_nome,
    'produtoNome', produto_nome,
    'recompensaNome', recompensa_nome,
    'servicoId', servico_id,
    'profissionalId', profissional_id,
    'produtoId', produto_id,
    'recompensaId', recompensa_id,
    'statusAnterior', status_anterior,
    'statusAtual', status_atual,
    'dataAgendamento', coalesce(payload->>'data', payload->>'dataAgendamento'),
    'horarioAgendamento', coalesce(payload->>'horario', payload->>'horaInicio')
  ));

  if tg_table_name = 'agendamentos' then
    if tg_op = 'INSERT' then
      titulo_ref := public.text_or_dash(coalesce(cliente_nome, cliente_id));
      perform public.upsert_admin_notification(
        'auto_agendamento_novo_' || ref_id,
        'agendamento',
        'Novo agendamento',
        'Novo agendamento de ' || titulo_ref || ' para ' || public.text_or_dash(coalesce(servico_nome, servico_id)) ||
          case when profissional_nome is not null then ' com ' || profissional_nome else '' end || '.',
        '/agendamentos',
        payload,
        jsonb_build_object('tabela', tg_table_name, 'icone', 'event', 'prioridade', 'normal')
      );

      perform public.upsert_cliente_notification(
        'auto_cliente_agendamento_criado_' || ref_id,
        cliente_id,
        'agendamento',
        'Agendamento recebido',
        'Recebemos seu agendamento para ' || public.text_or_dash(coalesce(servico_nome, servico_id)) || '.',
        '/cliente/agendamentos',
        payload,
        jsonb_build_object('tabela', tg_table_name, 'icone', 'event')
      );
    elsif status_atual is distinct from status_anterior then
      perform public.upsert_admin_notification(
        'auto_agendamento_status_' || ref_id || '_' || coalesce(status_atual, 'status'),
        'agendamento',
        'Status do agendamento alterado',
        'Agendamento de ' || public.text_or_dash(coalesce(cliente_nome, cliente_id)) || ' para ' || public.text_or_dash(coalesce(servico_nome, servico_id)) ||
          ' alterado para ' || public.text_or_dash(status_atual) || '.',
        '/agendamentos',
        payload,
        jsonb_build_object('tabela', tg_table_name, 'icone', 'event_available', 'prioridade', 'normal')
      );

      perform public.upsert_cliente_notification(
        'auto_cliente_agendamento_status_' || ref_id || '_' || coalesce(status_atual, 'status'),
        cliente_id,
        'agendamento',
        'Agendamento atualizado',
        'Seu agendamento para ' || public.text_or_dash(coalesce(servico_nome, servico_id)) || ' foi alterado para ' || public.text_or_dash(status_atual) || '.',
        '/cliente/agendamentos',
        payload,
        jsonb_build_object('tabela', tg_table_name, 'icone', 'event_available')
      );
    end if;
  end if;

  if tg_table_name = 'clientes' and tg_op = 'INSERT' then
    perform public.upsert_admin_notification(
        'auto_cliente_novo_' || ref_id,
        'cliente',
        'Novo cliente cadastrado',
        public.text_or_dash(coalesce(cliente_nome, payload->>'nome')) || ' foi cadastrado no sistema.',
      '/clientes',
      payload,
      jsonb_build_object('tabela', tg_table_name, 'icone', 'person_add')
    );
  end if;

  if tg_table_name in ('produtos', 'movimentacoes_estoque') then
    if tg_table_name = 'movimentacoes_estoque' and produto_payload <> '{}'::jsonb then
      payload := payload || jsonb_strip_nulls(jsonb_build_object(
        'produtoId', coalesce(produto_id, ref_id),
        'produtoNome', produto_nome,
        'quantidadeMovimentada', coalesce(payload->>'quantidade', payload->>'qtd'),
        'tipoMovimentacao', coalesce(payload->>'tipo', payload->>'motivo'),
        'estoqueAtual', coalesce(produto_payload->>'quantidadeEstoque', produto_payload->>'estoque', produto_payload->>'quantidade'),
        'estoqueMinimo', coalesce(produto_payload->>'estoqueMinimo', produto_payload->>'minimo')
      ));
    end if;

    quantidade := public.numeric_or_null(coalesce(
      payload->>'quantidadeEstoque',
      payload->>'estoqueAtual',
      payload->>'estoque',
      payload->>'saldo',
      payload->>'quantidade',
      produto_payload->>'quantidadeEstoque',
      produto_payload->>'estoque',
      produto_payload->>'quantidade'
    ));
    estoque_minimo := public.numeric_or_null(coalesce(payload->>'estoqueMinimo', payload->>'minimo', produto_payload->>'estoqueMinimo', produto_payload->>'minimo'));
    if quantidade is not null and estoque_minimo is not null and quantidade <= estoque_minimo then
      perform public.upsert_admin_notification(
        'auto_estoque_baixo_' || coalesce(produto_id, ref_id),
        'estoque',
        'Estoque baixo',
        public.text_or_dash(coalesce(produto_nome, produto_id, ref_id)) || ' está com estoque baixo: ' || quantidade::text || ' em estoque, mínimo configurado ' || estoque_minimo::text || '.',
        '/estoque',
        payload,
        jsonb_build_object('tabela', tg_table_name, 'icone', 'inventory', 'prioridade', 'alta', 'acao', 'Repor estoque', 'motivo', 'Estoque atual menor ou igual ao mínimo')
      );
    end if;
  end if;

  if tg_table_name = 'pagamentos' and (tg_op = 'INSERT' or status_atual is distinct from status_anterior) then
    valor_ref := public.text_or_dash(coalesce(payload->>'valor', payload->>'valorPago', payload->>'total'));
    perform public.upsert_admin_notification(
      'auto_pagamento_' || ref_id || '_' || coalesce(status_atual, 'novo'),
      'pagamento',
      'Pagamento ' || public.text_or_dash(status_atual),
      'Pagamento de R$ ' || valor_ref || ' para ' || public.text_or_dash(coalesce(cliente_nome, payload->>'pagadorNome')) || '.',
      '/financeiro',
      payload,
      jsonb_build_object('tabela', tg_table_name, 'icone', 'payments')
    );
  end if;

  if tg_table_name = 'atendimentos' and (tg_op = 'INSERT' or status_atual is distinct from status_anterior) then
    perform public.upsert_admin_notification(
      'auto_atendimento_' || ref_id || '_' || coalesce(status_atual, 'novo'),
      'atendimento',
      'Atendimento ' || public.text_or_dash(status_atual),
      'Atendimento de ' || public.text_or_dash(coalesce(cliente_nome, cliente_id)) ||
        case when servico_nome is not null then ' para ' || servico_nome else '' end || ' atualizado.',
      '/atendimentos',
      payload,
      jsonb_build_object('tabela', tg_table_name, 'icone', 'content_cut')
    );

    if status_atual in ('finalizado', 'concluido', 'concluído') then
      perform public.upsert_cliente_notification(
        'auto_cliente_atendimento_finalizado_' || ref_id,
      cliente_id,
      'atendimento',
      'Atendimento finalizado',
      'Seu atendimento' || case when servico_nome is not null then ' de ' || servico_nome else '' end || ' foi finalizado. Obrigado pela preferência!',
        '/cliente/historico',
        payload,
        jsonb_build_object('tabela', tg_table_name, 'icone', 'check_circle')
      );
    end if;
  end if;

  if tg_table_name = 'respostas_anamnese' and tg_op = 'INSERT' then
    perform public.upsert_admin_notification(
      'auto_anamnese_respondida_' || ref_id,
      'anamnese',
      'Anamnese respondida',
      public.text_or_dash(coalesce(cliente_nome, cliente_id)) || ' respondeu uma anamnese.',
      '/anamnese/respostas',
      payload,
      jsonb_build_object('tabela', tg_table_name, 'icone', 'assignment_turned_in')
    );
  end if;

  if tg_table_name = 'pontuacao' and tg_op = 'INSERT' then
    perform public.upsert_admin_notification(
      'auto_pontuacao_' || ref_id,
      'pontos',
      case when coalesce(payload->>'tipo', 'credito') = 'debito' then 'Pontos utilizados' else 'Pontos ganhos' end,
      public.text_or_dash(coalesce(cliente_nome, cliente_id)) || ' teve movimentação de ' ||
        public.text_or_dash(coalesce(payload->>'quantidade', payload->>'pontos')) || ' pontos: ' ||
        public.text_or_dash(payload->>'motivo') || '.',
      '/fidelidade/gerenciar',
      payload,
      jsonb_build_object('tabela', tg_table_name, 'icone', 'star')
    );

    perform public.upsert_cliente_notification(
      'auto_cliente_pontos_' || ref_id,
      cliente_id,
      'pontos',
      case when coalesce(payload->>'tipo', 'credito') = 'debito' then 'Pontos utilizados' else 'Pontos ganhos' end,
      'Movimentação de ' || public.text_or_dash(coalesce(payload->>'quantidade', payload->>'pontos')) ||
        ' pontos para ' || public.text_or_dash(coalesce(cliente_nome, cliente_id)) || ': ' || public.text_or_dash(payload->>'motivo') || '.',
      '/cliente/pontos',
      payload,
      jsonb_build_object('tabela', tg_table_name, 'icone', 'star')
    );
  end if;

  if tg_table_name = 'resgates_fidelidade' and tg_op = 'INSERT' then
    perform public.upsert_admin_notification(
      'auto_resgate_' || ref_id,
      'resgate',
      'Resgate realizado',
      public.text_or_dash(coalesce(cliente_nome, cliente_id)) || ' resgatou ' ||
        public.text_or_dash(coalesce(recompensa_nome, recompensa_id)) || '.',
      '/fidelidade/gerenciar?tab=resgates',
      payload,
      jsonb_build_object('tabela', tg_table_name, 'icone', 'redeem')
    );

    perform public.upsert_cliente_notification(
      'auto_cliente_resgate_' || ref_id,
      cliente_id,
      'resgate',
      'Resgate realizado',
      'Você resgatou ' || public.text_or_dash(coalesce(recompensa_nome, recompensa_id)) || '.',
      '/cliente/recompensas',
      payload,
      jsonb_build_object('tabela', tg_table_name, 'icone', 'redeem')
    );
  end if;

  return new;
end;
$$ language plpgsql;

create or replace function public.install_app_notification_trigger(
  p_table_name text,
  p_trigger_name text,
  p_events text
)
returns void as $$
begin
  if to_regclass(format('public.%I', p_table_name)) is null then
    raise notice 'Tabela public.% não existe; trigger de notificação não instalado.', p_table_name;
    return;
  end if;

  execute format('drop trigger if exists %I on public.%I', p_trigger_name, p_table_name);
  execute format(
    'create trigger %I after %s on public.%I for each row execute function public.handle_app_notification_events()',
    p_trigger_name,
    p_events,
    p_table_name
  );
end;
$$ language plpgsql;

select public.install_app_notification_trigger('agendamentos', 'agendamentos_auto_notificacoes', 'insert or update');
select public.install_app_notification_trigger('clientes', 'clientes_auto_notificacoes', 'insert');
select public.install_app_notification_trigger('produtos', 'produtos_auto_notificacoes', 'insert or update');
select public.install_app_notification_trigger('movimentacoes_estoque', 'movimentacoes_estoque_auto_notificacoes', 'insert');
select public.install_app_notification_trigger('pagamentos', 'pagamentos_auto_notificacoes', 'insert or update');
select public.install_app_notification_trigger('atendimentos', 'atendimentos_auto_notificacoes', 'insert or update');
select public.install_app_notification_trigger('respostas_anamnese', 'respostas_anamnese_auto_notificacoes', 'insert');
select public.install_app_notification_trigger('pontuacao', 'pontuacao_auto_notificacoes', 'insert');
select public.install_app_notification_trigger('resgates_fidelidade', 'resgates_fidelidade_auto_notificacoes', 'insert');

notify pgrst, 'reload schema';
