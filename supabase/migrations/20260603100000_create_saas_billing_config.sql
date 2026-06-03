-- Configurações globais de cobrança SaaS (plataforma, não tenant)
-- Secrets de gateway continuam apenas nas variáveis do servidor.

do $$
begin
  perform public.create_document_table('configuracoes_saas');
  perform public.create_document_table('webhooks_cobranca_saas');
end;
$$;

insert into public.configuracoes_saas (document_id, data)
values ('billing', jsonb_build_object(
  'id', 'billing',
  'provider', 'manual',
  'modoAutomatico', true,
  'gerarFaturaAutomaticamente', true,
  'diasAntesVencimento', 3,
  'diaVencimentoPadrao', 5,
  'successPath', '/billing/sucesso',
  'cancelPath', '/billing/cancelado',
  'webhookPath', '/api/billing-webhook',
  'instrucoesManual', 'Entre em contato para pagamento da mensalidade.',
  'stripe', jsonb_build_object('enabled', false),
  'mercadopago', jsonb_build_object('enabled', false),
  'pagseguro', jsonb_build_object('enabled', false, 'environment', 'sandbox'),
  'createdAt', now(),
  'updatedAt', now()
))
on conflict (document_id) do update
  set data = public.configuracoes_saas.data || excluded.data,
      updated_at = now();
