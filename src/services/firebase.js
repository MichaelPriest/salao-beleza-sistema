// src/services/firebase.js
// Camada de compatibilidade: o antigo código chamava este módulo de "firebase",
// mas todas as operações agora usam Supabase (REST + Auth REST API).

const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || 'https://kvjrerxqwtrxttiiqkgf.supabase.co').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9mLVarTs_RJIO26978SX5Q_uMtcfYzW';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_KEY || SUPABASE_PUBLISHABLE_KEY;

const AUTH_STORAGE_KEY = 'supabase.auth.session';
const ACCESS_TOKEN_KEY = 'supabase.access_token';
const SUPABASE_DOCUMENTS_TABLE = process.env.REACT_APP_SUPABASE_DOCUMENTS_TABLE || 'registros';
const SUPABASE_USE_COLLECTION_TABLES = true; // FORÇANDO usar tabelas diretas
const DEFAULT_CONFIRM_REDIRECT_PATH = process.env.REACT_APP_SUPABASE_CONFIRM_REDIRECT_PATH || '/cliente/login';
const DEFAULT_RESET_REDIRECT_PATH = process.env.REACT_APP_SUPABASE_RESET_REDIRECT_PATH || '/cliente/recuperar-senha';
const TENANT_STORAGE_KEY = 'saas.empresaAtual';
const UNIT_STORAGE_KEY = 'saas.unidadeAtual';

const ensureSupabaseConfig = () => {
  if (!SUPABASE_URL) {
    throw new Error('REACT_APP_SUPABASE_URL não configurado.');
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error('REACT_APP_SUPABASE_PUBLISHABLE_KEY não configurado. Configure a chave publishable/anon do projeto Supabase.');
  }
};

const TENANT_SCOPED_COLLECTIONS = new Set([
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
  'contas_pagar',
  'contas_receber',
  'cupons',
  'disponibilidades',
  'entradas',
  'formularios_anamnese',
  'fornecedores',
  'historico_precos_produtos',
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
  'unidades',
  'usos_cupons',
  'usuarios',
  'assinaturas',
  'faturas_saas',
  'pagamentos_saas',
  'convites_saas',
  'uso_saas',
  'eventos_cobranca_saas'
]);

const UNIT_SCOPED_COLLECTIONS = new Set([
  'agendamentos',
  'atendimentos',
  'ausencias',
  'caixa',
  'campanhas',
  'categorias_produtos',
  'clientes',
  'comissoes',
  'compras',
  'contas_pagar',
  'contas_receber',
  'disponibilidades',
  'avaliacoes',
  'cupons',
  'entradas',
  'itens_venda',
  'fornecedores',
  'historico_precos_produtos',
  'movimentacoes_estoque',
  'orcamentos',
  'pagamentos',
  'produtos',
  'profissionais',
  'servicos',
  'transacoes'
]);

const PLATFORM_ROLES = ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'];
const PLATFORM_ONLY_COLLECTIONS = new Set(['configuracoes_saas', 'webhooks_cobranca_saas']);
const TENANT_ROOT_COLLECTIONS = new Set(['empresas']);

const safeLocalStorage = {
  getItem: (key) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  setItem: (key, value) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  }
};

const getStoredSession = () => {
  try {
    return JSON.parse(safeLocalStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch (error) {
    console.warn('Sessão Supabase inválida no localStorage:', error);
    return null;
  }
};

const setStoredSession = (session) => {
  if (session) {
    safeLocalStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    safeLocalStorage.setItem(ACCESS_TOKEN_KEY, session.access_token || '');
  } else {
    safeLocalStorage.removeItem(AUTH_STORAGE_KEY);
    safeLocalStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  notifyAuthListeners(session?.user || null);
};

const authListeners = new Set();
const notifyAuthListeners = (user) => {
  authListeners.forEach((callback) => callback(user));
};

const getAccessToken = () => getStoredSession()?.access_token || safeLocalStorage.getItem(ACCESS_TOKEN_KEY) || SUPABASE_ANON_KEY;

const decodeJwtPayload = (token) => {
  try {
    if (!token || token.split('.').length < 2) return null;
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = typeof atob === 'function'
      ? atob(payload)
      : Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

const isJwtExpiredOrExpiring = (token, skewSeconds = 60) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
};

const refreshStoredSession = async () => {
  const session = getStoredSession();
  const refreshToken = session?.refresh_token;

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const text = await response.text();
    const refreshedSession = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(refreshedSession?.message || refreshedSession?.error_description || refreshedSession?.error || response.statusText);
    }

    const mergedSession = {
      ...session,
      ...refreshedSession,
      user: refreshedSession?.user || session.user || null
    };

    setStoredSession(mergedSession);
    return mergedSession;
  } catch (error) {
    console.warn('Sessão Supabase expirada e refresh falhou. Limpando sessão local:', error);
    setStoredSession(null);
    return null;
  }
};

const getValidAccessToken = async () => {
  const session = getStoredSession();
  const token = session?.access_token || safeLocalStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token || token === SUPABASE_ANON_KEY) {
    return SUPABASE_ANON_KEY;
  }

  if (!isJwtExpiredOrExpiring(token)) {
    return token;
  }

  const refreshedSession = await refreshStoredSession();
  return refreshedSession?.access_token || SUPABASE_ANON_KEY;
};

const getRedirectUrl = (path) => {
  if (typeof window === 'undefined') return undefined;
  return new URL(path, window.location.origin).toString();
};

const appendRedirectTo = (endpoint, redirectTo) => {
  if (!redirectTo) return endpoint;
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}redirect_to=${encodeURIComponent(redirectTo)}`;
};

const buildSessionFromUrl = () => {
  if (typeof window === 'undefined') return null;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const searchParams = new URLSearchParams(window.location.search);
  const accessToken = hashParams.get('access_token') || searchParams.get('access_token');

  if (!accessToken) return null;

  return {
    access_token: accessToken,
    refresh_token: hashParams.get('refresh_token') || searchParams.get('refresh_token'),
    token_type: hashParams.get('token_type') || searchParams.get('token_type') || 'bearer',
    expires_in: Number(hashParams.get('expires_in') || searchParams.get('expires_in') || 3600),
    expires_at: Math.floor(Date.now() / 1000) + Number(hashParams.get('expires_in') || searchParams.get('expires_in') || 3600),
    type: hashParams.get('type') || searchParams.get('type'),
    user: null
  };
};

const clearAuthParamsFromUrl = () => {
  if (typeof window === 'undefined') return;
  const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.search.replace(/[?&](access_token|refresh_token|token_type|expires_in|type)=[^&]*/g, '').replace(/^&/, '?')}`;
  window.history.replaceState({}, document.title, cleanUrl.replace(/[?&]$/, ''));
};

const supabaseFetch = async (path, options = {}) => {
  ensureSupabaseConfig();

  const request = async (authorizationToken) => {
    const fullUrl = `${SUPABASE_URL}${path}`;
    console.log('🌐 Supabase Fetch:', fullUrl);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authorizationToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(options.headers || {})
      }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    
    if (!response.ok) {
      console.error('❌ Supabase error:', response.status, data);
    }
    
    return { response, data };
  };

  const explicitAuthorization = options.headers?.Authorization;
  const initialToken = options.useAnonOnly || explicitAuthorization
    ? SUPABASE_ANON_KEY
    : await getValidAccessToken();

  let { response, data } = await request(initialToken);

  const message = data?.message || data?.msg || data?.error_description || data?.error || response.statusText;
  const jwtExpired = response.status === 401 && String(message || '').toLowerCase().includes('jwt expired');

  if (jwtExpired && !options.useAnonOnly && !explicitAuthorization) {
    console.log('🔄 Token expirado, tentando refresh...');
    const refreshedSession = await refreshStoredSession();
    const retryToken = refreshedSession?.access_token || SUPABASE_ANON_KEY;
    ({ response, data } = await request(retryToken));
  }

  if (!response.ok) {
    const retryMessage = data?.message || data?.msg || data?.error_description || data?.error || response.statusText;
    const error = new Error(retryMessage);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
};

const sanitizeForSupabase = (value) => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(sanitizeForSupabase);
  if (typeof value === 'object') {
    if (typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
      return new Date(value.seconds * 1000 + Math.floor(value.nanoseconds / 1000000)).toISOString();
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeForSupabase(item)]));
  }
  return value;
};

export const getTenantContext = () => {
  try {
    const empresa = JSON.parse(safeLocalStorage.getItem(TENANT_STORAGE_KEY) || 'null');
    const unidade = JSON.parse(safeLocalStorage.getItem(UNIT_STORAGE_KEY) || 'null');
    return {
      empresaId: empresa?.id || empresa?.empresaId || null,
      empresa,
      unidadeId: unidade?.id || unidade?.unidadeId || null,
      unidade
    };
  } catch (error) {
    return { empresaId: null, empresa: null, unidadeId: null, unidade: null };
  }
};

export const setTenantContext = ({ empresaId, empresa, unidadeId, unidade } = {}) => {
  const empresaContext = empresa || (empresaId ? { id: empresaId } : null);
  const hasUnitSelection = Boolean(unidade || unidadeId);
  const unidadeContext = unidade || (unidadeId ? { id: unidadeId, empresaId: empresaContext?.id || empresaId } : null);

  if (empresaContext) {
    safeLocalStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(empresaContext));
  }

  // Quando a unidade vem vazia/nula, o contexto passa a representar "todas as unidades".
  // Isso remove a unidade anterior para que coleções por unidade sejam filtradas apenas por empresa.
  if (hasUnitSelection && unidadeContext) {
    safeLocalStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(unidadeContext));
  } else {
    safeLocalStorage.removeItem(UNIT_STORAGE_KEY);
  }

  return getTenantContext();
};

export const clearTenantContext = () => {
  safeLocalStorage.removeItem(TENANT_STORAGE_KEY);
  safeLocalStorage.removeItem(UNIT_STORAGE_KEY);
};

export const setTenantContextFromUser = (usuario = {}) => {
  if (!usuario?.empresaId && !usuario?.empresa?.id) return getTenantContext();
  return setTenantContext({
    empresaId: usuario.empresaId || usuario.empresa?.id,
    empresa: usuario.empresa || (usuario.empresaId ? { id: usuario.empresaId, nome: usuario.empresaNome } : null),
    unidadeId: usuario.unidadeId || usuario.unidade?.id,
    unidade: usuario.unidade || (usuario.unidadeId ? { id: usuario.unidadeId, nome: usuario.unidadeNome, empresaId: usuario.empresaId } : null)
  });
};

const getLocalUsuario = () => {
  try {
    return JSON.parse(safeLocalStorage.getItem('usuario') || 'null');
  } catch (error) {
    return null;
  }
};

const hasPlatformAdminRole = (usuario = getLocalUsuario()) => Boolean(
  usuario?.isSaasAdmin ||
  usuario?.adminSaas ||
  usuario?.tipoUsuario === 'saas_admin' ||
  usuario?.tipoUsuario === 'plataforma' ||
  PLATFORM_ROLES.includes(usuario?.cargo) ||
  PLATFORM_ROLES.includes(usuario?.role) ||
  usuario?.permissoes?.includes('admin_saas')
);

const isPlatformArea = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/saas-admin') || window.location.pathname.startsWith('/selecionar-empresa');
};

const isActingAsTenantAdmin = () => {
  const usuario = getLocalUsuario();
  return Boolean(hasPlatformAdminRole(usuario) && usuario?.tenantAssumidoPorSuperadmin && getTenantContext().empresaId && !isPlatformArea());
};

const isPlatformAdmin = () => hasPlatformAdminRole() && !isActingAsTenantAdmin();

const getNoTenantCondition = () => ({ field: 'empresaId', operator: '==', value: '__tenant_nao_selecionado__' });
const isTenantScopedCollection = (collectionName) => TENANT_SCOPED_COLLECTIONS.has(collectionName);
const isUnitScopedCollection = (collectionName) => UNIT_SCOPED_COLLECTIONS.has(collectionName);
const isPlatformOnlyCollection = (collectionName) => PLATFORM_ONLY_COLLECTIONS.has(collectionName);
const isTenantRootCollection = (collectionName) => TENANT_ROOT_COLLECTIONS.has(collectionName);
const hasCondition = (conditions = [], field) => conditions.some((condition) => condition.field === field);

const assertPlatformWriteAccess = (collectionName) => {
  if (isPlatformOnlyCollection(collectionName) && !isPlatformAdmin()) {
    throw new Error('Acesso restrito ao administrador SaaS da plataforma.');
  }
};

const getTenantConditions = (collectionName) => {
  if (!isTenantScopedCollection(collectionName) || isPlatformAdmin()) return [];

  const { empresaId, unidadeId } = getTenantContext();
  const conditions = [];

  if (!empresaId) return [getNoTenantCondition()];

  conditions.push({ field: 'empresaId', operator: '==', value: empresaId });

  if (unidadeId && isUnitScopedCollection(collectionName)) {
    conditions.push({ field: 'unidadeId', operator: '==', value: unidadeId });
  }

  return conditions;
};

const mergeTenantConditions = (collectionName, conditions = []) => {
  if (isPlatformAdmin()) return conditions;

  if (isTenantRootCollection(collectionName)) {
    const { empresaId } = getTenantContext();
    if (hasCondition(conditions, 'slug')) return conditions;
    if (!empresaId) return [...conditions.filter((condition) => condition.field !== 'id'), { field: 'id', operator: '==', value: '__tenant_nao_selecionado__' }];
    return [
      ...conditions.filter((condition) => condition.field !== 'id'),
      { field: 'id', operator: '==', value: empresaId }
    ];
  }

  if (!isTenantScopedCollection(collectionName)) return conditions;

  if (collectionName === 'usuarios' && hasCondition(conditions, 'email')) {
    return conditions;
  }

  const { empresaId, unidadeId } = getTenantContext();
  const conditionsWithoutTenant = conditions.filter((condition) => condition.field !== 'empresaId' && condition.field !== 'unidadeId');

  if (!empresaId) return [...conditionsWithoutTenant, getNoTenantCondition()];

  const scopedConditions = [
    ...conditionsWithoutTenant,
    { field: 'empresaId', operator: '==', value: empresaId }
  ];

  if (unidadeId && isUnitScopedCollection(collectionName)) {
    scopedConditions.push({ field: 'unidadeId', operator: '==', value: unidadeId });
  }

  return scopedConditions;
};

const NOTIFICATION_COLLECTIONS = new Set(['notificacoes', 'notificacoes_cliente']);

const normalizeNotificationData = (collectionName, data = {}) => {
  if (!NOTIFICATION_COLLECTIONS.has(collectionName)) return data;

  const agora = new Date().toISOString();
  const tenant = getTenantContext();
  const detalhes = data.detalhes || data.dados || {};
  const usuarioId = data.usuarioId || data.userId || data.destinatarioId || (collectionName === 'notificacoes_cliente' ? data.clienteId : null);
  const clienteId = data.clienteId || (collectionName === 'notificacoes_cliente' ? usuarioId : null);

  return {
    tipo: data.tipo || 'info',
    titulo: data.titulo || 'Notificação',
    mensagem: data.mensagem || data.descricao || '',
    link: data.link || (collectionName === 'notificacoes_cliente' ? '/cliente/notificacoes' : '/notificacoes'),
    prioridade: data.prioridade || 'media',
    ...data,
    usuarioId,
    ...(clienteId ? { clienteId } : {}),
    lida: Boolean(data.lida),
    data: data.data || data.createdAt || agora,
    createdAt: data.createdAt || data.data || agora,
    updatedAt: data.updatedAt || agora,
    detalhes,
    empresaId: data.empresaId || detalhes.empresaId || tenant.empresaId || null,
    empresaNome: data.empresaNome || detalhes.empresaNome || tenant.empresa?.nome || '',
    unidadeId: data.unidadeId || detalhes.unidadeId || tenant.unidadeId || null,
    unidadeNome: data.unidadeNome || detalhes.unidadeNome || tenant.unidade?.nome || '',
  };
};

const applyTenantMetadata = (collectionName, data = {}) => {
  data = normalizeNotificationData(collectionName, data);
  if (!isTenantScopedCollection(collectionName) || isPlatformAdmin()) return data;

  const { empresaId, unidadeId } = getTenantContext();
  const scopedData = { ...data };

  if (!empresaId) {
    throw new Error(`Tenant não selecionado para gravar em ${collectionName}.`);
  }

  if (!scopedData.empresaId) {
    scopedData.empresaId = empresaId;
  }

  if (scopedData.empresaId !== empresaId) {
    throw new Error(`Operação bloqueada: ${collectionName} pertence a outra empresa.`);
  }

  if (unidadeId && isUnitScopedCollection(collectionName) && !scopedData.unidadeId) {
    scopedData.unidadeId = unidadeId;
  }

  if (unidadeId && isUnitScopedCollection(collectionName) && scopedData.unidadeId !== unidadeId) {
    throw new Error(`Operação bloqueada: ${collectionName} pertence a outra unidade.`);
  }

  return scopedData;
};

const isDocumentVisibleInTenant = (collectionName, data) => {
  if (!data || isPlatformAdmin()) return Boolean(data);

  const { empresaId, unidadeId } = getTenantContext();

  if (isTenantRootCollection(collectionName)) {
    return Boolean(empresaId && data.id === empresaId);
  }

  if (!isTenantScopedCollection(collectionName)) return true;
  if (!empresaId) return false;
  if (!data.empresaId || data.empresaId !== empresaId) return false;
  if (unidadeId && isUnitScopedCollection(collectionName) && data.unidadeId && data.unidadeId !== unidadeId) return false;

  return true;
};

const canReadDocumentByIdWithoutTenant = (collectionName, id) => {
  const sessionUserId = getStoredSession()?.user?.id;
  return collectionName === 'usuarios' && sessionUserId && id === sessionUserId;
};

const assertTenantRootWrite = (collectionName, id, data = {}) => {
  if (!isTenantRootCollection(collectionName) || isPlatformAdmin()) return;
  const { empresaId } = getTenantContext();
  const targetId = id || data?.id;
  if (!empresaId) {
    throw new Error('Tenant não selecionado para alterar empresa.');
  }
  if (targetId && targetId !== empresaId) {
    throw new Error('Operação bloqueada: empresa fora do tenant atual.');
  }
};

const encodeFilterValue = (value) => encodeURIComponent(value instanceof Date ? value.toISOString() : value);

const operatorMap = {
  '==': 'eq',
  '===': 'eq',
  '!=': 'neq',
  '<>': 'neq',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte',
  arrayContains: 'cs',
  'array-contains': 'cs',
  in: 'in',
  like: 'like',
  ilike: 'ilike'
};

// FUNÇÃO CORRIGIDA - buildQueryString
const buildQueryString = (collectionName, conditions = [], orderByField = null, { jsonData = true } = {}) => {
  const params = new URLSearchParams();
  params.append('select', '*');
  
  console.log('🔨 buildQueryString - conditions:', JSON.stringify(conditions));
  
  conditions
    .filter(({ field, value }) => field && value !== undefined && value !== null)
    .forEach(({ field, operator = '==', value }) => {
      const supabaseOperator = operatorMap[operator] || operator;
      const filterField = jsonData ? `data->>${field}` : field;
      
      if (supabaseOperator === 'in' && Array.isArray(value)) {
        params.append(filterField, `in.(${value.map(encodeFilterValue).join(',')})`);
      } else if (supabaseOperator === 'cs') {
        params.append(jsonData ? `data->${field}` : field, `cs.${JSON.stringify(Array.isArray(value) ? value : [value])}`);
      } else {
        params.append(filterField, `${supabaseOperator}.${encodeFilterValue(value)}`);
      }
    });

  if (orderByField) {
    params.append('order', jsonData ? `data->>${orderByField}` : orderByField);
  }
  
  const queryString = params.toString();
  console.log('🔨 buildQueryString - output:', queryString);
  
  return queryString;
};

const isSchemaCacheColumnError = (error) => {
  const message = String(error?.message || error?.details?.message || error?.details?.hint || '');
  return /schema cache|column/i.test(message) && /data|document_id/i.test(message);
};

const toDocument = (row) => {
  if (!row) return null;
  if (Object.prototype.hasOwnProperty.call(row, 'data') || Object.prototype.hasOwnProperty.call(row, 'document_id')) {
    return { id: row.document_id || row.data?.id, ...(row.data || {}) };
  }
  return { id: row.id || row.document_id, ...row };
};

const toDocuments = (rows = []) => rows.map(toDocument).filter(Boolean);

const authRequest = (endpoint, body, options = {}) => supabaseFetch(`/auth/v1/${endpoint}`, {
  method: 'POST',
  body: JSON.stringify(body),
  useAnonOnly: true,
  ...options
});

const toAuthUser = (user) => user ? {
  ...user,
  uid: user.id,
  email: user.email
} : null;

export const supabaseConfig = {
  url: SUPABASE_URL,
  hasPublishableKey: Boolean(SUPABASE_ANON_KEY),
  documentsTable: SUPABASE_DOCUMENTS_TABLE,
  useCollectionTables: true
};

export const supabase = {
  from: (table) => ({
    select: async () => ({ data: await firebaseService.getAll(table), error: null }),
    insert: async (data) => ({ data: [await firebaseService.add(table, Array.isArray(data) ? data[0] : data)], error: null }),
    update: (data) => ({
      eq: async (field, value) => {
        if (field !== 'id') throw new Error('Compatibilidade Supabase: update().eq() suporta apenas o campo id.');
        return { data: [await firebaseService.update(table, value, data)], error: null };
      }
    }),
    delete: () => ({
      eq: async (field, value) => {
        if (field !== 'id') throw new Error('Compatibilidade Supabase: delete().eq() suporta apenas o campo id.');
        await firebaseService.delete(table, value);
        return { data: null, error: null };
      }
    })
  }),
  auth: {
    signInWithPassword: async ({ email, password }) => {
      const result = await signInWithEmailAndPassword(null, email, password);
      return { data: { user: result.user, session: getStoredSession() }, error: null };
    },
    signUp: async ({ email, password, options }) => {
      const result = await createUserWithEmailAndPassword(null, email, password, options?.data);
      return { data: { user: result.user, session: getStoredSession() }, error: null };
    },
    signOut: async () => {
      await signOut();
      return { error: null };
    },
    getUser: async () => ({ data: { user: toAuthUser(getStoredSession()?.user) }, error: null }),
    resetPasswordForEmail: async (email) => {
      await sendPasswordResetEmail(null, email);
      return { error: null };
    },
    updateUser: async ({ password }) => ({ data: { user: await updatePassword(null, password) }, error: null })
  }
};

export class SupabaseTimestamp {
  constructor(date = new Date()) {
    this.date = date instanceof Date ? date : new Date(date);
    this.seconds = Math.floor(this.date.getTime() / 1000);
    this.nanoseconds = (this.date.getTime() % 1000) * 1000000;
  }

  toDate() {
    return this.date;
  }

  toMillis() {
    return this.date.getTime();
  }

  toJSON() {
    return this.date.toISOString();
  }

  toString() {
    return this.date.toISOString();
  }

  static now() {
    return new SupabaseTimestamp();
  }

  static fromDate(date) {
    return new SupabaseTimestamp(date);
  }
}

export const Timestamp = SupabaseTimestamp;

export const db = { provider: 'supabase', url: SUPABASE_URL };
export const auth = {
  provider: 'supabase',
  signOut: () => signOut()
};

export const getAuth = () => auth;

export const signInWithEmailAndPassword = async (_auth, email, password) => {
  const session = await authRequest('token?grant_type=password', { email, password });
  setStoredSession(session);
  return { user: toAuthUser(session.user) };
};

export const createUserWithEmailAndPassword = async (_auth, email, password, metadata = {}) => {
  const redirectTo = getRedirectUrl(DEFAULT_CONFIRM_REDIRECT_PATH);
  const session = await authRequest(appendRedirectTo('signup', redirectTo), { email, password, data: metadata });
  if (session?.access_token) {
    setStoredSession(session);
  }
  return { user: toAuthUser(session.user) };
};

export const createAuthUserWithoutSession = async (email, password, metadata = {}) => {
  const redirectTo = getRedirectUrl(DEFAULT_CONFIRM_REDIRECT_PATH);
  const session = await authRequest(appendRedirectTo('signup', redirectTo), { email, password, data: metadata });
  const user = session?.user || (session?.id && session?.email ? session : null);
  return { user: toAuthUser(user), session };
};

export const signOut = async () => {
  try {
    const token = getStoredSession()?.access_token;
    if (token) {
      await supabaseFetch('/auth/v1/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    }
  } catch (error) {
    console.warn('Erro ao encerrar sessão no Supabase, limpando sessão local:', error);
  } finally {
    setStoredSession(null);
  }
};

export const getCurrentAuthUser = async () => {
  const token = await getValidAccessToken();
  if (!token || token === SUPABASE_ANON_KEY) return null;
  const user = await supabaseFetch('/auth/v1/user', {
    method: 'GET'
  });
  const session = getStoredSession();
  if (session) {
    setStoredSession({ ...session, user });
  }
  return toAuthUser(user);
};

export const consumeSupabaseAuthRedirect = async () => {
  const sessionFromUrl = buildSessionFromUrl();
  if (!sessionFromUrl) return getStoredSession();

  setStoredSession(sessionFromUrl);
  try {
    if (sessionFromUrl.type && typeof window !== 'undefined') {
      window.sessionStorage.setItem('supabase.auth.redirect_type', sessionFromUrl.type);
    }
    const user = await getCurrentAuthUser();
    const hydratedSession = { ...getStoredSession(), user };
    setStoredSession(hydratedSession);
    return hydratedSession;
  } finally {
    clearAuthParamsFromUrl();
  }
};

export const onAuthStateChanged = (_auth, callback) => {
  const listener = (user) => callback(toAuthUser(user));
  authListeners.add(listener);
  setTimeout(async () => {
    const session = await consumeSupabaseAuthRedirect().catch((error) => {
      console.error('Erro ao processar retorno de autenticação Supabase:', error);
      return getStoredSession();
    });
    listener(session?.user || null);
  }, 0);
  return () => authListeners.delete(listener);
};

export const sendPasswordResetEmail = async (_auth, email, actionCodeSettings = {}) => {
  const redirectTo = actionCodeSettings.url || getRedirectUrl(DEFAULT_RESET_REDIRECT_PATH);
  await authRequest(appendRedirectTo('recover', redirectTo), { email });
};

export const updatePassword = async (_auth, novaSenha) => {
  const token = await getValidAccessToken();
  if (!token || token === SUPABASE_ANON_KEY) throw new Error('Link de redefinição inválido ou expirado. Solicite um novo email de recuperação.');
  const user = await supabaseFetch('/auth/v1/user', {
    method: 'PUT',
    body: JSON.stringify({ password: novaSenha })
  });
  const session = getStoredSession();
  if (session) setStoredSession({ ...session, user });
  return toAuthUser(user);
};

export class GoogleAuthProvider {
  constructor() {
    this.providerId = 'google';
  }
}

export const signInWithPopup = async (_auth, provider) => {
  const redirectTo = encodeURIComponent(window.location.href);
  window.location.assign(`${SUPABASE_URL}/auth/v1/authorize?provider=${provider?.providerId || 'google'}&redirect_to=${redirectTo}`);
  return new Promise(() => {});
};

export const collection = (_db, collectionName) => ({ collectionName });
export const doc = (collectionOrDb, collectionNameOrId, maybeId) => {
  if (maybeId === undefined) {
    return { collectionName: collectionOrDb.collectionName, id: collectionNameOrId || crypto.randomUUID() };
  }
  return { collectionName: collectionNameOrId, id: maybeId || crypto.randomUUID() };
};

export const getDoc = async (docRef) => {
  const data = await firebaseService.getById(docRef.collectionName, docRef.id);
  return {
    id: docRef.id,
    exists: () => Boolean(data),
    data: () => data ? Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'id')) : undefined
  };
};

export const setDoc = async (docRef, data, options = {}) => {
  if (options.merge) {
    return firebaseService.set(docRef.collectionName, docRef.id, data);
  }
  return firebaseService.set(docRef.collectionName, docRef.id, data);
};

export const getDocs = async (collectionRef) => {
  const data = await firebaseService.getAll(collectionRef.collectionName);
  return {
    docs: data.map((item) => ({ id: item.id, data: () => Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'id')) }))
  };
};

export const deleteDoc = async (docRef) => firebaseService.delete(docRef.collectionName, docRef.id);

export const writeBatch = () => {
  const operations = [];
  return {
    set: (docRef, data) => operations.push(() => setDoc(docRef, data, { merge: true })),
    update: (docRef, data) => operations.push(() => firebaseService.update(docRef.collectionName, docRef.id, data)),
    delete: (docRef) => operations.push(() => deleteDoc(docRef)),
    commit: async () => Promise.all(operations.map((operation) => operation()))
  };
};

export const firebaseService = {
  getAll: async (collectionName) => {
    try {
      if (isTenantRootCollection(collectionName) && !isPlatformAdmin()) {
        const { empresaId } = getTenantContext();
        if (!empresaId) return [];
        const empresa = await firebaseService.getById(collectionName, empresaId);
        return empresa ? [empresa] : [];
      }
      const tenantConditions = getTenantConditions(collectionName);
      const queryString = buildQueryString(collectionName, tenantConditions);
      let result;
      try {
        result = await supabaseFetch(`/rest/v1/${collectionName}?${queryString}`);
      } catch (wrapperError) {
        if (!isSchemaCacheColumnError(wrapperError)) throw wrapperError;
        const directQueryString = buildQueryString(collectionName, tenantConditions, null, { jsonData: false });
        result = await supabaseFetch(`/rest/v1/${collectionName}?${directQueryString}`);
      }
      return toDocuments(result);
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  getById: async (collectionName, id) => {
    try {
      let documentData = null;
      try {
        const rows = await supabaseFetch(`/rest/v1/${collectionName}?document_id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
        documentData = toDocument(rows?.[0]) || null;
        if (!documentData) {
          const rowsByAuth = await supabaseFetch(`/rest/v1/${collectionName}?data->>authUid=eq.${encodeURIComponent(id)}&select=*&limit=1`);
          documentData = toDocument(rowsByAuth?.[0]) || null;
        }
        if (!documentData) {
          const rowsByGoogle = await supabaseFetch(`/rest/v1/${collectionName}?data->>googleUid=eq.${encodeURIComponent(id)}&select=*&limit=1`);
          documentData = toDocument(rowsByGoogle?.[0]) || null;
        }
      } catch (wrapperError) {
        if (!isSchemaCacheColumnError(wrapperError)) throw wrapperError;
        const rows = await supabaseFetch(`/rest/v1/${collectionName}?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
        documentData = toDocument(rows?.[0]) || null;
        if (!documentData) {
          const rowsByAuth = await supabaseFetch(`/rest/v1/${collectionName}?authUid=eq.${encodeURIComponent(id)}&select=*&limit=1`);
          documentData = toDocument(rowsByAuth?.[0]) || null;
        }
        if (!documentData) {
          const rowsByGoogle = await supabaseFetch(`/rest/v1/${collectionName}?googleUid=eq.${encodeURIComponent(id)}&select=*&limit=1`);
          documentData = toDocument(rowsByGoogle?.[0]) || null;
        }
      }
      
      if (canReadDocumentByIdWithoutTenant(collectionName, id)) return documentData;
      return isDocumentVisibleInTenant(collectionName, documentData) ? documentData : null;
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName} por ID no Supabase:`, error);
      throw error;
    }
  },

  add: async (collectionName, data) => {
    try {
      assertPlatformWriteAccess(collectionName);
      const documentId = data?.id || crypto.randomUUID();
      assertTenantRootWrite(collectionName, documentId, data);
      const tenantData = applyTenantMetadata(collectionName, data);
      const documentData = sanitizeForSupabase({
        ...tenantData,
        id: documentId,
        createdAt: tenantData?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      try {
        const rows = await supabaseFetch(`/rest/v1/${collectionName}`, {
          method: 'POST',
          body: JSON.stringify({ document_id: documentId, data: documentData })
        });
        return toDocument(rows?.[0]) || { id: documentId, ...documentData };
      } catch (wrapperError) {
        if (!isSchemaCacheColumnError(wrapperError)) throw wrapperError;
        const rows = await supabaseFetch(`/rest/v1/${collectionName}`, {
          method: 'POST',
          body: JSON.stringify(documentData)
        });
        return toDocument(rows?.[0]) || { id: documentId, ...documentData };
      }
    } catch (error) {
      console.error(`Erro ao adicionar em ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  set: async (collectionName, id, data) => {
    try {
      assertPlatformWriteAccess(collectionName);
      assertTenantRootWrite(collectionName, id, data);
      const current = await firebaseService.getById(collectionName, id).catch(() => null);
      const tenantData = applyTenantMetadata(collectionName, data);
      const documentData = sanitizeForSupabase({
        ...(current || {}),
        ...tenantData,
        id,
        createdAt: current?.createdAt || tenantData?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      try {
        const rows = await supabaseFetch(`/rest/v1/${collectionName}?on_conflict=document_id`, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({ document_id: id, data: documentData })
        });
        return toDocument(rows?.[0]) || { id, ...documentData };
      } catch (wrapperError) {
        if (!isSchemaCacheColumnError(wrapperError)) throw wrapperError;
        const rows = await supabaseFetch(`/rest/v1/${collectionName}?on_conflict=id`, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(documentData)
        });
        return toDocument(rows?.[0]) || { id, ...documentData };
      }
    } catch (error) {
      console.error(`Erro ao salvar em ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  update: async (collectionName, id, data) => {
    try {
      assertPlatformWriteAccess(collectionName);
      assertTenantRootWrite(collectionName, id, data);
      const current = await firebaseService.getById(collectionName, id).catch(() => null);
      if (!current && (isTenantScopedCollection(collectionName) || isTenantRootCollection(collectionName)) && !isPlatformAdmin()) {
        throw new Error(`Documento ${collectionName}/${id} fora do tenant atual ou inexistente.`);
      }
      const tenantData = applyTenantMetadata(collectionName, data);
      const documentData = sanitizeForSupabase({
        ...(current || {}),
        ...tenantData,
        id,
        createdAt: current?.createdAt || tenantData?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      try {
        const rows = await supabaseFetch(`/rest/v1/${collectionName}?on_conflict=document_id`, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({ document_id: id, data: documentData })
        });
        return toDocument(rows?.[0]) || { id, ...documentData };
      } catch (wrapperError) {
        if (!isSchemaCacheColumnError(wrapperError)) throw wrapperError;
        const rows = await supabaseFetch(`/rest/v1/${collectionName}?on_conflict=id`, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(documentData)
        });
        return toDocument(rows?.[0]) || { id, ...documentData };
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  delete: async (collectionName, id) => {
    try {
      assertPlatformWriteAccess(collectionName);
      const current = await firebaseService.getById(collectionName, id).catch(() => null);
      if (!current && (isTenantScopedCollection(collectionName) || isTenantRootCollection(collectionName)) && !isPlatformAdmin()) {
        throw new Error(`Documento ${collectionName}/${id} fora do tenant atual ou inexistente.`);
      }
      try {
        await supabaseFetch(`/rest/v1/${collectionName}?document_id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch (wrapperError) {
        if (!isSchemaCacheColumnError(wrapperError)) throw wrapperError;
        await supabaseFetch(`/rest/v1/${collectionName}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      }
      return id;
    } catch (error) {
      console.error(`Erro ao excluir de ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  query: async (collectionName, conditions = [], orderByField = null) => {
    try {
      console.log('🔍 firebaseService.query - Entrada:', { collectionName, conditions, orderByField });
      
      const scopedConditions = mergeTenantConditions(collectionName, conditions);
      console.log('🔍 Condições com tenant:', JSON.stringify(scopedConditions));
      
      const queryString = buildQueryString(collectionName, scopedConditions, orderByField);
      const url = `/rest/v1/${collectionName}?${queryString}`;
      console.log('🔍 URL:', url);
      
      let result;
      try {
        result = await supabaseFetch(url);
      } catch (wrapperError) {
        if (!isSchemaCacheColumnError(wrapperError)) throw wrapperError;
        const directQueryString = buildQueryString(collectionName, scopedConditions, orderByField, { jsonData: false });
        result = await supabaseFetch(`/rest/v1/${collectionName}?${directQueryString}`);
      }
      const documents = toDocuments(result);
      
      console.log('✅ firebaseService.query - Resultado:', documents.length, 'documentos');
      return documents;
    } catch (error) {
      console.error(`Erro na query de ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  generateId: () => crypto.randomUUID(),

  log: async (nivel, mensagem, dados = {}) => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      let usuario = null;
      try {
        usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      } catch (e) {
        // Ignora erro de parsing
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

      await firebaseService.add('logs', logData).catch(err => {
        console.warn('Erro ao salvar log no Supabase:', err);
      });

      const cor = {
        info: '#2196f3',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        debug: '#9c27b0'
      }[nivel] || '#666';

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
