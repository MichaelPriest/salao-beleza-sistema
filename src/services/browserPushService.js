// src/services/browserPushService.js
import { firebaseService, getTenantContext } from './firebase';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';
const SERVICE_WORKER_URL = '/service-worker.js';
const LOCAL_STORAGE_KEY = 'push.subscription.local';
const PUSH_OUTBOX_COLLECTION = 'push_envios';

const normalizeBase64 = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  return `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
};

const urlBase64ToUint8Array = (base64String) => {
  const rawData = window.atob(normalizeBase64(base64String));
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const asArray = (value) => Array.isArray(value) ? value : [value];

const uniqueIds = (values) => Array.from(new Set(asArray(values).flatMap((item) => {
  if (!item) return [];
  if (typeof item === 'object') {
    return [
      item.id,
      item.uid,
      item.authUid,
      item.googleUid,
      item.usuarioId,
      item.clienteId,
      item.email,
    ];
  }
  return [item];
}).filter(Boolean).map(String)));

const getLocalUsuario = (tipoUsuario = 'admin') => {
  if (typeof localStorage === 'undefined') return {};
  if (tipoUsuario === 'cliente') {
    return safeParse(localStorage.getItem('cliente'), null)
      || safeParse(localStorage.getItem('clienteLogado'), null)
      || safeParse(localStorage.getItem('firebaseUser'), null)
      || {};
  }
  return safeParse(localStorage.getItem('usuario'), {}) || {};
};

const getTargetIds = (notificacao = {}, tipoUsuario = 'admin') => uniqueIds([
  notificacao.usuarioId,
  notificacao.userId,
  notificacao.uid,
  notificacao.destinatarioId,
  notificacao.paraUsuarioId,
  notificacao.adminId,
  notificacao.profissionalId,
  notificacao.clienteId,
  notificacao.clienteUid,
  notificacao.paraClienteId,
  notificacao.email,
  notificacao.clienteEmail,
  notificacao.destinatarios,
  notificacao.destinatarioIds,
  notificacao.destinatariosIds,
  notificacao.usuarios,
  notificacao.usuarioIds,
  notificacao.clienteIds,
  tipoUsuario === 'cliente' ? notificacao.cliente : null,
]);

const isBroadcast = (notificacao = {}) =>
  notificacao.todos === true || notificacao.broadcast === true || notificacao.tipoDestinatario === 'todos';

const notificationMatchesLocalUser = (notificacao = {}, tipoUsuario = 'admin') => {
  if (isBroadcast(notificacao)) return true;
  const localIds = new Set(uniqueIds(getLocalUsuario(tipoUsuario)));
  if (localIds.size === 0) return false;
  return getTargetIds(notificacao, tipoUsuario).some((id) => localIds.has(id));
};

const buildPushPayload = (notificacao = {}, defaultLink = '/') => ({
  title: notificacao.titulo || notificacao.title || 'Nova notificação',
  body: notificacao.mensagem || notificacao.body || notificacao.descricao || '',
  icon: notificacao.iconeUrl || notificacao.icon || notificacao.icone || '/logo192.png',
  badge: notificacao.badge || '/logo192.png',
  url: notificacao.link || notificacao.url || defaultLink,
  tag: notificacao.id || `${notificacao.tipo || 'notificacao'}-${notificacao.createdAt || notificacao.data || Date.now()}`,
  data: {
    id: notificacao.id,
    tipo: notificacao.tipo,
    link: notificacao.link || notificacao.url || defaultLink,
    createdAt: notificacao.createdAt || notificacao.data,
  },
});

const buildUsuarioPayload = (usuario = {}, tipoUsuario = 'admin') => {
  const tenant = getTenantContext();
  return {
    usuarioId: usuario?.id || usuario?.uid || usuario?.authUid || usuario?.clienteId || null,
    uid: usuario?.uid || usuario?.authUid || null,
    clienteId: tipoUsuario === 'cliente' ? (usuario?.id || usuario?.clienteId || usuario?.uid || null) : null,
    email: usuario?.email || null,
    nome: usuario?.nome || usuario?.nomeCompleto || null,
    tipoUsuario,
    empresaId: usuario?.empresaId || usuario?.tenantId || usuario?.empresa?.id || tenant.empresaId || null,
    unidadeId: usuario?.unidadeId || tenant.unidadeId || null,
  };
};

const getSubscriptionKey = (subscription) => subscription?.endpoint || `permission-${Date.now()}`;

export const browserPushService = {
  isSupported() {
    return typeof window !== 'undefined'
      && 'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window;
  },

  getPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  },

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return Notification.requestPermission();
  },

  async getRegistration() {
    if (!this.isSupported()) return null;
    const current = await navigator.serviceWorker.getRegistration();
    return current || navigator.serviceWorker.register(SERVICE_WORKER_URL);
  },

  async salvarInscricao(subscription, usuario = {}, tipoUsuario = 'admin', extra = {}) {
    const agora = new Date().toISOString();
    const payloadUsuario = buildUsuarioPayload(usuario, tipoUsuario);
    const subscriptionJson = subscription?.toJSON ? subscription.toJSON() : subscription;
    const payload = {
      ...payloadUsuario,
      ...extra,
      endpoint: subscriptionJson?.endpoint || null,
      subscription: subscriptionJson || null,
      keys: subscriptionJson?.keys || null,
      permissao: this.getPermission(),
      ativo: this.getPermission() === 'granted',
      userAgent: navigator.userAgent,
      plataforma: navigator.platform || null,
      updatedAt: agora,
      createdAt: agora,
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...payload, localId: getSubscriptionKey(subscriptionJson) }));

    try {
      const endpoint = payload.endpoint;
      if (endpoint) {
        const existentes = await firebaseService.query('push_subscriptions', [
          { field: 'endpoint', operator: '==', value: endpoint },
        ]).catch(() => []);
        if (existentes?.[0]?.id) {
          await firebaseService.update('push_subscriptions', existentes[0].id, { ...payload, createdAt: existentes[0].createdAt || agora });
          return { ...payload, id: existentes[0].id, salvoRemotamente: true };
        }
      }
      const result = await firebaseService.add('push_subscriptions', payload);
      return { ...payload, id: result?.id, salvoRemotamente: true };
    } catch (error) {
      console.warn('Push habilitado localmente, mas a inscrição remota não pôde ser salva:', error);
      return { ...payload, salvoRemotamente: false, erro: error?.message };
    }
  },

  async ativar(usuario = {}, tipoUsuario = 'admin') {
    if (!this.isSupported()) {
      return { ok: false, status: 'unsupported', mensagem: 'Este navegador não oferece suporte a push notification.' };
    }

    const permissao = await this.requestPermission();
    if (permissao !== 'granted') {
      return { ok: false, status: permissao, mensagem: 'Permissão de notificação não concedida.' };
    }

    const registration = await this.getRegistration();
    if (!registration) {
      return { ok: false, status: 'no_service_worker', mensagem: 'Service worker indisponível.' };
    }

    let subscription = await registration.pushManager.getSubscription();
    let modo = 'local';

    if (VAPID_PUBLIC_KEY) {
      subscription = subscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      modo = 'push';
    }

    const saved = await this.salvarInscricao(subscription, usuario, tipoUsuario, { modo, vapidConfigurado: Boolean(VAPID_PUBLIC_KEY) });
    return {
      ok: true,
      status: 'granted',
      modo,
      subscription,
      saved,
      mensagem: VAPID_PUBLIC_KEY
        ? 'Notificação push ativada neste dispositivo.'
        : 'Notificações ativadas neste dispositivo. Configure REACT_APP_VAPID_PUBLIC_KEY para envio remoto via servidor.',
    };
  },

  async desativar() {
    if (!this.isSupported()) return { ok: false, status: 'unsupported' };
    const registration = await this.getRegistration();
    const subscription = await registration?.pushManager?.getSubscription();
    if (subscription) await subscription.unsubscribe();
    const local = safeParse(localStorage.getItem(LOCAL_STORAGE_KEY), null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (local?.endpoint) {
      try {
        const existentes = await firebaseService.query('push_subscriptions', [
          { field: 'endpoint', operator: '==', value: local.endpoint },
        ]).catch(() => []);
        await Promise.all((existentes || []).map((item) => firebaseService.update('push_subscriptions', item.id, {
          ativo: false,
          permissao: this.getPermission(),
          updatedAt: new Date().toISOString(),
        })));
      } catch (error) {
        console.warn('Não foi possível desativar a inscrição remota de push:', error);
      }
    }
    return { ok: true, status: 'disabled' };
  },

  async exibirLocal({ titulo, mensagem, body, icone, icon, badge, link, url, dados, tag } = {}) {
    if (!this.isSupported() || this.getPermission() !== 'granted') return false;
    const registration = await this.getRegistration();
    if (!registration?.showNotification) return false;
    await registration.showNotification(titulo || 'Nova notificação', {
      body: mensagem || body || '',
      icon: icon || icone || '/logo192.png',
      badge: badge || '/logo192.png',
      tag: tag || dados?.id || undefined,
      data: { ...(dados || {}), url: url || link || dados?.link || '/' },
      vibrate: [120, 60, 120],
      actions: [{ action: 'open', title: 'Abrir' }, { action: 'close', title: 'Fechar' }],
    });
    return true;
  },

  async notificarSePermitido(payload) {
    try {
      return await this.exibirLocal(payload);
    } catch (error) {
      console.warn('Não foi possível exibir notificação local:', error);
      return false;
    }
  },

  async registrarEnvioPush(notificacao = {}, { tipoUsuario = 'admin', colecaoOrigem = 'notificacoes', defaultLink = '/' } = {}) {
    const agora = new Date().toISOString();
    const tenant = getTenantContext();
    const destinatarioIds = getTargetIds(notificacao, tipoUsuario);
    const payload = buildPushPayload(notificacao, defaultLink);

    try {
      const camposBusca = tipoUsuario === 'cliente'
        ? ['clienteId', 'usuarioId', 'uid', 'email']
        : ['usuarioId', 'uid', 'email'];
      const consultas = isBroadcast(notificacao) || destinatarioIds.length === 0
        ? [
          firebaseService.query('push_subscriptions', [
            { field: 'tipoUsuario', operator: '==', value: tipoUsuario },
            { field: 'ativo', operator: '==', value: true },
          ]).catch(() => []),
        ]
        : destinatarioIds.flatMap((id) => camposBusca.map((field) =>
          firebaseService.query('push_subscriptions', [
            { field, operator: '==', value: id },
            { field: 'ativo', operator: '==', value: true },
          ]).catch(() => [])
        ));
      const encontrados = consultas.length > 0 ? (await Promise.all(consultas)).flat() : [];
      const inscricoes = Array.from(new Map(encontrados.filter(Boolean).map((item) => [item.endpoint || item.id, item])).values());

      await firebaseService.add(PUSH_OUTBOX_COLLECTION, {
        notificacaoId: notificacao.id || null,
        colecaoOrigem,
        tipoUsuario,
        destinatarioIds,
        empresaId: notificacao.empresaId || tenant.empresaId || null,
        unidadeId: notificacao.unidadeId || tenant.unidadeId || null,
        broadcast: isBroadcast(notificacao),
        payload,
        inscricoes: inscricoes.map((item) => ({
          id: item.id,
          endpoint: item.endpoint,
          usuarioId: item.usuarioId,
          clienteId: item.clienteId,
          tipoUsuario: item.tipoUsuario,
        })),
        totalInscricoes: inscricoes.length,
        status: inscricoes.length > 0 ? 'pendente' : 'sem_inscricao',
        tentativas: 0,
        requerBackend: true,
        createdAt: agora,
        updatedAt: agora,
      });
      return { ok: true, totalInscricoes: inscricoes.length };
    } catch (error) {
      console.warn('Não foi possível registrar envio push remoto:', error);
      return { ok: false, erro: error?.message };
    }
  },

  async notificarNotificacaoCriada(notificacao = {}, options = {}) {
    const {
      tipoUsuario = 'admin',
      colecaoOrigem = 'notificacoes',
      defaultLink = tipoUsuario === 'cliente' ? '/cliente/notificacoes' : '/notificacoes',
    } = options;
    const payload = buildPushPayload(notificacao, defaultLink);

    await Promise.all([
      notificationMatchesLocalUser(notificacao, tipoUsuario)
        ? this.notificarSePermitido({
          titulo: payload.title,
          mensagem: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          link: payload.url,
          dados: payload.data,
          tag: payload.tag,
        })
        : Promise.resolve(false),
      this.registrarEnvioPush(notificacao, { tipoUsuario, colecaoOrigem, defaultLink }),
    ]);

    return true;
  },
};

export default browserPushService;
