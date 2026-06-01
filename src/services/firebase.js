// src/services/firebase.js
// Camada de compatibilidade: o antigo código chamava este módulo de "firebase",
// mas todas as operações agora usam Supabase (REST + Auth REST API).

const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || 'https://kvjrerxqwtrxttiiqkgf.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_KEY || '';

const AUTH_STORAGE_KEY = 'supabase.auth.session';
const ACCESS_TOKEN_KEY = 'supabase.access_token';
const SUPABASE_DOCUMENTS_TABLE = process.env.REACT_APP_SUPABASE_DOCUMENTS_TABLE || 'registros';

const ensureSupabaseConfig = () => {
  if (!SUPABASE_URL) {
    throw new Error('REACT_APP_SUPABASE_URL não configurado.');
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error('REACT_APP_SUPABASE_ANON_KEY não configurado. Configure a chave anon/public do projeto Supabase.');
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

const authRequest = (endpoint, body) => supabaseFetch(`/auth/v1/${endpoint}`, {
  method: 'POST',
  body: JSON.stringify(body),
  useAnonOnly: true
});

const toAuthUser = (user) => user ? {
  ...user,
  uid: user.id,
  email: user.email
} : null;

export const supabaseConfig = {
  url: SUPABASE_URL,
  hasAnonKey: Boolean(SUPABASE_ANON_KEY)
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
    }
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
  const session = await authRequest('signup', { email, password, data: metadata });
  setStoredSession(session);
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

export const onAuthStateChanged = (_auth, callback) => {
  const listener = (user) => callback(toAuthUser(user));
  authListeners.add(listener);
  setTimeout(() => listener(getStoredSession()?.user || null), 0);
  return () => authListeners.delete(listener);
};

export const sendPasswordResetEmail = async (_auth, email) => {
  await authRequest('recover', { email });
};

export class GoogleAuthProvider {
  constructor() {
    this.providerId = 'google';
  }
}

export const signInWithPopup = async () => {
  throw new Error('Login com Google deve ser configurado no Supabase OAuth com redirecionamento. Use email e senha ou habilite OAuth no fluxo dedicado.');
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
      const documentData = sanitizeForSupabase({
        id,
        ...data,
        updatedAt: Timestamp.now(),
        createdAt: data?.createdAt || Timestamp.now()
      });
      const rows = await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}?collection=eq.${encodeURIComponent(collectionName)}&document_id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ data: documentData })
      });
      if (rows?.length) return toDocument(rows[0]);
      return firebaseService.add(collectionName, documentData);
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
        updatedAt: Timestamp.now()
      });
      const rows = await supabaseFetch(`/rest/v1/${SUPABASE_DOCUMENTS_TABLE}?collection=eq.${encodeURIComponent(collectionName)}&document_id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ data: documentData })
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
