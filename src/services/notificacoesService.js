// src/services/notificacoesService.js
import { firebaseService } from './firebase';
import { browserPushService } from './browserPushService';

const parseUsuarioLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario') || '{}');
  } catch {
    return {};
  }
};

const usuarioIds = (usuarioId, usuario = parseUsuarioLocal()) => Array.from(new Set([
  usuarioId,
  usuario?.id,
  usuario?.uid,
  usuario?.authUid,
  usuario?.email,
].filter(Boolean).map(String)));

const notificacaoPertenceAoUsuario = (notificacao, ids, usuario = parseUsuarioLocal()) => {
  const idsSet = new Set(ids);
  const cargo = usuario?.cargo || usuario?.role || usuario?.perfil;

  const camposDiretos = [
    notificacao.usuarioId,
    notificacao.userId,
    notificacao.uid,
    notificacao.destinatarioId,
    notificacao.paraUsuarioId,
    notificacao.adminId,
    notificacao.profissionalId,
    notificacao.email,
  ].filter(Boolean).map(String);

  const destinatarios = [
    notificacao.destinatarios,
    notificacao.destinatarioIds,
    notificacao.usuarios,
    notificacao.usuarioIds,
  ].flatMap((lista) => Array.isArray(lista) ? lista : []).filter(Boolean).map(String);

  const cargos = [notificacao.cargo, notificacao.perfil, notificacao.cargos, notificacao.roles]
    .flatMap((lista) => Array.isArray(lista) ? lista : [lista])
    .filter(Boolean)
    .map(String);

  const broadcast = notificacao.todos === true || notificacao.broadcast === true || notificacao.tipoDestinatario === 'todos';

  return broadcast || [...camposDiretos, ...destinatarios].some((id) => idsSet.has(id)) || (cargo && cargos.includes(String(cargo)));
};

const deduplicarNotificacoes = (notificacoes) => Array.from(new Map(
  (notificacoes || []).filter(Boolean).map((item) => [item.id || `${item.tipo}-${item.data}-${item.titulo}`, item])
).values());

const consultarNotificacoesPorCampos = async (ids, usuario) => {
  const campos = [
    'usuarioId',
    'userId',
    'uid',
    'destinatarioId',
    'paraUsuarioId',
    'adminId',
    'profissionalId',
    'email',
  ];

  const cargo = usuario?.cargo || usuario?.role || usuario?.perfil;
  const consultasUsuario = ids.flatMap((id) => campos.map((field) => firebaseService.query('notificacoes', [
    { field, operator: '==', value: id },
  ], 'data').catch(() => [])));

  const consultasGerais = [
    firebaseService.query('notificacoes', [{ field: 'todos', operator: '==', value: true }], 'data').catch(() => []),
    firebaseService.query('notificacoes', [{ field: 'broadcast', operator: '==', value: true }], 'data').catch(() => []),
    firebaseService.query('notificacoes', [{ field: 'tipoDestinatario', operator: '==', value: 'todos' }], 'data').catch(() => []),
  ];

  if (cargo) {
    consultasGerais.push(
      firebaseService.query('notificacoes', [{ field: 'cargo', operator: '==', value: cargo }], 'data').catch(() => []),
      firebaseService.query('notificacoes', [{ field: 'perfil', operator: '==', value: cargo }], 'data').catch(() => [])
    );
  }

  const consultas = await Promise.all([...consultasUsuario, ...consultasGerais]);

  return consultas.flat();
};

const getAllNotificacoesFiltradas = async (ids, usuario) => {
  const todas = await firebaseService.getAll('notificacoes').catch(() => []);
  return todas.filter((notificacao) => notificacaoPertenceAoUsuario(notificacao, ids, usuario));
};

export const notificacoesService = {
  // Listar notificações de um usuário
  listar: async (usuarioId) => {
    try {
      const usuario = parseUsuarioLocal();
      const ids = usuarioIds(usuarioId, usuario);
      console.log('🔍 Buscando notificações para usuário:', ids);

      if (ids.length === 0) return [];

      const consultasDiretas = await consultarNotificacoesPorCampos(ids, usuario);
      const notificacoesDiretas = consultasDiretas.filter((notificacao) =>
        notificacaoPertenceAoUsuario(notificacao, ids, usuario)
      );

      let notificacoes = deduplicarNotificacoes([
        ...consultasDiretas,
        ...notificacoesDiretas,
      ]);

      // Fallback controlado: só busca a coleção inteira se nenhuma consulta indexada retornou dados.
      if (notificacoes.length === 0) {
        notificacoes = deduplicarNotificacoes(await getAllNotificacoesFiltradas(ids, usuario));
      }

      console.log('✅ Notificações encontradas:', notificacoes.length);

      // Ordenar por data (mais recentes primeiro)
      const notificacoesOrdenadas = notificacoes.sort((a, b) => {
        const dateA = a.createdAt || a.data ? new Date(a.createdAt || a.data) : new Date(0);
        const dateB = b.createdAt || b.data ? new Date(b.createdAt || b.data) : new Date(0);
        return dateB - dateA;
      });

      return notificacoesOrdenadas;
    } catch (error) {
      console.error('❌ Erro ao listar notificações:', error);
      return [];
    }
  },

  // Marcar notificação como lida
  marcarComoLida: async (id) => {
    try {
      await firebaseService.update('notificacoes', id, {
        lida: true,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Notificação marcada como lida:', id);

      // Disparar evento para atualizar header
      window.dispatchEvent(new CustomEvent('notificacoesAtualizadas'));

      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação:', error);
      return false;
    }
  },

  // Marcar todas como lidas
  marcarTodasComoLidas: async (usuarioId) => {
    try {
      const notificacoesNaoLidas = (await notificacoesService.listar(usuarioId)).filter((notif) => !notif.lida);

      const promises = notificacoesNaoLidas.map(notif =>
        firebaseService.update('notificacoes', notif.id, {
          lida: true,
          updatedAt: new Date().toISOString()
        })
      );

      await Promise.all(promises);
      console.log(`✅ ${notificacoesNaoLidas.length} notificações marcadas como lidas`);

      window.dispatchEvent(new CustomEvent('notificacoesAtualizadas'));

      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
      return false;
    }
  },

  // Excluir notificação
  excluir: async (id) => {
    try {
      await firebaseService.delete('notificacoes', id);
      console.log('✅ Notificação excluída:', id);

      window.dispatchEvent(new CustomEvent('notificacoesAtualizadas'));

      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir notificação:', error);
      return false;
    }
  },

  // Excluir todas as notificações de um usuário
  excluirTodas: async (usuarioId) => {
    try {
      const notificacoes = await notificacoesService.listar(usuarioId);

      const promises = notificacoes.map(notif =>
        firebaseService.delete('notificacoes', notif.id)
      );

      await Promise.all(promises);
      console.log(`✅ ${notificacoes.length} notificações excluídas`);

      window.dispatchEvent(new CustomEvent('notificacoesAtualizadas'));

      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir todas:', error);
      return false;
    }
  },

  // Contar notificações não lidas
  contarNaoLidas: async (usuarioId) => {
    try {
      const notificacoesNaoLidas = (await notificacoesService.listar(usuarioId)).filter((notif) => !notif.lida);

      return notificacoesNaoLidas.length;
    } catch (error) {
      console.error('❌ Erro ao contar notificações:', error);
      return 0;
    }
  },

  // Criar notificação base
  criar: async (dados) => {
    try {
      const agora = new Date();

      const novaNotificacao = {
        ...dados,
        lida: false,
        data: agora.toISOString(),
        createdAt: agora.toISOString(),
        updatedAt: agora.toISOString()
      };

      console.log('📝 Criando notificação:', novaNotificacao);

      const result = await firebaseService.add('notificacoes', novaNotificacao);
      console.log('✅ Notificação criada com ID:', result.id);

      await browserPushService.notificarNotificacaoCriada(
        { ...novaNotificacao, id: result.id },
        { tipoUsuario: 'admin', colecaoOrigem: 'notificacoes', defaultLink: '/notificacoes' }
      );

      // Disparar eventos para atualizar header
      window.dispatchEvent(new CustomEvent('novaNotificacao'));
      window.dispatchEvent(new CustomEvent('notificacoesAtualizadas'));

      return { ...novaNotificacao, id: result.id };
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  },

  // ===========================================
  // 🔥 NOTIFICAÇÕES DE FORMULÁRIOS DE ANAMNESE
  // ===========================================

  // 🔥 NOTIFICAÇÃO DE FORMULÁRIO PENDENTE PARA FUNCIONÁRIO
  notificarFormularioPendente: async (agendamento, usuarioId) => {
    try {
      console.log('📨 Criando notificação de formulário pendente para funcionário:', {
        agendamentoId: agendamento.id,
        usuarioId
      });

      const [cliente, profissional, servico] = await Promise.all([
        firebaseService.getById('clientes', agendamento.clienteId).catch(() => null),
        firebaseService.getById('profissionais', agendamento.profissionalId).catch(() => null),
        firebaseService.getById('servicos', agendamento.servicoId).catch(() => null)
      ]);

      const dataObj = new Date(agendamento.data + 'T12:00:00');
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      const agora = new Date().toLocaleString('pt-BR');

      const linkCorreto = '/anamnese/respostas';

      const notificacao = {
        usuarioId,
        tipo: 'anamnese',
        titulo: '📋 Formulário de Anamnese Pendente',
        mensagem: `${cliente?.nome || agendamento.clienteNome} precisa preencher o formulário para o atendimento de ${servico?.nome || agendamento.servicoNome} no dia ${dataFormatada} às ${agendamento.horario}`,
        icone: 'assignment',
        link: linkCorreto,
        prioridade: 'alta',
        detalhes: {
          agendamentoId: agendamento.id,
          clienteId: agendamento.clienteId,
          clienteNome: cliente?.nome || agendamento.clienteNome,
          clienteEmail: cliente?.email || 'Não informado',
          clienteTelefone: cliente?.telefone || 'Não informado',
          profissionalId: agendamento.profissionalId,
          profissionalNome: profissional?.nome || agendamento.profissionalNome,
          servicoId: agendamento.servicoId,
          servicoNome: servico?.nome || agendamento.servicoNome,
          data: agendamento.data,
          dataFormatada,
          horario: agendamento.horario,
          status: 'pendente',
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de formulário pendente:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE FORMULÁRIO RESPONDIDO PARA PROFISSIONAL
  notificarFormularioRespondido: async (resposta, usuarioId) => {
    try {
      console.log('📨 Criando notificação de formulário respondido para profissional:', {
        respostaId: resposta.id,
        usuarioId
      });

      const [cliente, profissional] = await Promise.all([
        firebaseService.getById('clientes', resposta.clienteId).catch(() => null),
        firebaseService.getById('profissionais', resposta.profissionalId).catch(() => null)
      ]);

      const dataObj = new Date(resposta.respondidoEm);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const agora = new Date().toLocaleString('pt-BR');

      const linkCorreto = `/anamnese/resposta/${resposta.id}`;

      const notificacao = {
        usuarioId,
        tipo: 'anamnese',
        titulo: '✅ Formulário de Anamnese Respondido',
        mensagem: `${cliente?.nome || resposta.clienteNome} respondeu o formulário de ${resposta.formularioTitulo}`,
        icone: 'check_circle',
        link: linkCorreto,
        prioridade: 'media',
        detalhes: {
          respostaId: resposta.id,
          formularioId: resposta.formularioId,
          formularioTitulo: resposta.formularioTitulo,
          clienteId: resposta.clienteId,
          clienteNome: cliente?.nome || resposta.clienteNome,
          profissionalId: resposta.profissionalId,
          profissionalNome: profissional?.nome || resposta.profissionalNome,
          servicoId: resposta.servicoId,
          servicoNome: resposta.servicoNome,
          respondidoEm: resposta.respondidoEm,
          dataFormatada,
          horaFormatada,
          status: 'respondido',
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de formulário respondido:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE LEMBRETE PARA CLIENTE PREENCHER FORMULÁRIO
  notificarClienteFormularioPendente: async (agendamento, clienteId) => {
    try {
      console.log('📨 Criando notificação para cliente sobre formulário pendente:', {
        agendamentoId: agendamento.id,
        clienteId
      });

      const [servico] = await Promise.all([
        firebaseService.getById('servicos', agendamento.servicoId).catch(() => null)
      ]);

      const dataObj = new Date(agendamento.data + 'T12:00:00');
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      const agora = new Date().toLocaleString('pt-BR');

      const linkCorreto = `/cliente/agendamento/${agendamento.id}/anamnese`;

      const notificacao = {
        usuarioId: clienteId,
        tipo: 'formulario',
        titulo: '📝 Formulário para Preencher',
        mensagem: `Você tem um formulário de anamnese para preencher antes do seu atendimento de ${servico?.nome || agendamento.servicoNome} no dia ${dataFormatada} às ${agendamento.horario}`,
        icone: 'assignment',
        link: linkCorreto,
        prioridade: 'alta',
        detalhes: {
          agendamentoId: agendamento.id,
          servicoId: agendamento.servicoId,
          servicoNome: servico?.nome || agendamento.servicoNome,
          data: agendamento.data,
          dataFormatada,
          horario: agendamento.horario,
          profissionalNome: agendamento.profissionalNome,
          status: 'pendente',
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação para cliente:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE LEMBRETE PARA CLIENTE (24h antes)
  notificarLembreteCliente: async (agendamento, clienteId) => {
    try {
      console.log('📨 Criando lembrete para cliente:', { agendamentoId: agendamento.id, clienteId });

      const dataObj = new Date(agendamento.data + 'T12:00:00');
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      const agora = new Date().toLocaleString('pt-BR');

      const linkCorreto = '/cliente/agendamentos';

      const notificacao = {
        usuarioId: clienteId,
        tipo: 'lembrete',
        titulo: '⏰ Lembrete de Agendamento',
        mensagem: `Você tem um agendamento amanhã às ${agendamento.horario} para ${agendamento.servicoNome} com ${agendamento.profissionalNome}`,
        icone: 'alarm',
        link: linkCorreto,
        prioridade: 'media',
        detalhes: {
          agendamentoId: agendamento.id,
          data: agendamento.data,
          dataFormatada,
          horario: agendamento.horario,
          servicoNome: agendamento.servicoNome,
          profissionalNome: agendamento.profissionalNome,
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar lembrete para cliente:', error);
      return null;
    }
  },

  // ===========================================
  // NOTIFICAÇÕES EXISTENTES (MANTIDAS)
  // ===========================================

  // 🔥 NOTIFICAÇÃO DE AGENDAMENTO
  notificarAgendamento: async (agendamento, usuarioId) => {
    try {
      console.log('📨 Criando notificação de agendamento:', { agendamentoId: agendamento.id, usuarioId });

      const [cliente, profissional, servico] = await Promise.all([
        firebaseService.getById('clientes', agendamento.clienteId).catch(() => null),
        firebaseService.getById('profissionais', agendamento.profissionalId).catch(() => null),
        firebaseService.getById('servicos', agendamento.servicoId).catch(() => null)
      ]);

      const dataObj = new Date(agendamento.data);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      const agora = new Date().toLocaleString('pt-BR');

      const linkCorreto = '/agendamentos';

      const notificacao = {
        usuarioId,
        tipo: 'agendamento',
        titulo: '📅 Novo Agendamento',
        mensagem: `${cliente?.nome || agendamento.clienteNome} agendou ${servico?.nome || agendamento.servicoNome} com ${profissional?.nome || agendamento.profissionalNome} para ${dataFormatada} às ${agendamento.horario}`,
        icone: 'event',
        link: linkCorreto,
        prioridade: 'media',
        detalhes: {
          id: agendamento.id,
          data: agendamento.data,
          dataFormatada,
          horario: agendamento.horario,
          status: agendamento.status || 'pendente',
          observacoes: agendamento.observacoes || 'Sem observações',
          origem: agendamento.origem || 'sistema',
          clienteId: agendamento.clienteId,
          clienteNome: cliente?.nome || agendamento.clienteNome,
          clienteEmail: cliente?.email || 'Não informado',
          clienteTelefone: cliente?.telefone || 'Não informado',
          profissionalId: agendamento.profissionalId,
          profissionalNome: profissional?.nome || agendamento.profissionalNome,
          servicoId: agendamento.servicoId,
          servicoNome: servico?.nome || agendamento.servicoNome,
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de agendamento:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE AGENDAMENTO DO SITE
  notificarAgendamentoSite: async (agendamento, usuarioId) => {
    try {
      console.log('📨 Criando notificação de agendamento do site:', { agendamentoId: agendamento.id, usuarioId });

      const dataObj = new Date(agendamento.data);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      const agora = new Date().toLocaleString('pt-BR');

      const linkCorreto = '/agendamentos';

      const notificacao = {
        usuarioId,
        tipo: 'agendamento',
        titulo: '🌐 Novo Agendamento pelo Site',
        mensagem: `${agendamento.clienteNome} agendou ${agendamento.servicoNome} com ${agendamento.profissionalNome} para ${dataFormatada} às ${agendamento.horario}`,
        icone: 'public',
        link: linkCorreto,
        prioridade: 'media',
        detalhes: {
          id: agendamento.id,
          data: agendamento.data,
          dataFormatada,
          horario: agendamento.horario,
          status: agendamento.status || 'pendente',
          observacoes: agendamento.observacoes || 'Sem observações',
          origem: 'site',
          clienteNome: agendamento.clienteNome,
          clienteEmail: agendamento.clienteEmail,
          clienteTelefone: agendamento.clienteTelefone,
          profissionalNome: agendamento.profissionalNome,
          servicoNome: agendamento.servicoNome,
          servicoPreco: agendamento.valor || 0,
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de agendamento do site:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE NOVO CLIENTE
  notificarNovoCliente: async (cliente, usuarioId) => {
    try {
      console.log('📨 Criando notificação de novo cliente:', { clienteId: cliente.id, usuarioId });

      const agora = new Date().toLocaleString('pt-BR');
      const linkCorreto = '/clientes';

      const notificacao = {
        usuarioId,
        tipo: 'cliente',
        titulo: '👤 Novo Cliente Cadastrado',
        mensagem: `${cliente.nome} se cadastrou no sistema`,
        icone: 'person',
        link: linkCorreto,
        prioridade: 'baixa',
        detalhes: {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email || 'Não informado',
          telefone: cliente.telefone || 'Não informado',
          celular: cliente.celular || 'Não informado',
          cpf: cliente.cpf || 'Não informado',
          dataNascimento: cliente.dataNascimento || 'Não informada',
          status: cliente.status || 'Regular',
          dataCadastro: cliente.dataCadastro,
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de novo cliente:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE ESTOQUE BAIXO
  notificarEstoqueBaixo: async (produto, usuarioId) => {
    try {
      console.log('📨 Criando notificação de estoque baixo:', { produtoId: produto.id, usuarioId });

      const agora = new Date().toLocaleString('pt-BR');
      const linkCorreto = '/estoque';

      const notificacao = {
        usuarioId,
        tipo: 'estoque',
        titulo: '⚠️ Alerta de Estoque Baixo',
        mensagem: `${produto.nome} - Estoque: ${produto.quantidadeEstoque} unidades (Mínimo: ${produto.estoqueMinimo || 5})`,
        icone: 'warning',
        link: linkCorreto,
        prioridade: 'alta',
        detalhes: {
          id: produto.id,
          nome: produto.nome,
          codigo: produto.codigo || 'Não informado',
          categoria: produto.categoria || 'Não informada',
          quantidadeEstoque: produto.quantidadeEstoque,
          estoqueMinimo: produto.estoqueMinimo || 5,
          precoCusto: produto.precoCusto,
          precoVenda: produto.precoVenda,
          localizacao: produto.localizacao || 'Não informada',
          fornecedor: produto.fornecedor || 'Não informado',
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de estoque:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE PAGAMENTO
  notificarPagamento: async (pagamento, usuarioId) => {
    try {
      console.log('📨 Criando notificação de pagamento:', { pagamentoId: pagamento.id, usuarioId });

      const [cliente] = await Promise.all([
        firebaseService.getById('clientes', pagamento.clienteId).catch(() => null)
      ]);

      const formasPagamento = {
        dinheiro: '💵 Dinheiro',
        cartao_credito: '💳 Cartão de Crédito',
        cartao_debito: '💳 Cartão de Débito',
        pix: '📱 PIX',
        boleto: '📄 Boleto',
        transferencia: '🏦 Transferência'
      };

      const dataObj = new Date(pagamento.data);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      const agora = new Date().toLocaleString('pt-BR');
      const linkCorreto = '/financeiro/receber';

      const notificacao = {
        usuarioId,
        tipo: 'pagamento',
        titulo: '💰 Novo Pagamento Recebido',
        mensagem: `${cliente?.nome || 'Cliente'} - R$ ${pagamento.valor?.toFixed(2)} (${formasPagamento[pagamento.formaPagamento] || pagamento.formaPagamento})`,
        icone: 'payment',
        link: linkCorreto,
        prioridade: 'media',
        detalhes: {
          id: pagamento.id,
          atendimentoId: pagamento.atendimentoId,
          clienteNome: cliente?.nome || 'Não informado',
          clienteId: pagamento.clienteId,
          valor: pagamento.valor,
          formaPagamento: pagamento.formaPagamento,
          formaPagamentoLabel: formasPagamento[pagamento.formaPagamento] || pagamento.formaPagamento,
          parcelas: pagamento.parcelas || 1,
          status: pagamento.status,
          data: pagamento.data,
          dataFormatada,
          observacoes: pagamento.observacoes || 'Sem observações',
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de pagamento:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE ATENDIMENTO INICIADO
  notificarAtendimentoIniciado: async (atendimento, usuarioId) => {
    try {
      console.log('📨 Criando notificação de atendimento iniciado:', { atendimentoId: atendimento.id, usuarioId });

      const [cliente, profissional] = await Promise.all([
        firebaseService.getById('clientes', atendimento.clienteId).catch(() => null),
        firebaseService.getById('profissionais', atendimento.profissionalId).catch(() => null)
      ]);

      const agora = new Date().toLocaleString('pt-BR');
      const linkCorreto = `/atendimento/${atendimento.id}`;

      const notificacao = {
        usuarioId,
        tipo: 'atendimento',
        titulo: '▶️ Atendimento Iniciado',
        mensagem: `${cliente?.nome || 'Cliente'} - ${atendimento.servicos?.[0]?.nome || 'Serviço'} com ${profissional?.nome || 'Profissional'}`,
        icone: 'play',
        link: linkCorreto,
        prioridade: 'media',
        detalhes: {
          id: atendimento.id,
          agendamentoId: atendimento.agendamentoId,
          clienteNome: cliente?.nome || 'Não informado',
          profissionalNome: profissional?.nome || 'Não informado',
          data: atendimento.data,
          horaInicio: atendimento.horaInicio,
          status: atendimento.status,
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de atendimento iniciado:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE ATENDIMENTO FINALIZADO
  notificarAtendimentoFinalizado: async (atendimento, usuarioId) => {
    try {
      console.log('📨 Criando notificação de atendimento finalizado:', { atendimentoId: atendimento.id, usuarioId });

      const [cliente, profissional] = await Promise.all([
        firebaseService.getById('clientes', atendimento.clienteId).catch(() => null),
        firebaseService.getById('profissionais', atendimento.profissionalId).catch(() => null)
      ]);

      const agora = new Date().toLocaleString('pt-BR');
      const linkCorreto = `/atendimento/${atendimento.id}`;

      const notificacao = {
        usuarioId,
        tipo: 'atendimento',
        titulo: '✅ Atendimento Finalizado',
        mensagem: `${cliente?.nome || 'Cliente'} - Total: R$ ${atendimento.valorTotal?.toFixed(2)}`,
        icone: 'check',
        link: linkCorreto,
        prioridade: 'media',
        detalhes: {
          id: atendimento.id,
          agendamentoId: atendimento.agendamentoId,
          clienteNome: cliente?.nome || 'Não informado',
          profissionalNome: profissional?.nome || 'Não informado',
          data: atendimento.data,
          horaInicio: atendimento.horaInicio,
          horaFim: atendimento.horaFim,
          valorTotal: atendimento.valorTotal || 0,
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de atendimento finalizado:', error);
      return null;
    }
  },

  // 🔥 NOTIFICAÇÃO DE LEMBRETE (para funcionários)
  notificarLembrete: async (agendamento, usuarioId) => {
    try {
      console.log('📨 Criando notificação de lembrete:', { agendamentoId: agendamento.id, usuarioId });

      const dataObj = new Date(agendamento.data);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');
      const agora = new Date().toLocaleString('pt-BR');

      const linkCorreto = '/agendamentos';

      const notificacao = {
        usuarioId,
        tipo: 'lembrete',
        titulo: '⏰ Lembrete de Agendamento',
        mensagem: `Agendamento amanhã: ${agendamento.clienteNome} - ${agendamento.servicoNome} com ${agendamento.profissionalNome} às ${agendamento.horario}`,
        icone: 'alarm',
        link: linkCorreto,
        prioridade: 'media',
        detalhes: {
          id: agendamento.id,
          data: agendamento.data,
          dataFormatada,
          horario: agendamento.horario,
          clienteNome: agendamento.clienteNome,
          servicoNome: agendamento.servicoNome,
          profissionalNome: agendamento.profissionalNome,
          criadoEm: agora,
          link: linkCorreto
        }
      };

      return notificacoesService.criar(notificacao);
    } catch (error) {
      console.error('❌ Erro ao criar notificação de lembrete:', error);
      return null;
    }
  }
};

export default notificacoesService;
