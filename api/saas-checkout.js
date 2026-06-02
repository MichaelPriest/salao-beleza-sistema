// api/saas-checkout.js
// Endpoint server-side para iniciar cobrança SaaS sem expor chaves secret no frontend.

const json = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const buildBaseUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
};

const createStripeCheckout = async ({ req, plano, empresa, successUrl, cancelUrl }) => {
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

const createMercadoPagoCheckout = async ({ plano, empresa, successUrl, cancelUrl }) => {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado no ambiente servidor.');
  }

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
      auto_return: 'approved'
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
    const empresa = body.empresa || {};
    const plano = body.plano || {};

    if (!empresa.id || !plano.id) {
      return json(res, 400, { error: 'empresa.id e plano.id são obrigatórios.' });
    }

    const successUrl = body.successUrl || `${baseUrl}/billing/sucesso?empresaId=${encodeURIComponent(empresa.id)}`;
    const cancelUrl = body.cancelUrl || `${baseUrl}/billing/cancelado?empresaId=${encodeURIComponent(empresa.id)}`;

    if (provider === 'stripe') {
      return json(res, 200, await createStripeCheckout({ req, plano, empresa, successUrl, cancelUrl }));
    }

    if (provider === 'mercadopago') {
      return json(res, 200, await createMercadoPagoCheckout({ plano, empresa, successUrl, cancelUrl }));
    }

    return json(res, 200, {
      provider: 'manual',
      checkoutUrl: null,
      instrucoes: process.env.BILLING_MANUAL_INSTRUCTIONS || 'Cobrança manual habilitada. Configure Stripe ou Mercado Pago para checkout automático.'
    });
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
};
