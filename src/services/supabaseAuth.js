// src/services/supabaseAuth.js
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://egfxmxezuzzttgqjdlef.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_O626uQ_eaF6kgXzbJhyFBQ_kARzsZNi';

const SESSION_KEY = 'sb_session';
const listeners = new Set();

const authHeaders = {
  apikey: supabaseAnonKey,
  'Content-Type': 'application/json'
};

const parseJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (_e) {
    return null;
  }
};

const saveSession = (session) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const getSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
};

const notifyAuthListeners = async (event) => {
  const session = getSession();
  const user = await supabaseAuthService.getUser().catch(() => null);
  listeners.forEach((callback) => callback({ event, session, user }));
};

const authRequest = async (path, options = {}) => {
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.msg || data?.error_description || 'Erro de autenticação Supabase');
    error.code = data?.error;
    throw error;
  }

  return data;
};

export const supabaseAuthService = {
  getSession,

  async signInWithPassword(email, password) {
    const data = await authRequest('token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    saveSession(data);
    await notifyAuthListeners('SIGNED_IN');

    return {
      user: data.user,
      session: data
    };
  },

  async signUp(email, password, metadata = {}) {
    const data = await authRequest('signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        data: metadata
      })
    });

    if (data.access_token) {
      saveSession(data);
      await notifyAuthListeners('SIGNED_UP');
    }

    return data;
  },

  async signOut() {
    const session = getSession();

    if (session?.access_token) {
      await authRequest('logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      }).catch(() => {});
    }

    saveSession(null);
    await notifyAuthListeners('SIGNED_OUT');
  },

  async resetPasswordForEmail(email) {
    const redirectTo = `${window.location.origin}/cliente/login`;
    return authRequest('recover', {
      method: 'POST',
      body: JSON.stringify({ email, redirect_to: redirectTo })
    });
  },

  async getUser() {
    const session = getSession();
    if (!session?.access_token) return null;

    const user = await authRequest('user', {
      method: 'GET',
      headers: { Authorization: `Bearer ${session.access_token}` }
    }).catch(() => null);

    if (user) return user;

    const decoded = parseJwt(session.access_token);
    if (!decoded) return null;

    return {
      id: decoded.sub,
      email: decoded.email
    };
  },

  onAuthStateChanged(callback) {
    listeners.add(callback);
    notifyAuthListeners('INITIAL_SESSION');

    const storageHandler = (event) => {
      if (event.key === SESSION_KEY) {
        notifyAuthListeners('SESSION_UPDATED');
      }
    };

    window.addEventListener('storage', storageHandler);

    return () => {
      listeners.delete(callback);
      window.removeEventListener('storage', storageHandler);
    };
  },

  signInWithGoogle(redirectPath = '/login') {
    const redirectTo = `${window.location.origin}${redirectPath}`;
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
    window.location.href = authUrl;
  },

  async handleOAuthCallbackFromUrl() {
    const hash = window.location.hash?.replace(/^#/, '');
    if (!hash) return null;

    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');
    const token_type = params.get('token_type');

    if (!access_token) return null;

    const session = { access_token, refresh_token, expires_in, token_type };
    saveSession(session);

    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

    await notifyAuthListeners('SIGNED_IN');
    return session;
  }
};

export default supabaseAuthService;
