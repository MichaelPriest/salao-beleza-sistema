// src/services/firebase.js
import { Timestamp } from './timestamp';

const supabaseMode = process.env.REACT_APP_SUPABASE_MODE || 'preview';
const isProductionMode = supabaseMode === 'production';
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || (isProductionMode ? '' : 'https://egfxmxezuzzttgqjdlef.supabase.co');
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || (isProductionMode ? '' : 'sb_publishable_O626uQ_eaF6kgXzbJhyFBQ_kARzsZNi');
const enableRpcSchemaBootstrap = process.env.REACT_APP_SUPABASE_ENABLE_RPC_SCHEMA === 'true';
const enableTelemetryWrites = process.env.REACT_APP_SUPABASE_ENABLE_TELEMETRY_WRITES === 'true';
const shouldSkipTelemetryWrites = supabaseMode === 'preview' && !enableTelemetryWrites;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuração Supabase inválida: defina REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY.');
}

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
  const legacyAliases = {
    profissionalid: 'profissionalId',
    createdat: 'createdAt',
    updatedat: 'updatedAt',
    usuarioid: 'usuarioId',
    usuarionome: 'usuarioNome'
  };

  Object.entries(legacyAliases).forEach(([source, target]) => {
    if (normalized[source] !== undefined && normalized[target] === undefined) {
      normalized[target] = normalized[source];
    }
  });

  Object.entries(normalized).forEach(([key, value]) => {
    if (key.includes('_')) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (normalized[camelKey] === undefined) {
        normalized[camelKey] = value;
      }
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      normalized[key] = Timestamp.fromDate(new Date(value));
      if (key.includes('_')) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        normalized[camelKey] = normalized[key];
      }
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
  const asSnakeField = (rawField) => String(rawField || '').trim().replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  const params = new URLSearchParams();
  params.set('select', '*');

  if (singleId !== null && singleId !== undefined) {
    params.set('id', `eq.${singleId}`);
  }

  conditions
    .filter(({ value }) => value !== undefined && value !== null)
    .forEach(({ field, operator = '==', value }) => {
      const normalizedField = typeof field === 'string' ? asSnakeField(field) : field;

      if (operator === 'in') {
        const values = Array.isArray(value) ? value : [value];
        const formattedValues = values
          .map((item) => (typeof item === 'string' ? `"${item.replace(/"/g, '\\"')}"` : item))
          .join(',');
        params.set(normalizedField, `in.(${formattedValues})`);
        return;
      }

      if (operator === 'contains') {
        params.set(normalizedField, `cs.${JSON.stringify(value)}`);
        return;
      }

      if (operator === 'array-contains') {
        const arrayValue = Array.isArray(value) ? value : [value];
        params.set(normalizedField, `cs.${JSON.stringify(arrayValue)}`);
        return;
      }

      const op = opMap[operator] || 'eq';
      params.set(normalizedField, `${op}.${value}`);
    });

  if (orderByField) {
    params.set('order', `${asSnakeField(orderByField)}.asc`);
  }

  return params.toString();
};

const normalizeCollectionName = (collectionName = '') => String(collectionName || '').trim().toLowerCase();
const assertCollectionName = (collectionName = '') => {
  if (!collectionName) {
    throw new Error('Nome da coleção/tabela inválido.');
  }
};


const isMissingTableError = (error) => {
  const msg = String(error?.details?.message || error?.details?.msg || error?.message || '');
  return error?.status === 404 || msg.includes('Could not find the table') || msg.includes('schema cache');
};


const extractMissingColumn = (error) => {
  const msg = String(error?.details?.message || error?.details?.msg || error?.message || '');
  const postgrestMatch = msg.match(/Could not find the '([^']+)' column/);
  if (postgrestMatch) return postgrestMatch[1];

  const pgColumnMatch = msg.match(/column "([^"]+)" does not exist/i);
  if (pgColumnMatch) return pgColumnMatch[1];

  const triggerMatch = msg.match(/record "new" has no field "([^"]+)"/i);
  if (triggerMatch) return triggerMatch[1];

  return null;
};


const isNullIdConstraint = (error) => {
  const msg = String(error?.details?.message || error?.details?.msg || error?.message || '');
  return msg.includes('null value in column "id"');
};

const extractNullConstraintColumn = (error) => {
  const msg = String(error?.details?.message || error?.details?.msg || error?.message || '');
  const match = msg.match(/null value in column "([^"]+)"/i);
  return match ? match[1] : null;
};

const requiredColumnDefaults = {
  pontos_necessarios: 0
};

let sqlRpcAvailable = enableRpcSchemaBootstrap;
const sqlEnsureCache = new Set();

const tryExecuteSql = async (sql, { force = false } = {}) => {
  if (!sqlRpcAvailable && !force) return false;

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

const ensureTableAndColumn = async (tableName, columnName = null, options = {}) => {
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

  const tableOk = await tryExecuteSql(tableSql, options);
  if (!tableOk) return false;

  if (columnName) {
    const isTimestampColumn = ['createdAt', 'updatedAt', 'createdat', 'updatedat', 'timestamp', 'data']
      .includes(String(columnName));
    const columnType = isTimestampColumn ? 'timestamptz' : 'text';
    const columnSql = `
      alter table public."${tableName}"
      add column if not exists "${columnName}" ${columnType};
    `;
    const columnOk = await tryExecuteSql(columnSql, options);
    if (!columnOk) return false;
  }

  sqlEnsureCache.add(cacheKey);
  return true;
};

const missingColumnsCache = new Map();
const writeErrorCount = new Map();
const writeDisabledTables = new Set();
const immediateDisableTables = new Set(['logs', 'auditoria']);

const shouldDisableWrite = (error) => [400, 401, 403].includes(error?.status);

const registerWriteError = (tableName, error) => {
  if (!shouldDisableWrite(error)) return false;

  const next = (writeErrorCount.get(tableName) || 0) + 1;
  writeErrorCount.set(tableName, next);
  const disableAfter = immediateDisableTables.has(tableName) ? 1 : 3;

  if (next >= disableAfter) {
    writeDisabledTables.add(tableName);
    console.warn(`⚠️ Escritas desativadas para tabela ${tableName} após ${next} erros HTTP ${error.status}.`);
    return true;
  }

  return false;
};

const requestWithColumnFallback = async (tableName, makeCall, initialPayload) => {
  const cachedColumns = missingColumnsCache.get(tableName) || new Set();
  let payload = { ...initialPayload };

  cachedColumns.forEach((column) => {
    if (column in payload) delete payload[column];
  });

  const removedColumns = new Set();
  const ensuredMissingColumns = new Set();

  while (true) {
    try {
      return await makeCall(payload);
    } catch (error) {
      const missingColumn = extractMissingColumn(error);

      if (!missingColumn) {
        throw error;
      }

      if (!(missingColumn in payload)) {
        if (!ensuredMissingColumns.has(missingColumn)) {
          ensuredMissingColumns.add(missingColumn);
          const forceRpc = ['updatedAt', 'createdAt', 'updatedat', 'createdat'].includes(missingColumn);
          const ensured = await ensureTableAndColumn(tableName, missingColumn, { force: forceRpc });
          if (ensured) {
            console.warn(`⚠️ Coluna ${tableName}.${missingColumn} criada para compatibilidade de trigger/query.`);
            continue;
          }
        }
        throw error;
      }

      if (removedColumns.has(missingColumn)) {
        throw error;
      }

      const remapCandidates = toFieldCandidates(missingColumn);
      const remapTarget = remapCandidates.find((candidate) => candidate !== missingColumn && !(candidate in payload));
      if (remapTarget) {
        const { [missingColumn]: remapValue, ...nextPayload } = payload;
        payload = { ...nextPayload, [remapTarget]: remapValue };
        console.warn(`⚠️ Campo ajustado automaticamente no payload: ${missingColumn} -> ${remapTarget}.`);
        continue;
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

const remapQueryField = (conditions = [], orderByField = null, sourceField, targetField) => {
  const nextConditions = conditions.map((condition) => (
    condition.field === sourceField ? { ...condition, field: targetField } : condition
  ));
  const nextOrderByField = orderByField === sourceField ? targetField : orderByField;
  return { nextConditions, nextOrderByField };
};

const normalizeFieldName = (field = '') => String(field).replace(/_/g, '').toLowerCase();
const toSnakeCase = (field = '') => String(field).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const toFieldCandidates = (field = '') => {
  const snake = toSnakeCase(field).toLowerCase();
  const lower = String(field).toLowerCase();
  return [...new Set([snake, lower])].filter(Boolean);
};

const tablePayloadAliases = {
  disponibilidades: {
    profissionalId: 'profissional_id'
  },
  agendamentos: {
    updatedAt: 'updatedat',
    createdAt: 'createdat',
    servicoId: 'servicoid'
  },
  formularios_anamnese: {
    servicoIds: 'servico_ids'
  }
};

const normalizePayloadForTable = (tableName, payload = {}) => {
  const aliases = tablePayloadAliases[tableName];
  if (!aliases) return payload;

  const normalized = { ...payload };
  Object.entries(aliases).forEach(([source, target]) => {
    if (normalized[source] !== undefined && normalized[target] === undefined) {
      normalized[target] = normalized[source];
      delete normalized[source];
    }
  });

  return normalized;
};

const normalizeConditionsForTable = (tableName, conditions = []) => {
  const aliases = tablePayloadAliases[tableName];
  if (!aliases) return conditions;
  return conditions.map((condition) => {
    const mappedField = aliases[condition.field] || condition.field;
    return mappedField === condition.field ? condition : { ...condition, field: mappedField };
  });
};

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: {
        ...baseHeaders,
        ...(options.headers || {})
      }
    });
  } catch (networkError) {
    const error = new Error(`Falha de rede ao comunicar com Supabase: ${networkError?.message || 'erro desconhecido'}`);
    error.status = 0;
    error.details = networkError;
    throw error;
  }

  let body = null;
  try {
    body = await response.json();
  } catch (_e) {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(body?.message || body?.msg || 'Erro ao comunicar com Supabase');
    error.details = body;
    error.status = response.status;
    throw error;
  }

  return body;
};

export const firebaseService = {
  getAll: async (collectionName) => {
    const tableName = normalizeCollectionName(collectionName);
    assertCollectionName(tableName);
    try {
      const query = buildQueryString();
      const data = await request(`${tableName}?${query}`, { method: 'GET' });
      return (data || []).map(normalizeRow);
    } catch (error) {
      if (isMissingTableError(error)) {
        console.warn(`⚠️ Tabela ausente no Supabase: ${tableName}. Retornando lista vazia.`);
        return [];
      }
      throw error;
    }
  },

  getById: async (collectionName, id) => {
    const tableName = normalizeCollectionName(collectionName);
    assertCollectionName(tableName);
    try {
      const query = buildQueryString([], null, id);
      const data = await request(`${tableName}?${query}`, {
        method: 'GET',
        headers: { Accept: 'application/vnd.pgrst.object+json' }
      }).catch(() => null);

      return data ? normalizeRow(data) : null;
    } catch (error) {
      if (isMissingTableError(error)) {
        console.warn(`⚠️ Tabela ausente no Supabase: ${tableName}. Retornando null.`);
        return null;
      }
      throw error;
    }
  },

  add: async (collectionName, data) => {
    const tableName = normalizeCollectionName(collectionName);
    assertCollectionName(tableName);
    const fallbackId = data?.id || firebaseService.generateId();
    const payload = normalizePayloadForTable(
      tableName,
      preparePayload({ ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() })
    );

    if (shouldSkipTelemetryWrites && immediateDisableTables.has(tableName)) {
      return fallbackId;
    }

    if (writeDisabledTables.has(tableName)) {
      return fallbackId;
    }

    try {
      const inserted = await requestWithColumnFallback(
        tableName,
        (safePayload) => request(tableName, { method: 'POST', body: JSON.stringify(safePayload) }),
        payload
      );
      return inserted?.[0]?.id || fallbackId;
    } catch (error) {
      if (isMissingTableError(error)) {
        const ensured = await ensureTableAndColumn(tableName);
        if (ensured) {
          const inserted = await requestWithColumnFallback(
            tableName,
            (safePayload) => request(tableName, { method: 'POST', body: JSON.stringify(safePayload) }),
            { ...payload, id: payload.id || fallbackId }
          );
          return inserted?.[0]?.id || fallbackId;
        }
        console.warn(`⚠️ Tabela ausente no Supabase: ${tableName}. Insert ignorado.`);
        return fallbackId;
      }

      if (isNullIdConstraint(error)) {
        const payloadComId = { ...payload, id: fallbackId };
        const inserted = await requestWithColumnFallback(
          tableName,
          (safePayload) => request(tableName, { method: 'POST', body: JSON.stringify(safePayload) }),
          payloadComId
        );
        return inserted?.[0]?.id || fallbackId;
      }

      const nullColumn = extractNullConstraintColumn(error);
      if (nullColumn && requiredColumnDefaults[nullColumn] !== undefined) {
        const payloadWithDefault = { ...payload, [nullColumn]: requiredColumnDefaults[nullColumn] };
        const inserted = await requestWithColumnFallback(
          tableName,
          (safePayload) => request(tableName, { method: 'POST', body: JSON.stringify(safePayload) }),
          payloadWithDefault
        );
        console.warn(`⚠️ Constraint tratada automaticamente: preenchido ${nullColumn} com valor padrão.`);
        return inserted?.[0]?.id || fallbackId;
      }

      const disabled = registerWriteError(tableName, error);
      if (disabled || writeDisabledTables.has(tableName)) {
        console.warn(`⚠️ Insert ignorado para ${tableName} após falhas recorrentes de escrita.`);
        return fallbackId;
      }
      throw error;
    }
  },

  set: async (collectionName, id, data) => {
    const tableName = normalizeCollectionName(collectionName);
    assertCollectionName(tableName);
    const payload = normalizePayloadForTable(
      tableName,
      preparePayload({ id, ...data, updatedAt: Timestamp.now(), createdAt: data?.createdAt || Timestamp.now() })
    );

    if (writeDisabledTables.has(tableName)) {
      return id;
    }

    try {
      const upserted = await requestWithColumnFallback(
        tableName,
        (safePayload) => request(tableName, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(safePayload)
        }),
        payload
      );
      return upserted?.[0]?.id || id;
    } catch (error) {
      if (isMissingTableError(error)) {
        const ensured = await ensureTableAndColumn(tableName);
        if (ensured) {
          const upserted = await requestWithColumnFallback(
            tableName,
            (safePayload) => request(tableName, {
              method: 'POST',
              headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
              body: JSON.stringify(safePayload)
            }),
            payload
          );
          return upserted?.[0]?.id || id;
        }
        console.warn(`⚠️ Tabela ausente no Supabase: ${tableName}. Upsert ignorado.`);
        return id;
      }

      const nullColumn = extractNullConstraintColumn(error);
      if (nullColumn && requiredColumnDefaults[nullColumn] !== undefined) {
        const payloadWithDefault = { ...payload, [nullColumn]: requiredColumnDefaults[nullColumn] };
        const upserted = await requestWithColumnFallback(
          tableName,
          (safePayload) => request(tableName, {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify(safePayload)
          }),
          payloadWithDefault
        );
        console.warn(`⚠️ Constraint tratada automaticamente: preenchido ${nullColumn} com valor padrão.`);
        return upserted?.[0]?.id || id;
      }

      const disabled = registerWriteError(tableName, error);
      if (disabled || writeDisabledTables.has(tableName)) {
        console.warn(`⚠️ Upsert ignorado para ${tableName} após falhas recorrentes de escrita.`);
        return id;
      }
      throw error;
    }
  },

  update: async (collectionName, id, data) => {
    const tableName = normalizeCollectionName(collectionName);
    assertCollectionName(tableName);
    const payload = normalizePayloadForTable(tableName, preparePayload({ ...data, updatedAt: Timestamp.now() }));

    if (writeDisabledTables.has(tableName)) {
      return id;
    }

    try {
      await requestWithColumnFallback(
        tableName,
        (safePayload) => request(`${tableName}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(safePayload) }),
        payload
      );
      return id;
    } catch (error) {
      const errorMessage = String(error?.details?.message || error?.details?.msg || error?.message || '');
      if (tableName === 'agendamentos' && errorMessage.includes('record "new" has no field "updatedAt"')) {
        const ensured = await ensureTableAndColumn(tableName, 'updatedAt', { force: true });
        if (ensured) {
          const retryPayload = { ...payload, updatedAt: new Date().toISOString() };
          await requestWithColumnFallback(
            tableName,
            (safePayload) => request(`${tableName}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(safePayload) }),
            retryPayload
          );
          return id;
        }
      }

      if (isMissingTableError(error)) {
        const ensured = await ensureTableAndColumn(tableName);
        if (ensured) {
          await requestWithColumnFallback(
            tableName,
            (safePayload) => request(`${tableName}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(safePayload) }),
            payload
          );
          return id;
        }
        console.warn(`⚠️ Tabela ausente no Supabase: ${tableName}. Update ignorado.`);
        return id;
      }

      const nullColumn = extractNullConstraintColumn(error);
      if (nullColumn && requiredColumnDefaults[nullColumn] !== undefined) {
        const payloadWithDefault = { ...payload, [nullColumn]: requiredColumnDefaults[nullColumn] };
        await requestWithColumnFallback(
          tableName,
          (safePayload) => request(`${tableName}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(safePayload) }),
          payloadWithDefault
        );
        console.warn(`⚠️ Constraint tratada automaticamente: preenchido ${nullColumn} com valor padrão.`);
        return id;
      }

      const disabled = registerWriteError(tableName, error);
      if (disabled || writeDisabledTables.has(tableName)) {
        console.warn(`⚠️ Update ignorado para ${tableName} após falhas recorrentes de escrita.`);
        return id;
      }
      throw error;
    }
  },

  delete: async (collectionName, id) => {
    const tableName = normalizeCollectionName(collectionName);
    assertCollectionName(tableName);
    if (writeDisabledTables.has(tableName)) {
      return id;
    }

    try {
      await request(`${tableName}?id=eq.${id}`, { method: 'DELETE' });
      return id;
    } catch (error) {
      if (isMissingTableError(error)) {
        const ensured = await ensureTableAndColumn(tableName);
        if (ensured) {
          await request(`${tableName}?id=eq.${id}`, { method: 'DELETE' });
          return id;
        }
        console.warn(`⚠️ Tabela ausente no Supabase: ${tableName}. Delete ignorado.`);
        return id;
      }
      const disabled = registerWriteError(tableName, error);
      if (disabled || writeDisabledTables.has(tableName)) {
        console.warn(`⚠️ Delete ignorado para ${tableName} após falhas recorrentes de escrita.`);
        return id;
      }
      throw error;
    }
  },

  query: async (collectionName, conditions = [], orderByField = null) => {
    const tableName = normalizeCollectionName(collectionName);
    assertCollectionName(tableName);
    const normalizedConditions = normalizeConditionsForTable(tableName, conditions);
    const normalizedOrderBy = (tablePayloadAliases[tableName] && tablePayloadAliases[tableName][orderByField])
      ? tablePayloadAliases[tableName][orderByField]
      : orderByField;
    try {
      const query = buildQueryString(normalizedConditions, normalizedOrderBy);
      const data = await request(`${tableName}?${query}`, { method: 'GET' });
      return (data || []).map(normalizeRow);
    } catch (error) {
      const missingColumn = extractMissingColumn(error);
      if (missingColumn) {
        const normalizedMissing = normalizeFieldName(missingColumn);
        const sourceCondition = normalizedConditions.find((c) => normalizeFieldName(c.field) === normalizedMissing);
        const sourceField = sourceCondition?.field
          || (normalizedOrderBy && normalizeFieldName(normalizedOrderBy) === normalizedMissing ? normalizedOrderBy : null);

        if (sourceField) {
          const retryTargets = sourceField === missingColumn ? toFieldCandidates(sourceField) : [missingColumn];

          for (const retryField of retryTargets) {
            if (!retryField || retryField === sourceField) continue;

            try {
              const { nextConditions, nextOrderByField } = remapQueryField(normalizedConditions, normalizedOrderBy, sourceField, retryField);
              const retriedQuery = buildQueryString(nextConditions, nextOrderByField);
              const retriedData = await request(`${tableName}?${retriedQuery}`, { method: 'GET' });
              console.warn(`⚠️ Campo de query ajustado automaticamente: ${sourceField} -> ${retryField}.`);
              return (retriedData || []).map(normalizeRow);
            } catch (retryError) {
              const retryMissingColumn = extractMissingColumn(retryError);
              if (!retryMissingColumn) {
                throw retryError;
              }
            }
          }
        }
      }

      if (isMissingTableError(error)) {
        console.warn(`⚠️ Tabela ausente no Supabase: ${tableName}. Retornando lista vazia.`);
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

      create table if not exists public.campanhas (
        id uuid primary key default gen_random_uuid(),
        nome text,
        descricao text,
        status text,
        data_inicio date,
        data_fim date,
        createdat timestamptz default now(),
        updatedat timestamptz default now()
      );

      create table if not exists public.modelos_anamnese (
        id uuid primary key default gen_random_uuid(),
        titulo text,
        descricao text,
        ativo boolean default true,
        createdat timestamptz default now(),
        updatedat timestamptz default now()
      );
    `;

    try {
      const ok = await tryExecuteSql(createTablesSql);
      if (!ok) {
        console.warn('⚠️ Bootstrap de schema via RPC desativado/indisponível. Execute o SQL manualmente no Supabase.');
        return false;
      }
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
