// src/services/firebase.js
// Camada de compatibilidade: o antigo código chamava este módulo de "firebase",
// mas todas as operações agora usam Supabase (REST + Auth REST API).

const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || 'https://kvjrerxqwtrxttiiqkgf.supabase.co').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9mLVarTs_RJIO26978SX5Q_uMtcfYzW';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_KEY || SUPABASE_PUBLISHABLE_KEY;

const AUTH_STORAGE_KEY = 'supabase.auth.session';
const ACCESS_TOKEN_KEY = 'supabase.access_token';
const SUPABASE_DOCUMENTS_TABLE = process.env.REACT_APP_SUPABASE_DOCUMENTS_TABLE || 'registros';
const DEFAULT_CONFIRM_REDIRECT_PATH = process.env.REACT_APP_SUPABASE_CONFIRM_REDIRECT_PATH || '/cliente/login';
const DEFAULT_RESET_REDIRECT_PATH = process.env.REACT_APP_SUPABASE_RESET_REDIRECT_PATH || '/cliente/recuperar-senha';

const ensureSupabaseConfig = () => {
  if (!SUPABASE_URL) {
    throw new Error('REACT_APP_SUPABASE_URL não configurado.');
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error('REACT_APP_SUPABASE_PUBLISHABLE_KEY não configurado. Configure a chave publishable/anon do projeto Supabase.');
  }
};

const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch (error) {
    console.warn('Sessão Supabase inválida no localStorage:', error);
    return null;
  }
};

const setStoredSession = (session) => {
  if (session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token || '');
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  notifyAuthListeners(session?.user || null);
};

const authListeners = new Set();
const notifyAuthListeners = (user) => {
  authListeners.forEach((callback) => callback(user));
};

const getAccessToken = () => getStoredSession()?.access_token || localStorage.getItem(ACCESS_TOKEN_KEY) || SUPABASE_ANON_KEY;

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
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${options.useAnonOnly ? SUPABASE_ANON_KEY : getAccessToken()}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.msg || data?.error_description || data?.error || response.statusText;
    const error = new Error(message);
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

const buildQueryString = (collectionName, conditions = [], orderByField = null) => {
  const params = new URLSearchParams({ select: '*' });
  params.append('collection', `eq.${collectionName}`);

  conditions
    .filter(({ field, value }) => field && value !== undefined && value !== null)
    .forEach(({ field, operator = '==', value }) => {
      const supabaseOperator = operatorMap[operator] || operator;
      const jsonField = `data->>${field}`;
      if (supabaseOperator === 'in' && Array.isArray(value)) {
        params.append(jsonField, `in.(${value.map(encodeFilterValue).join(',')})`);
      } else if (supabaseOperator === 'cs') {
        params.append(`data->${field}`, `cs.${JSON.stringify(Array.isArray(value) ? value : [value])}`);
      } else {
        params.append(jsonField, `${supabaseOperator}.${encodeFilterValue(value)}`);
      }
    });

  if (orderByField) {
    params.set('order', `data->>${orderByField}`);
  }

  return params.toString();
};

const toDocument = (row) => row ? { id: row.document_id, ...(row.data || {}) } : null;
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
  documentsTable: SUPABASE_DOCUMENTS_TABLE
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: result.user, session: getStoredSession() }, error: null };
    },
    signUp: async ({ email, password, options }) => {
      const result = await createUserWithEmailAndPassword(auth, email, password, options?.data);
      return { data: { user: result.user, session: getStoredSession() }, error: null };
    },
    signOut: async () => {
      await signOut(auth);
      return { error: null };
    },
    getUser: async () => ({ data: { user: toAuthUser(getStoredSession()?.user) }, error: null }),
    resetPasswordForEmail: async (email) => {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    },
    updateUser: async ({ password }) => ({ data: { user: await updatePassword(auth, password) }, error: null })
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
  const token = getStoredSession()?.access_token;
  if (!token) return null;
  const user = await supabaseFetch('/auth/v1/user', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
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
  const token = getStoredSession()?.access_token;
  if (!token) throw new Error('Link de redefinição inválido ou expirado. Solicite um novo email de recuperação.');
  const user = await supabaseFetch('/auth/v1/user', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
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
      return toDocuments(await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}?collection=eq.${encodeURIComponent(collectionName)}&select=*`));
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  getById: async (collectionName, id) => {
    try {
      const rows = await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}?collection=eq.${encodeURIComponent(collectionName)}&document_id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
      return toDocument(rows?.[0]) || null;
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName} por ID no Supabase:`, error);
      throw error;
    }
  },

  add: async (collectionName, data) => {
    try {
      const documentId = data?.id || crypto.randomUUID();
      const documentData = sanitizeForSupabase({
        ...data,
        id: documentId,
        createdAt: data?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      const payload = {
        collection: collectionName,
        document_id: documentId,
        data: documentData
      };
      const rows = await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return toDocument(rows?.[0]) || { id: documentId, ...documentData };
    } catch (error) {
      console.error(`Erro ao adicionar em ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  set: async (collectionName, id, data) => {
    try {
      const current = await firebaseService.getById(collectionName, id).catch(() => null);
      const documentData = sanitizeForSupabase({
        ...(current || {}),
        ...data,
        id,
        createdAt: current?.createdAt || data?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      const rows = await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}?on_conflict=collection,document_id`, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          collection: collectionName,
          document_id: id,
          data: documentData
        })
      });
      return toDocument(rows?.[0]) || { id, ...documentData };
    } catch (error) {
      console.error(`Erro ao salvar em ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  update: async (collectionName, id, data) => {
    try {
      const current = await firebaseService.getById(collectionName, id).catch(() => null);
      const documentData = sanitizeForSupabase({
        ...(current || {}),
        ...data,
        id,
        createdAt: current?.createdAt || data?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      const rows = await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}?on_conflict=collection,document_id`, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          collection: collectionName,
          document_id: id,
          data: documentData
        })
      });
      return toDocument(rows?.[0]) || { id, ...documentData };
    } catch (error) {
      console.error(`Erro ao atualizar ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  delete: async (collectionName, id) => {
    try {
      await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}?collection=eq.${encodeURIComponent(collectionName)}&document_id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return id;
    } catch (error) {
      console.error(`Erro ao excluir de ${collectionName} no Supabase:`, error);
      throw error;
    }
  },

  query: async (collectionName, conditions = [], orderByField = null) => {
    try {
      return toDocuments(await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}?${buildQueryString(collectionName, conditions, orderByField)}`));
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
