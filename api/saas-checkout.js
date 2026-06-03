// api/saas-checkout.js
// Endpoint server-side para iniciar cobrança SaaS sem expor chaves secret no frontend.

const json = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const getEnabledMethods = (metodosPagamento = {}) => ({
  card: metodosPagamento.card !== false,
  pix: metodosPagamento.pix !== false,
  boleto: metodosPagamento.boleto !== false
});

const buildBaseUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
};

const createStripeCheckout = async ({ req, plano, empresa, successUrl, cancelUrl, metodosPagamento = {} }) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não configurada no ambiente servidor.');
  }

  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  params.append('client_reference_id', empresa.id);
  params.append('customer_email', empresa.email || '');
  params.append('metadata[empresaId]', empresa.id);
  params.append('metadata[planoId]', plano.id);
  const methods = getEnabledMethods(metodosPagamento);
  if (methods.card) params.append('payment_method_types[]', 'card');
  if (methods.boleto) params.append('payment_method_types[]', 'boleto');
  if (!methods.card && !methods.boleto) params.append('payment_method_types[]', 'card');

  if (plano.stripePriceId) {
    params.append('line_items[0][price]', plano.stripePriceId);
    params.append('line_items[0][quantity]', '1');
  } else {
    params.append('line_items[0][price_data][currency]', (plano.moeda || 'BRL').toLowerCase());
    params.append('line_items[0][price_data][product_data][name]', plano.nome || 'Mensalidade SaaS');
    params.append('line_items[0][price_data][unit_amount]', String(Math.round((plano.precoMensal || 0) * 100)));
    params.append('line_items[0][price_data][recurring][interval]', 'month');
    params.append('line_items[0][quantity]', '1');
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Erro ao criar checkout Stripe.');

  return { provider: 'stripe', checkoutUrl: data.url, sessionId: data.id };
};

const getPagSeguroBaseUrl = (environment) => {
  const env = (environment || process.env.PAGSEGURO_ENVIRONMENT || process.env.PAGBANK_ENVIRONMENT || 'sandbox').toLowerCase();
  return env === 'production' || env === 'producao'
    ? 'https://api.pagseguro.com'
    : 'https://sandbox.api.pagseguro.com';
};

const createPagSeguroCheckout = async ({ plano, empresa, successUrl, notificationUrl, billingConfig = {}, metodosPagamento = {} }) => {
  const token = process.env.PAGSEGURO_TOKEN || process.env.PAGBANK_TOKEN;
  if (!token) {
    throw new Error('PAGSEGURO_TOKEN não configurado no ambiente servidor.');
  }

  const methods = getEnabledMethods(metodosPagamento);
  const paymentMethods = [
    methods.card ? { type: 'CREDIT_CARD' } : null,
    methods.pix ? { type: 'PIX' } : null,
    methods.boleto ? { type: 'BOLETO' } : null
  ].filter(Boolean);

  const payload = {
    reference_id: `${empresa.id}:${plano.id}:${Date.now()}`,
    customer: {
      name: empresa.nome || empresa.email || 'Cliente SaaS',
      email: empresa.email
    },
    items: [
      {
        reference_id: plano.id,
        name: plano.nome || 'Mensalidade SaaS',
        quantity: 1,
        unit_amount: Math.round(Number(plano.precoMensal || 0) * 100)
      }
    ],
    redirect_url: successUrl,
    payment_methods: paymentMethods.length ? paymentMethods : [{ type: 'CREDIT_CARD' }],
    notification_urls: notificationUrl ? [notificationUrl] : undefined
  };

  const response = await fetch(`${getPagSeguroBaseUrl(billingConfig.pagseguro?.environment)}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error_messages?.[0]?.description || data?.message || 'Erro ao criar checkout PagSeguro/PagBank.');

  const checkoutUrl = data?.links?.find((link) => ['PAY', 'PAYMENT'].includes(String(link.rel).toUpperCase()))?.href
    || data?.links?.find((link) => link.href)?.href
    || data?.payment_url
    || data?.checkout_url;

  return { provider: 'pagseguro', checkoutUrl, checkoutId: data.id, referenceId: data.reference_id };
};

const createMercadoPagoCheckout = async ({ plano, empresa, successUrl, cancelUrl, metodosPagamento = {} }) => {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado no ambiente servidor.');
  }

  const methods = getEnabledMethods(metodosPagamento);
  const excludedPaymentTypes = [
    !methods.card ? { id: 'credit_card' } : null,
    !methods.card ? { id: 'debit_card' } : null,
    !methods.pix ? { id: 'bank_transfer' } : null,
    !methods.boleto ? { id: 'ticket' } : null
  ].filter(Boolean);

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [
        {
          title: plano.nome || 'Mensalidade SaaS',
          quantity: 1,
          currency_id: plano.moeda || 'BRL',
          unit_price: Number(plano.precoMensal || 0)
        }
      ],
      payer: { email: empresa.email },
      external_reference: `${empresa.id}:${plano.id}`,
      metadata: { empresaId: empresa.id, planoId: plano.id },
      back_urls: {
        success: successUrl,
        failure: cancelUrl,
        pending: successUrl
      },
      auto_return: 'approved',
      payment_methods: { excluded_payment_types: excludedPaymentTypes }
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Erro ao criar checkout Mercado Pago.');

  return { provider: 'mercadopago', checkoutUrl: data.init_point, preferenceId: data.id };
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Método não permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const provider = (body.provider || process.env.BILLING_PROVIDER || 'manual').toLowerCase();
    const baseUrl = process.env.APP_URL || buildBaseUrl(req);
    const billingConfig = body.billingConfig || {};
    const empresa = body.empresa || {};
    const plano = body.plano || {};
    const metodosPagamento = body.metodosPagamento || billingConfig.metodosPagamento || {};

    if (!empresa.id || !plano.id) {
      return json(res, 400, { error: 'empresa.id e plano.id são obrigatórios.' });
    }

    const successPath = billingConfig.successPath || '/billing/sucesso';
    const cancelPath = billingConfig.cancelPath || '/billing/cancelado';
    const webhookPath = billingConfig.webhookPath || '/api/billing-webhook';
    const successUrl = body.successUrl || `${baseUrl}${successPath}?empresaId=${encodeURIComponent(empresa.id)}`;
    const cancelUrl = body.cancelUrl || `${baseUrl}${cancelPath}?empresaId=${encodeURIComponent(empresa.id)}`;
    const notificationUrl = body.notificationUrl || process.env.PAGSEGURO_NOTIFICATION_URL || `${baseUrl}${webhookPath}`;

    if (provider === 'stripe') {
      return json(res, 200, await createStripeCheckout({ req, plano, empresa, successUrl, cancelUrl, metodosPagamento }));
    }

    if (provider === 'mercadopago') {
      return json(res, 200, await createMercadoPagoCheckout({ plano, empresa, successUrl, cancelUrl, metodosPagamento }));
    }

    if (provider === 'pagseguro' || provider === 'pagbank') {
      return json(res, 200, await createPagSeguroCheckout({ plano, empresa, successUrl, notificationUrl, billingConfig, metodosPagamento }));
    }

    return json(res, 200, {
      provider: 'manual',
      checkoutUrl: null,
      instrucoes: billingConfig.instrucoesManual || process.env.BILLING_MANUAL_INSTRUCTIONS || 'Cobrança manual habilitada. Configure Stripe, Mercado Pago ou PagSeguro/PagBank para checkout automático.'
    });
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
};
