// src/services/saasService.js
import { firebaseService, getTenantContext, setTenantContext, clearTenantContext } from './firebase';

export const STATUS_ASSINATURA = {
  TRIAL: 'trial',
  ATIVA: 'ativa',
  PENDENTE: 'pendente',
  INADIMPLENTE: 'inadimplente',
  CANCELADA: 'cancelada',
  EXPIRADA: 'expirada'
};

export const RECURSOS_SAAS = [
  { id: 'agenda', nome: 'Agenda' },
  { id: 'clientes', nome: 'Clientes' },
  { id: 'servicos', nome: 'Serviços' },
  { id: 'profissionais', nome: 'Profissionais' },
  { id: 'financeiro_basico', nome: 'Financeiro básico' },
  { id: 'financeiro_completo', nome: 'Financeiro completo' },
  { id: 'fidelidade', nome: 'Fidelidade' },
  { id: 'estoque', nome: 'Estoque' },
  { id: 'multiunidades', nome: 'Multiunidades' },
  { id: 'relatorios_rede', nome: 'Relatórios avançados' },
  { id: 'site_publico', nome: 'Página pública personalizada' }
];

export const PROVEDORES_COBRANCA = [
  { id: 'manual', nome: 'Manual / boleto externo', secretEnvVars: [] },
  { id: 'stripe', nome: 'Stripe Checkout', secretEnvVars: ['STRIPE_SECRET_KEY'] },
  { id: 'mercadopago', nome: 'Mercado Pago', secretEnvVars: ['MERCADOPAGO_ACCESS_TOKEN'] },
  { id: 'pagseguro', nome: 'PagSeguro / PagBank', secretEnvVars: ['PAGSEGURO_TOKEN'] }
];

export const BILLING_CONFIG_ID = 'billing';

export const CONFIG_COBRANCA_PADRAO = {
  id: BILLING_CONFIG_ID,
  provider: 'manual',
  modoAutomatico: true,
  gerarFaturaAutomaticamente: true,
  diasAntesVencimento: 3,
  diaVencimentoPadrao: 5,
  instrucoesManual: 'Entre em contato para pagamento da mensalidade.',
  metodosPagamento: { card: true, pix: true, boleto: true },
  successPath: '/billing/sucesso',
  cancelPath: '/billing/cancelado',
  webhookPath: '/api/billing-webhook',
  stripe: { enabled: false },
  mercadopago: { enabled: false },
  pagseguro: { enabled: false, environment: 'sandbox' }
};

export const PLANOS_PADRAO = {
  individual: {
    id: 'individual',
    nome: 'Individual',
    tipo: 'individual',
    precoMensal: 99,
    moeda: 'BRL',
    limites: { empresas: 1, unidades: 1, usuarios: 5, clientes: 1000 },
    recursos: ['agenda', 'clientes', 'servicos', 'profissionais', 'financeiro_basico', 'fidelidade', 'site_publico']
  },
  multiunidades: {
    id: 'multiunidades',
    nome: 'Multiunidades',
    tipo: 'multiunidades',
    precoMensal: 249,
    precoPorUnidade: 49,
    moeda: 'BRL',
    limites: { empresas: 1, unidades: 999, usuarios: 999, clientes: 999999 },
    recursos: ['agenda', 'clientes', 'servicos', 'profissionais', 'financeiro_completo', 'fidelidade', 'estoque', 'multiunidades', 'relatorios_rede', 'site_publico']
  }
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getUsuarioAtual = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null');
  } catch (error) {
    return null;
  }
};

const slugifyEmpresa = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60) || 'empresa';

const getPublicBaseUrl = () => {
  if (typeof window === 'undefined') return process.env.REACT_APP_PUBLIC_APP_URL || '';
  return window.location.origin;
};

const buildEmpresaLink = (slug) => `${getPublicBaseUrl()}/e/${slug}`;

const gerarSlugEmpresa = async (nome, empresaId = null) => {
  const base = slugifyEmpresa(nome);
  let slug = base;
  let tentativa = 1;

  while (tentativa <= 10) {
    const existentes = await firebaseService.query('empresas', [{ field: 'slug', operator: '==', value: slug }]).catch(() => []);
    const conflito = existentes.find((empresa) => empresa.id !== empresaId);
    if (!conflito) return slug;
    tentativa += 1;
    slug = `${base}-${tentativa}`;
  }

  return `${base}-${Date.now()}`;
};

export const saasService = {
  getContextoAtual: getTenantContext,
  setContextoAtual: setTenantContext,
  limparContexto: clearTenantContext,
  slugifyEmpresa,
  buildEmpresaLink,

  listarPlanos: async () => {
    const planos = await firebaseService.getAll('planos_saas').catch(() => []);
    if (planos.length > 0) return planos.filter((plano) => plano.status !== 'inativo');
    return Object.values(PLANOS_PADRAO);
  },

  buscarPlano: async (planoId = 'individual') => {
    const plano = await firebaseService.getById('planos_saas', planoId).catch(() => null);
    return plano || PLANOS_PADRAO[planoId] || PLANOS_PADRAO.individual;
  },

  buscarConfigCobranca: async () => {
    const config = await firebaseService.getById('configuracoes_saas', BILLING_CONFIG_ID).catch(() => null);
    return {
      ...CONFIG_COBRANCA_PADRAO,
      ...(config || {}),
      stripe: { ...CONFIG_COBRANCA_PADRAO.stripe, ...(config?.stripe || {}) },
      mercadopago: { ...CONFIG_COBRANCA_PADRAO.mercadopago, ...(config?.mercadopago || {}) },
      pagseguro: { ...CONFIG_COBRANCA_PADRAO.pagseguro, ...(config?.pagseguro || {}) },
      metodosPagamento: { ...CONFIG_COBRANCA_PADRAO.metodosPagamento, ...(config?.metodosPagamento || {}) }
    };
  },

  salvarConfigCobranca: async (config) => {
    const agora = new Date().toISOString();
    const configAtual = await saasService.buscarConfigCobranca();
    const stripeConfig = { ...configAtual.stripe, ...(config?.stripe || {}) };
    const mercadoPagoConfig = { ...configAtual.mercadopago, ...(config?.mercadopago || {}) };
    const pagSeguroConfig = { ...configAtual.pagseguro, ...(config?.pagseguro || {}) };
    delete stripeConfig.secretKey;
    delete mercadoPagoConfig.accessToken;
    delete pagSeguroConfig.token;

    const payload = {
      ...configAtual,
      ...config,
      id: BILLING_CONFIG_ID,
      updatedAt: agora,
      // Nunca salvar chaves secret no documento público; elas ficam apenas nas variáveis do servidor.
      stripe: stripeConfig,
      mercadopago: mercadoPagoConfig,
      pagseguro: pagSeguroConfig
    };

    await firebaseService.set('configuracoes_saas', BILLING_CONFIG_ID, payload);
    return payload;
  },

  salvarPlano: async (plano) => {
    if (!plano?.id) throw new Error('Informe o ID do plano.');
    const payload = {
      ...plano,
      precoMensal: Number(plano.precoMensal || 0),
      precoPorUnidade: Number(plano.precoPorUnidade || 0),
      limites: plano.limites || {},
      recursos: plano.recursos || [],
      updatedAt: new Date().toISOString()
    };
    await firebaseService.set('planos_saas', payload.id, payload);
    return payload;
  },

  recursosDoPlano: async (planoId) => {
    const plano = await saasService.buscarPlano(planoId);
    return plano?.recursos || [];
  },

  recursoLiberado: async (empresaId, recurso) => {
    const empresa = empresaId ? await firebaseService.getById('empresas', empresaId).catch(() => null) : null;
    const assinatura = await saasService.buscarAssinaturaAtual(empresaId).catch(() => null);
    const plano = await saasService.buscarPlano(assinatura?.planoId || empresa?.planoId || 'individual');
    return Boolean((plano?.recursos || []).includes(recurso));
  },

  criarEmpresa: async ({ nome, documento, razaoSocial, email, telefone, planoId = 'individual', trialDias = 14, proprietario = null, responsavelFinanceiro = '', emailFinanceiro = '', telefoneFinanceiro = '', documentoCobranca = '', enderecoCobranca = '', diaVencimento = 5, observacoesCobranca = '' }) => {
    const plano = await saasService.buscarPlano(planoId);
    const agora = new Date().toISOString();
    const empresaId = firebaseService.generateId('empresas');
    const unidadeId = firebaseService.generateId('unidades');
    const usuario = proprietario || getUsuarioAtual();
    const slug = await gerarSlugEmpresa(nome, empresaId);

    const empresa = {
      id: empresaId,
      nome,
      documento: documento || null,
      razaoSocial: razaoSocial || null,
      email: email || usuario?.email || null,
      telefone: telefone || null,
      cobranca: {
        razaoSocial: razaoSocial || nome,
        documentoCobranca: documentoCobranca || documento || null,
        responsavelFinanceiro: responsavelFinanceiro || usuario?.nome || '',
        emailFinanceiro: emailFinanceiro || email || usuario?.email || '',
        telefoneFinanceiro: telefoneFinanceiro || telefone || '',
        enderecoCobranca: enderecoCobranca || '',
        diaVencimento: Number(diaVencimento || 5),
        observacoes: observacoesCobranca || ''
      },
      tipo: plano.tipo,
      planoId: plano.id,
      status: 'ativa',
      slug,
      linkPublico: buildEmpresaLink(slug),
      sitePublico: {
        ativo: true,
        titulo: nome,
        subtitulo: 'Agende seus serviços online com facilidade.',
        corPrimaria: '#9c27b0',
        mostrarServicos: true,
        mostrarProfissionais: true,
        mostrarContato: true
      },
      proprietarioId: usuario?.id || usuario?.uid || null,
      createdAt: agora,
      updatedAt: agora
    };

    const unidade = {
      id: unidadeId,
      empresaId,
      nome: 'Unidade Principal',
      principal: true,
      status: 'ativa',
      createdAt: agora,
      updatedAt: agora
    };

    const assinatura = {
      id: empresaId,
      empresaId,
      planoId: plano.id,
      status: STATUS_ASSINATURA.TRIAL,
      periodo: 'mensal',
      valorMensal: plano.precoMensal || 0,
      moeda: plano.moeda || 'BRL',
      trialFimEm: addDays(new Date(), trialDias).toISOString(),
      inicioEm: agora,
      proximaCobrancaEm: addDays(new Date(), trialDias).toISOString(),
      diaVencimento: Number(diaVencimento || 5),
      gateway: process.env.REACT_APP_BILLING_PROVIDER || 'manual',
      recursos: plano.recursos || [],
      createdAt: agora,
      updatedAt: agora
    };

    setTenantContext({ empresa, unidade });

    await firebaseService.set('empresas', empresaId, empresa);
    await firebaseService.set('unidades', unidadeId, unidade);
    await firebaseService.set('assinaturas', empresaId, assinatura);

    if (usuario?.id || usuario?.uid) {
      await firebaseService.update('usuarios', usuario.id || usuario.uid, {
        empresaId,
        empresaNome: nome,
        unidadeId,
        unidadeNome: unidade.nome,
        cargo: usuario.cargo || 'admin',
        status: 'ativo'
      }).catch(() => {});
    }

    return { empresa, unidade, assinatura };
  },

  salvarPortalEmpresa: async (empresaId, dadosPortal = {}) => {
    if (!empresaId) throw new Error('Empresa não selecionada.');
    const empresa = await firebaseService.getById('empresas', empresaId);
    if (!empresa) throw new Error('Empresa não encontrada.');

    const slugInformado = dadosPortal.slug || empresa.slug || empresa.nome;
    const slug = empresa.slug === slugInformado ? empresa.slug : await gerarSlugEmpresa(slugInformado, empresaId);
    const sitePublico = {
      ...(empresa.sitePublico || {}),
      ...dadosPortal.sitePublico,
      ativo: dadosPortal.sitePublico?.ativo !== false
    };
    const payload = {
      slug,
      linkPublico: buildEmpresaLink(slug),
      sitePublico,
      updatedAt: new Date().toISOString()
    };

    await firebaseService.update('empresas', empresaId, payload);
    return { ...empresa, ...payload };
  },

  buscarEmpresaPorSlug: async (slug) => {
    if (!slug) return null;
    const empresas = await firebaseService.query('empresas', [{ field: 'slug', operator: '==', value: slug }]).catch(() => []);
    return empresas.find((empresa) => empresa.sitePublico?.ativo !== false && empresa.status !== 'inativa') || null;
  },

  listarUnidades: async (empresaId = getTenantContext().empresaId) => {
    if (!empresaId) return [];
    return firebaseService.query('unidades', [{ field: 'empresaId', operator: '==', value: empresaId }]);
  },

  criarUnidade: async ({ empresaId = getTenantContext().empresaId, nome, telefone, endereco = {} }) => {
    if (!empresaId) throw new Error('Empresa não selecionada.');
    const unidadeId = firebaseService.generateId('unidades');
    const agora = new Date().toISOString();
    const unidade = {
      id: unidadeId,
      empresaId,
      nome,
      telefone: telefone || null,
      endereco,
      principal: false,
      status: 'ativa',
      createdAt: agora,
      updatedAt: agora
    };

    await firebaseService.set('unidades', unidadeId, unidade);
    return unidade;
  },

  trocarUnidade: async (unidade) => {
    if (!unidade?.empresaId || !unidade?.id) throw new Error('Unidade inválida.');
    return setTenantContext({ empresaId: unidade.empresaId, unidadeId: unidade.id, unidade });
  },

  buscarAssinaturaAtual: async (empresaId = getTenantContext().empresaId) => {
    if (!empresaId) return null;
    const assinatura = await firebaseService.getById('assinaturas', empresaId).catch(() => null);
    if (assinatura) return assinatura;
    const assinaturas = await firebaseService.query('assinaturas', [{ field: 'empresaId', operator: '==', value: empresaId }]).catch(() => []);
    return assinaturas[0] || null;
  },

  validarAcesso: async (empresaId = getTenantContext().empresaId) => {
    const assinatura = await saasService.buscarAssinaturaAtual(empresaId);
    if (!assinatura) return { liberado: false, motivo: 'assinatura_nao_encontrada' };

    const statusLiberados = [STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA];
    const trialValido = assinatura.status === STATUS_ASSINATURA.TRIAL && assinatura.trialFimEm && new Date(assinatura.trialFimEm) >= new Date();

    if (statusLiberados.includes(assinatura.status) || trialValido) {
      return { liberado: true, assinatura };
    }

    return { liberado: false, motivo: assinatura.status, assinatura };
  },



  iniciarCheckout: async ({ empresaId = getTenantContext().empresaId, planoId, provider, metodosPagamento = null, dadosPagamento = null } = {}) => {
    if (!empresaId) throw new Error('Empresa não selecionada.');
    const empresa = await firebaseService.getById('empresas', empresaId);
    const plano = await saasService.buscarPlano(planoId || empresa?.planoId || 'individual');
    const configCobranca = await saasService.buscarConfigCobranca();
    const gateway = provider || configCobranca.provider || 'manual';

    const registrar = async (payload) => {
      await saasService.registrarEventoCobranca({
        empresaId,
        tipo: 'checkout_iniciado',
        gateway: payload.provider || gateway,
        payload
      }).catch(() => {});
      return payload;
    };

    if (gateway === 'manual') {
      return registrar({
        provider: 'manual',
        checkoutUrl: null,
        instrucoes: configCobranca.instrucoesManual || 'Cobrança manual habilitada. Envie as instruções de pagamento para a empresa.',
        metodoPreferencial: dadosPagamento?.metodoPreferencial || null
      });
    }

    const response = await fetch('/api/saas-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa, plano, provider: gateway, billingConfig: configCobranca, metodosPagamento: metodosPagamento || configCobranca.metodosPagamento, dadosPagamento })
    });

    const rawBody = await response.text();
    let data = null;
    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch (error) {
        throw new Error(`Resposta inválida do endpoint /api/saas-checkout (${response.status}). Verifique se a API server-side está publicada.`);
      }
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `Erro ao iniciar cobrança (${response.status}).`);
    }

    if (!data) {
      throw new Error('Endpoint /api/saas-checkout retornou resposta vazia. Verifique a publicação da função server-side.');
    }

    return registrar(data);
  },

  criarFatura: async ({ empresaId = getTenantContext().empresaId, assinaturaId, valor, vencimentoEm, descricao }) => {
    if (!empresaId) throw new Error('Empresa não selecionada.');
    const faturaId = firebaseService.generateId('faturas_saas');
    const agora = new Date().toISOString();
    const fatura = {
      id: faturaId,
      empresaId,
      assinaturaId: assinaturaId || empresaId,
      valor,
      gateway: getTenantContext().empresa?.cobranca?.provider || 'manual',
      moeda: 'BRL',
      status: 'aberta',
      descricao: descricao || 'Mensalidade SaaS',
      vencimentoEm,
      createdAt: agora,
      updatedAt: agora
    };

    await firebaseService.set('faturas_saas', faturaId, fatura);
    return fatura;
  },

  registrarPagamento: async ({ empresaId = getTenantContext().empresaId, faturaId, valor, gateway = 'manual', gatewayPaymentId = null }) => {
    if (!empresaId) throw new Error('Empresa não selecionada.');
    const pagamentoId = firebaseService.generateId('pagamentos_saas');
    const agora = new Date().toISOString();
    const pagamento = {
      id: pagamentoId,
      empresaId,
      faturaId,
      valor,
      gateway: getTenantContext().empresa?.cobranca?.provider || 'manual',
      moeda: 'BRL',
      gateway,
      gatewayPaymentId,
      status: 'confirmado',
      pagoEm: agora,
      createdAt: agora,
      updatedAt: agora
    };

    await firebaseService.set('pagamentos_saas', pagamentoId, pagamento);
    if (faturaId) {
      await firebaseService.update('faturas_saas', faturaId, { status: 'paga', pagoEm: agora }).catch(() => {});
    }
    await firebaseService.update('assinaturas', empresaId, { status: STATUS_ASSINATURA.ATIVA, updatedAt: agora }).catch(() => {});

    return pagamento;
  },

  gerarFaturasMensais: async ({ assinaturas = [], empresas = [], vencimentoEm = null } = {}) => {
    const empresasPorId = empresas.reduce((acc, empresa) => ({ ...acc, [empresa.id]: empresa }), {});
    const abertas = [];

    for (const assinatura of assinaturas) {
      if (![STATUS_ASSINATURA.TRIAL, STATUS_ASSINATURA.ATIVA].includes(assinatura.status)) continue;
      const empresaId = assinatura.empresaId || assinatura.id;
      const empresa = empresasPorId[empresaId];
      if (!empresaId || !empresa) continue;

      const fatura = await saasService.criarFatura({
        empresaId,
        assinaturaId: assinatura.id || empresaId,
        valor: assinatura.valorMensal || 0,
        vencimentoEm: vencimentoEm || assinatura.proximaCobrancaEm || addDays(new Date(), 7).toISOString(),
        descricao: `Mensalidade SaaS - ${empresa.nome || empresaId}`
      });
      abertas.push(fatura);
    }

    return abertas;
  },

  registrarEventoCobranca: async ({ empresaId, tipo, payload, gateway = 'manual' }) => {
    const eventoId = firebaseService.generateId('eventos_cobranca_saas');
    const evento = {
      id: eventoId,
      empresaId: empresaId || payload?.empresaId || null,
      tipo,
      gateway,
      payload,
      processado: false,
      createdAt: new Date().toISOString()
    };
    await firebaseService.set('eventos_cobranca_saas', eventoId, evento);
    return evento;
  }
};

export default saasService;
