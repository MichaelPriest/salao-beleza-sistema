-- Schema base do Salão (Supabase/PostgreSQL)
-- Execute no SQL Editor do Supabase

create extension if not exists "pgcrypto";

-- helper trigger de updatedAt
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

-- =====================================================
-- Tabelas principais
-- =====================================================
create table if not exists public.clientes (
  id text primary key,
  nome text,
  email text,
  telefone text,
  cpf text,
  "googleUid" text,
  status text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data jsonb default '{}'::jsonb
);

create table if not exists public.usuarios (
  id text primary key,
  uid text,
  nome text,
  email text,
  cargo text,
  status text,
  permissoes jsonb default '[]'::jsonb,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data jsonb default '{}'::jsonb
);

create table if not exists public.profissionais (
  id text primary key,
  nome text,
  email text,
  telefone text,
  status text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data jsonb default '{}'::jsonb
);

create table if not exists public.servicos (
  id text primary key,
  nome text,
  categoria text,
  preco numeric,
  duracao integer,
  ativo boolean default true,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data jsonb default '{}'::jsonb
);

create table if not exists public.agendamentos (
  id text primary key,
  "clienteId" text,
  "profissionalId" text,
  "servicoId" text,
  data date,
  horario text,
  status text,
  observacoes text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data_extra jsonb default '{}'::jsonb
);

create table if not exists public.atendimentos (
  id text primary key,
  "agendamentoId" text,
  "clienteId" text,
  "profissionalId" text,
  "servicoId" text,
  status text,
  valor numeric,
  data timestamptz,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data_extra jsonb default '{}'::jsonb
);

create table if not exists public.disponibilidades (
  id text primary key,
  "profissionalId" text,
  data date,
  horario text,
  status text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data_extra jsonb default '{}'::jsonb
);

create table if not exists public.ausencias (
  id text primary key,
  "profissionalId" text,
  "dataInicio" timestamptz,
  "dataFim" timestamptz,
  motivo text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data_extra jsonb default '{}'::jsonb
);

-- =====================================================
-- Financeiro / estoque / fidelidade
-- =====================================================
create table if not exists public.comissoes (id text primary key, "profissionalId" text, "atendimentoId" text, valor numeric, status text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data jsonb default '{}'::jsonb);
create table if not exists public.pagamentos (id text primary key, "clienteId" text, valor numeric, metodo text, data timestamptz, status text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.produtos (id text primary key, nome text, categoria text, estoque numeric, preco numeric, ativo boolean default true, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data jsonb default '{}'::jsonb);
create table if not exists public.categorias_produtos (id text primary key, nome text, descricao text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data jsonb default '{}'::jsonb);
create table if not exists public.entradas (id text primary key, "produtoId" text, quantidade numeric, valor numeric, data timestamptz, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.fornecedores (id text primary key, nome text, email text, telefone text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data jsonb default '{}'::jsonb);
create table if not exists public.compras (id text primary key, "fornecedorId" text, valor numeric, data timestamptz, status text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.movimentacoes_estoque (id text primary key, "produtoId" text, tipo text, quantidade numeric, data timestamptz, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.transacoes (id text primary key, tipo text, valor numeric, data timestamptz, descricao text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.caixa (id text primary key, data date, saldo numeric, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.contas_pagar (id text primary key, descricao text, valor numeric, vencimento date, status text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.contas_receber (id text primary key, descricao text, valor numeric, vencimento date, status text, "clienteId" text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);

create table if not exists public.pontuacao (id text primary key, "clienteId" text, pontos numeric, origem text, data timestamptz, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.resgates_fidelidade (id text primary key, "clienteId" text, "recompensaId" text, pontos numeric, status text, data timestamptz, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);
create table if not exists public.config_fidelidade (id text primary key, nome text, ativo boolean default true, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data jsonb default '{}'::jsonb);
create table if not exists public.recompensas (id text primary key, nome text, descricao text, pontos numeric, ativo boolean default true, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data jsonb default '{}'::jsonb);

create table if not exists public.indicacoes (id text primary key, "clienteId" text, "indicadoId" text, status text, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data jsonb default '{}'::jsonb);
create table if not exists public.cupons (id text primary key, codigo text unique, tipo text, valor numeric, ativo boolean default true, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data jsonb default '{}'::jsonb);
create table if not exists public.usos_cupons (id text primary key, "cupomId" text, "clienteId" text, "atendimentoId" text, data timestamptz, valor numeric, "createdAt" timestamptz default now(), "updatedAt" timestamptz default now(), data_extra jsonb default '{}'::jsonb);

-- =====================================================
-- Auditoria / logs / notificações
-- =====================================================
create table if not exists public.auditoria (
  id text primary key,
  acao text,
  usuario text,
  "usuarioId" text,
  "usuarioEmail" text,
  "usuarioCargo" text,
  ip text,
  data timestamptz,
  entidade text,
  "entidadeId" text,
  detalhes text,
  dados jsonb default '{}'::jsonb,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table if not exists public.logs (
  id text primary key,
  nivel text,
  mensagem text,
  "usuarioId" text,
  "usuarioNome" text,
  timestamp timestamptz,
  data timestamptz,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  dados jsonb default '{}'::jsonb
);

create table if not exists public.notificacoes (
  id text primary key,
  "usuarioId" text,
  titulo text,
  mensagem text,
  tipo text,
  lida boolean default false,
  data timestamptz,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  detalhes jsonb default '{}'::jsonb
);

create table if not exists public.notificacoes_cliente (
  id text primary key,
  "clienteId" text,
  titulo text,
  mensagem text,
  tipo text,
  lida boolean default false,
  data timestamptz,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  detalhes jsonb default '{}'::jsonb
);

create table if not exists public.backups (
  id text primary key,
  "dataBackup" timestamptz,
  versao text,
  "totalRegistros" integer,
  "criadoPor" text,
  dados jsonb default '{}'::jsonb,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table if not exists public.configuracoes (
  id text primary key,
  chave text,
  valor jsonb,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  data jsonb default '{}'::jsonb
);

-- Trigger updatedAt para todas tabelas criadas
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'clientes','usuarios','profissionais','servicos','agendamentos','atendimentos','disponibilidades','ausencias',
        'comissoes','pagamentos','produtos','categorias_produtos','entradas','fornecedores','compras','movimentacoes_estoque',
        'transacoes','caixa','contas_pagar','contas_receber','pontuacao','resgates_fidelidade','config_fidelidade','recompensas',
        'indicacoes','cupons','usos_cupons','auditoria','logs','notificacoes','notificacoes_cliente','backups','configuracoes'
      )
  LOOP
    EXECUTE format('drop trigger if exists trg_touch_updated_at on public.%I;', t.tablename);
    EXECUTE format('create trigger trg_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at();', t.tablename);
  END LOOP;
END $$;
