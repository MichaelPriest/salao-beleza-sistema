export const getNotificationPayload = (notificacao = {}) => ({
  ...(notificacao.dados || {}),
  ...(notificacao.detalhes || {}),
  ...(notificacao.acao || {}),
});

export const normalizarLinkNotificacao = (notificacao = {}, area = 'admin') => {
  const payload = getNotificationPayload(notificacao);
  const link = notificacao.link || notificacao.acao?.link || notificacao.detalhes?.link || payload.link;
  if (link && link !== '#') return link;

  const tipo = notificacao.tipo || payload.tipo;
  const tabela = notificacao.referenciaTabela || payload.referenciaTabela || payload.tabela;

  if (area === 'cliente') {
    if (tipo === 'agendamento' || tabela === 'agendamentos') return '/cliente/agendamentos';
    if (tipo === 'atendimento' || tabela === 'atendimentos') return '/cliente/historico';
    if (tipo === 'pontos' || tabela === 'pontuacao') return '/cliente/pontos';
    if (tipo === 'resgate' || tipo === 'recompensa' || tabela === 'resgates_fidelidade') return '/cliente/recompensas';
    return '/cliente/notificacoes';
  }

  if (tipo === 'agendamento' || tabela === 'agendamentos') return '/agendamentos';
  if (tipo === 'cliente' || tabela === 'clientes') return '/clientes';
  if (tipo === 'estoque' || tipo === 'produto' || tabela === 'produtos' || tabela === 'movimentacoes_estoque') return '/estoque';
  if (tipo === 'pagamento' || tabela === 'pagamentos') return '/financeiro';
  if (tipo === 'atendimento' || tabela === 'atendimentos') return '/atendimentos';
  if (tipo === 'anamnese' || tabela === 'respostas_anamnese') return '/anamnese/respostas';
  if (tipo === 'pontos' || tabela === 'pontuacao') return '/fidelidade/gerenciar';
  if (tipo === 'resgate' || tipo === 'recompensa' || tabela === 'resgates_fidelidade') return '/fidelidade/gerenciar?tab=resgates';
  return '/notificacoes';
};

export const montarDetalhesNotificacao = (notificacao = {}) => {
  const payload = getNotificationPayload(notificacao);
  const detalhes = [
    ['Status', notificacao.lida ? 'Visualizada' : 'Nova'],
    ['Tipo', notificacao.tipo],
    ['Prioridade', notificacao.prioridade || payload.prioridade],
    ['Origem', notificacao.origem || payload.origem],
    ['Cliente', payload.clienteNome || notificacao.clienteNome],
    ['Serviço', payload.servicoNome || notificacao.servicoNome],
    ['Profissional', payload.profissionalNome || notificacao.profissionalNome],
    ['Produto', payload.produtoNome || notificacao.produtoNome],
    ['Recompensa', payload.recompensaNome || notificacao.recompensaNome],
    ['Quantidade/Estoque', payload.quantidadeEstoque || payload.estoque || payload.quantidade],
    ['Estoque mínimo', payload.estoqueMinimo || payload.minimo],
    ['Valor', payload.valor || payload.valorPago || payload.total],
    ['Data do evento', payload.data || payload.dataAgendamento || notificacao.data],
    ['Horário', payload.horario || payload.horaInicio],
    ['Referência', notificacao.referenciaId || payload.referenciaId || payload.id || payload.document_id],
    ['Tabela', notificacao.referenciaTabela || payload.referenciaTabela || payload.tabela],
  ];

  return detalhes.filter(([, valor]) => valor !== undefined && valor !== null && valor !== '');
};
