// src/services/firebase.js
import { Timestamp } from './timestamp';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://egfxmxezuzzttgqjdlef.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_O626uQ_eaF6kgXzbJhyFBQ_kARzsZNi';
const supabaseMode = process.env.REACT_APP_SUPABASE_MODE || 'preview';

export const db = { provider: 'supabase', url: supabaseUrl };
export const auth = { provider: 'supabase' };

console.info(`🟢 Supabase conectado em modo: ${supabaseMode}`);

const baseHeaders = {
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
};

const normalizeRow = (row) => {
  if (!row || typeof row !== 'object') return row;

  const normalized = { ...row };

  Object.entries(normalized).forEach(([key, value]) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      normalized[key] = Timestamp.fromDate(new Date(value));
    }
  });

  return normalized;
};

const preparePayload = (data = {}) => {
  const payload = { ...data };

  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof Timestamp) {
      payload[key] = value.toDate().toISOString();
    } else if (value && typeof value?.toDate === 'function') {
      payload[key] = value.toDate().toISOString();
    }
  });

  return payload;
};

const opMap = {
  '==': 'eq',
  '!=': 'neq',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte'
};

const buildQueryString = (conditions = [], orderByField = null, singleId = null) => {
  const params = new URLSearchParams();
  params.set('select', '*');

  if (singleId !== null && singleId !== undefined) {
    params.set('id', `eq.${singleId}`);
  }

  conditions
    .filter(({ value }) => value !== undefined && value !== null)
    .forEach(({ field, operator = '==', value }) => {
      if (operator === 'in') {
        const values = Array.isArray(value) ? value : [value];
        params.set(field, `in.(${values.join(',')})`);
        return;
      }

      if (operator === 'contains') {
        params.set(field, `cs.${JSON.stringify(value)}`);
        return;
      }

      const op = opMap[operator] || 'eq';
      params.set(field, `${op}.${value}`);
    });

  if (orderByField) {
    params.set('order', `${orderByField}.asc`);
  }

  return params.toString();
};


const isMissingTableError = (error) => {
  const msg = String(error?.details?.message || error?.details?.msg || error?.message || '');
  return msg.includes('Could not find the table') || msg.includes('schema cache');
};


const extractMissingColumn = (error) => {
  const msg = String(error?.details?.message || error?.details?.msg || error?.message || '');
  const match = msg.match(/Could not find the '([^']+)' column/);
  return match ? match[1] : null;
};


const isNullIdConstraint = (error) => {
  const msg = String(error?.details?.message || error?.details?.msg || error?.message || '');
  return msg.includes('null value in column "id"');
};

let sqlRpcAvailable = true;
const sqlEnsureCache = new Set();

const tryExecuteSql = async (sql) => {
  if (!sqlRpcAvailable) return false;

  const rpcAttempts = [
    { path: 'rpc/execute_sql', body: { sql } },
    { path: 'rpc/exec_sql', body: { sql } },
    { path: 'rpc/run_sql', body: { sql } },
    { path: 'rpc/execute_sql', body: { query: sql } },
    { path: 'rpc/exec_sql', body: { query: sql } },
    { path: 'rpc/run_sql', body: { query: sql } }
  ];

  let lastError = null;

  for (const attempt of rpcAttempts) {
    try {
      await request(attempt.path, {
        method: 'POST',
        body: JSON.stringify(attempt.body)
      });
      return true;
    } catch (error) {
      lastError = error;
    }
  }

  sqlRpcAvailable = false;
  console.warn('⚠️ Nenhuma RPC SQL compatível encontrada (execute_sql/exec_sql/run_sql).', lastError);
  return false;
};

const ensureTableAndColumn = async (tableName, columnName = null) => {
  const cacheKey = `${tableName}:${columnName || '*'}`;
  if (sqlEnsureCache.has(cacheKey)) return true;

  const tableSql = `
    create extension if not exists "pgcrypto";
    create table if not exists public."${tableName}" (
      "id" text primary key,
      "createdAt" timestamptz default now(),
      "updatedAt" timestamptz default now()
    );
  `;

  const tableOk = await tryExecuteSql(tableSql);
  if (!tableOk) return false;

  if (columnName) {
    const columnSql = `
      alter table public."${tableName}"
      add column if not exists "${columnName}" text;
    `;
    const columnOk = await tryExecuteSql(columnSql);
    if (!columnOk) return false;
  }

  sqlEnsureCache.add(cacheKey);
  return true;
};

const missingColumnsCache = new Map();

const requestWithColumnFallback = async (tableName, makeCall, initialPayload) => {
  const cachedColumns = missingColumnsCache.get(tableName) || new Set();
  let payload = { ...initialPayload };

  cachedColumns.forEach((column) => {
    if (column in payload) delete payload[column];
  });

  const removedColumns = new Set();

  while (true) {
    try {
      return await makeCall(payload);
    } catch (error) {
      const missingColumn = extractMissingColumn(error);

      if (!missingColumn || !(missingColumn in payload) || removedColumns.has(missingColumn)) {
        throw error;
      }

      const ensured = await ensureTableAndColumn(tableName, missingColumn);
      if (ensured) {
        console.log(`🛠️ Campo ${tableName}.${missingColumn} criado automaticamente.`);
        continue;
      }

      removedColumns.add(missingColumn);
      cachedColumns.add(missingColumn);
      missingColumnsCache.set(tableName, cachedColumns);
      const { [missingColumn]: _removed, ...nextPayload } = payload;
      payload = nextPayload;

      if (Object.keys(payload).length === 0) {
        throw error;
      }

      console.warn(`⚠️ Coluna ausente no schema (${missingColumn}). Repetindo requisição sem esse campo.`);
    }
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...baseHeaders,
      ...(options.headers || {})
    }
  });

  let body = null;
  try {
    body = await response.json();
  } catch (_e) {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(body?.message || body?.msg || 'Erro ao comunicar com Supabase');
    error.details = body;
    throw error;
  }

  return body;
};

export const firebaseService = {
  getAll: async (collectionName) => {
    try {
      const query = buildQueryString();
      const data = await request(`${collectionName}?${query}`, { method: 'GET' });
      return (data || []).map(normalizeRow);
    } catch (error) {
      if (isMissingTableError(error)) {
        console.warn(`⚠️ Tabela ausente no Supabase: ${collectionName}. Retornando lista vazia.`);
        return [];
      }
      throw error;
    }
  },

  getById: async (collectionName, id) => {
    try {
      const query = buildQueryString([], null, id);
      const data = await request(`${collectionName}?${query}`, {
        method: 'GET',
        headers: { Accept: 'application/vnd.pgrst.object+json' }
      }).catch(() => null);

      return data ? normalizeRow(data) : null;
    } catch (error) {
      if (isMissingTableError(error)) {
        console.warn(`⚠️ Tabela ausente no Supabase: ${collectionName}. Retornando null.`);
        return null;
      }
      throw error;
    }
  },

  add: async (collectionName, data) => {
    const fallbackId = data?.id || firebaseService.generateId();
    const payload = preparePayload({ ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });

    try {
      const inserted = await requestWithColumnFallback(
        collectionName,
        (safePayload) => request(collectionName, { method: 'POST', body: JSON.stringify(safePayload) }),
        payload
      );
      return inserted?.[0]?.id || fallbackId;
    } catch (error) {
      if (isMissingTableError(error)) {
        const ensured = await ensureTableAndColumn(collectionName);
        if (ensured) {
          const inserted = await requestWithColumnFallback(
            collectionName,
            (safePayload) => request(collectionName, { method: 'POST', body: JSON.stringify(safePayload) }),
            { ...payload, id: payload.id || fallbackId }
          );
          return inserted?.[0]?.id || fallbackId;
        }
        console.warn(`⚠️ Tabela ausente no Supabase: ${collectionName}. Insert ignorado.`);
        return fallbackId;
      }

      if (isNullIdConstraint(error)) {
        const payloadComId = { ...payload, id: fallbackId };
        const inserted = await requestWithColumnFallback(
          collectionName,
          (safePayload) => request(collectionName, { method: 'POST', body: JSON.stringify(safePayload) }),
          payloadComId
        );
        return inserted?.[0]?.id || fallbackId;
      }

      throw error;
    }
  },

  set: async (collectionName, id, data) => {
    const payload = preparePayload({ id, ...data, updatedAt: Timestamp.now(), createdAt: data?.createdAt || Timestamp.now() });

    try {
      const upserted = await requestWithColumnFallback(
        collectionName,
        (safePayload) => request(collectionName, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(safePayload)
        }),
        payload
      );
      return upserted?.[0]?.id || id;
    } catch (error) {
      if (isMissingTableError(error)) {
        const ensured = await ensureTableAndColumn(collectionName);
        if (ensured) {
          const upserted = await requestWithColumnFallback(
            collectionName,
            (safePayload) => request(collectionName, {
              method: 'POST',
              headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
              body: JSON.stringify(safePayload)
            }),
            payload
          );
          return upserted?.[0]?.id || id;
        }
        console.warn(`⚠️ Tabela ausente no Supabase: ${collectionName}. Upsert ignorado.`);
        return id;
      }
      throw error;
    }
  },

  update: async (collectionName, id, data) => {
    const payload = preparePayload({ ...data, updatedAt: Timestamp.now() });

    try {
      await requestWithColumnFallback(
        collectionName,
        (safePayload) => request(`${collectionName}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(safePayload) }),
        payload
      );
      return id;
    } catch (error) {
      if (isMissingTableError(error)) {
        const ensured = await ensureTableAndColumn(collectionName);
        if (ensured) {
          await requestWithColumnFallback(
            collectionName,
            (safePayload) => request(`${collectionName}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(safePayload) }),
            payload
          );
          return id;
        }
        console.warn(`⚠️ Tabela ausente no Supabase: ${collectionName}. Update ignorado.`);
        return id;
      }
      throw error;
    }
  },

  delete: async (collectionName, id) => {
    try {
      await request(`${collectionName}?id=eq.${id}`, { method: 'DELETE' });
      return id;
    } catch (error) {
      if (isMissingTableError(error)) {
        const ensured = await ensureTableAndColumn(collectionName);
        if (ensured) {
          await request(`${collectionName}?id=eq.${id}`, { method: 'DELETE' });
          return id;
        }
        console.warn(`⚠️ Tabela ausente no Supabase: ${collectionName}. Delete ignorado.`);
        return id;
      }
      throw error;
    }
  },

  query: async (collectionName, conditions = [], orderByField = null) => {
    try {
      const query = buildQueryString(conditions, orderByField);
      const data = await request(`${collectionName}?${query}`, { method: 'GET' });
      return (data || []).map(normalizeRow);
    } catch (error) {
      if (isMissingTableError(error)) {
        console.warn(`⚠️ Tabela ausente no Supabase: ${collectionName}. Retornando lista vazia.`);
        return [];
      }
      throw error;
    }
  },

  generateId: () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),


  ensureTables: async () => {
    const createTablesSql = `
      create extension if not exists "pgcrypto";

      create table if not exists public.clientes (
        id text primary key,
        nome text,
        email text,
        telefone text,
        cpf text,
        status text,
        createdat timestamptz default now(),
        updatedat timestamptz default now()
      );

      create table if not exists public.auditoria (
        id uuid primary key default gen_random_uuid(),
        acao text,
        usuario text,
        usuarioid text,
        detalhes text,
        data timestamptz default now(),
        createdat timestamptz default now(),
        updatedat timestamptz default now()
      );

      create table if not exists public.logs (
        id uuid primary key default gen_random_uuid(),
        nivel text,
        mensagem text,
        usuarioid text,
        usuarionome text,
        timestamp timestamptz default now(),
        data timestamptz default now(),
        createdat timestamptz default now(),
        updatedat timestamptz default now()
      );

      create table if not exists public.notificacoes (
        id uuid primary key default gen_random_uuid(),
        usuarioid text,
        titulo text,
        mensagem text,
        lida boolean default false,
        data timestamptz default now(),
        createdat timestamptz default now(),
        updatedat timestamptz default now()
      );

      create table if not exists public.disponibilidades (
        id uuid primary key default gen_random_uuid(),
        profissionalid text,
        data date,
        horario text,
        status text,
        createdat timestamptz default now(),
        updatedat timestamptz default now()
      );
    `;

    try {
      await request('rpc/execute_sql', {
        method: 'POST',
        body: JSON.stringify({ sql: createTablesSql })
      });
      console.log('✅ Tabelas base garantidas no Supabase');
      return true;
    } catch (error) {
      console.warn('⚠️ Não foi possível criar tabelas automaticamente (rpc/execute_sql indisponível). Execute o SQL manualmente no Supabase.', error);
      return false;
    }
  },

  log: async (nivel, mensagem, dados = {}) => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      let usuario = null;
      try {
        usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      } catch (_e) {
        usuario = null;
      }

      const logData = {
        nivel,
        mensagem,
        ...dados,
        usuarioId: usuario?.id || null,
        usuarioNome: usuario?.nome || 'Sistema',
        timestamp: new Date().toISOString(),
        data: Timestamp.now()
      };

      await firebaseService.add('logs', logData).catch((err) => {
        console.warn('Erro ao salvar log no Supabase:', err);
      });

      const cor = { info: '#2196f3', success: '#4caf50', warning: '#ff9800', error: '#f44336', debug: '#9c27b0' }[nivel] || '#666';
      console.log(`%c[${nivel.toUpperCase()}] ${mensagem}`, `color: ${cor}; font-weight: bold;`, dados);
      return true;
    } catch (error) {
      console.error('Erro ao registrar log:', error);
      return false;
    }
  },

  info: (mensagem, dados = {}) => firebaseService.log('info', mensagem, dados),
  success: (mensagem, dados = {}) => firebaseService.log('success', mensagem, dados),
  warning: (mensagem, dados = {}) => firebaseService.log('warning', mensagem, dados),
  error: (mensagem, dados = {}) => firebaseService.log('error', mensagem, dados),
  debug: (mensagem, dados = {}) => firebaseService.log('debug', mensagem, dados)
};

export default firebaseService;
