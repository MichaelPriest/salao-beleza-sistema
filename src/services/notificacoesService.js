// src/services/notificacoesService.js
import { firebaseService } from './firebase';

export const notificacoesService = {
  // Listar notificações de um usuário
  listar: async (usuarioId) => {
    try {
      console.log('🔍 Buscando notificações para usuário:', usuarioId);
      
      const notificacoes = await firebaseService.query('notificacoes', [
        { field: 'usuarioId', operator: '==', value: usuarioId }
      ], 'data');
      
      console.log('✅ Notificações encontradas:', notificacoes);
      
      const notificacoesOrdenadas = notificacoes.sort((a, b) => 
        new Date(b.data) - new Date(a.data)
      );
      
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
      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação:', error);
      return false;
    }
  },

  // Marcar todas como lidas
  marcarTodasComoLidas: async (usuarioId) => {
    try {
      const notificacoesNaoLidas = await firebaseService.query('notificacoes', [
        { field: 'usuarioId', operator: '==', value: usuarioId },
        { field: 'lida', operator: '==', value: false }
      ]);
      
      const promises = notificacoesNaoLidas.map(notif => 
        firebaseService.update('notificacoes', notif.id, { 
          lida: true,
          updatedAt: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      console.log(`✅ ${notificacoesNaoLidas.length} notificações marcadas como lidas`);
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
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir notificação:', error);
      return false;
    }
  },

  // Excluir todas as notificações de um usuário
  excluirTodas: async (usuarioId) => {
    try {
      const notificacoes = await firebaseService.query('notificacoes', [
        { field: 'usuarioId', operator: '==', value: usuarioId }
      ]);
      
      const promises = notificacoes.map(notif => 
        firebaseService.delete('notificacoes', notif.id)
      );
      
      await Promise.all(promises);
      console.log(`✅ ${notificacoes.length} notificações excluídas`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir todas:', error);
      return false;
    }
  },

  // Contar notificações não lidas
  contarNaoLidas: async (usuarioId) => {
    try {
      const notificacoesNaoLidas = await firebaseService.query('notificacoes', [
        { field: 'usuarioId', operator: '==', value: usuarioId },
        { field: 'lida', operator: '==', value: false }
      ]);
      
      return notificacoesNaoLidas.length;
    } catch (error) {
      console.error('❌ Erro ao contar notificações:', error);
      return 0;
    }
  },

  // Criar notificação base
  criar: async (dados) => {
    try {
      const novaNotificacao = {
        ...dados,
        lida: false,
        data: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await firebaseService.add('notificacoes', novaNotificacao);
      console.log('✅ Notificação criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  },

  // 🔥 NOTIFICAÇÃO DE AGENDAMENTO COM TODOS OS DADOS
  notificarAgendamento: async (agendamento, usuarioId) => {
    // Buscar dados completos
    const [cliente, profissional, servico] = await Promise.all([
      firebaseService.getById('clientes', agendamento.clienteId).catch(() => null),
      firebaseService.getById('profissionais', agendamento.profissionalId).catch(() => null),
      firebaseService.getById('servicos', agendamento.servicoId).catch(() => null)
    ]);

    const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR');
    const agora = new Date().toLocaleString('pt-BR');

    return notificacoesService.criar({
      usuarioId,
      tipo: 'agendamento',
      titulo: '📅 Novo Agendamento',
      mensagem: `${cliente?.nome || 'Cliente'} agendou ${servico?.nome || 'serviço'} com ${profissional?.nome || 'profissional'} para ${dataFormatada} às ${agendamento.horario}`,
      detalhes: {
        // Dados do agendamento
        id: agendamento.id,
        data: agendamento.data,
        dataFormatada,
        horario: agendamento.horario,
        status: agendamento.status,
        observacoes: agendamento.observacoes || 'Sem observações',
        origem: agendamento.origem || 'sistema',
        
        // Dados do cliente
        clienteId: agendamento.clienteId,
        clienteNome: cliente?.nome || 'Não informado',
        clienteEmail: cliente?.email || 'Não informado',
        clienteTelefone: cliente?.telefone || 'Não informado',
        
        // Dados do profissional
        profissionalId: agendamento.profissionalId,
        profissionalNome: profissional?.nome || 'Não informado',
        profissionalEspecialidade: profissional?.especialidade || 'Não informada',
        
        // Dados do serviço
        servicoId: agendamento.servicoId,
        servicoNome: servico?.nome || 'Não informado',
        servicoPreco: servico?.preco || 0,
        servicoDuracao: servico?.duracao || 0,
        
        // Metadados
        criadoEm: agora,
        link: `/agendamentos/${agendamento.id}`
      },
      link: `/agendamentos/${agendamento.id}`,
      icone: 'event'
    });
  },

  // 🔥 NOTIFICAÇÃO DE AGENDAMENTO DO SITE
  notificarAgendamentoSite: async (agendamento, usuarioId) => {
    const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR');
    const agora = new Date().toLocaleString('pt-BR');

    return notificacoesService.criar({
      usuarioId,
      tipo: 'agendamento',
      titulo: '🌐 Novo Agendamento pelo Site',
      mensagem: `${agendamento.clienteNome} agendou ${agendamento.servicoNome} com ${agendamento.profissionalNome} para ${dataFormatada} às ${agendamento.horario}`,
      detalhes: {
        // Dados do agendamento
        id: agendamento.id,
        data: agendamento.data,
        dataFormatada,
        horario: agendamento.horario,
        status: agendamento.status,
        observacoes: agendamento.observacoes || 'Sem observações',
        origem: 'site',
        
        // Dados do cliente
        clienteNome: agendamento.clienteNome,
        clienteEmail: agendamento.clienteEmail,
        clienteTelefone: agendamento.clienteTelefone,
        
        // Dados do profissional
        profissionalNome: agendamento.profissionalNome,
        
        // Dados do serviço
        servicoNome: agendamento.servicoNome,
        servicoPreco: agendamento.valor || 0,
        
        // Metadados
        criadoEm: agora,
        link: `/agendamentos/${agendamento.id}`
      },
      link: `/agendamentos/${agendamento.id}`,
      icone: 'public'
    });
  },

  // 🔥 NOTIFICAÇÃO DE LEMBRETE
  notificarLembrete: async (agendamento, usuarioId) => {
    const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR');
    const agora = new Date().toLocaleString('pt-BR');

    return notificacoesService.criar({
      usuarioId,
      tipo: 'lembrete',
      titulo: '⏰ Lembrete de Agendamento',
      mensagem: `Você tem um agendamento amanhã às ${agendamento.horario}`,
      detalhes: {
        id: agendamento.id,
        data: agendamento.data,
        dataFormatada,
        horario: agendamento.horario,
        clienteNome: agendamento.clienteNome,
        servicoNome: agendamento.servicoNome,
        profissionalNome: agendamento.profissionalNome,
        criadoEm: agora,
        link: `/agendamentos/${agendamento.id}`
      },
      link: `/agendamentos/${agendamento.id}`,
      icone: 'alarm'
    });
  },

  // 🔥 NOTIFICAÇÃO DE NOVO CLIENTE
  notificarNovoCliente: async (cliente, usuarioId) => {
    const agora = new Date().toLocaleString('pt-BR');

    return notificacoesService.criar({
      usuarioId,
      tipo: 'cliente',
      titulo: '👤 Novo Cliente Cadastrado',
      mensagem: `${cliente.nome} se cadastrou no sistema`,
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
        link: `/clientes/${cliente.id}`
      },
      link: `/clientes/${cliente.id}`,
      icone: 'person'
    });
  },

  // 🔥 NOTIFICAÇÃO DE ESTOQUE BAIXO
  notificarEstoqueBaixo: async (produto, usuarioId) => {
    const agora = new Date().toLocaleString('pt-BR');

    return notificacoesService.criar({
      usuarioId,
      tipo: 'estoque',
      titulo: '⚠️ Alerta de Estoque Baixo',
      mensagem: `${produto.nome} - Estoque: ${produto.quantidadeEstoque} unidades (Mínimo: ${produto.estoqueMinimo || 5})`,
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
        link: `/estoque`
      },
      link: `/estoque`,
      icone: 'warning'
    });
  },

  // 🔥 NOTIFICAÇÃO DE PAGAMENTO
  notificarPagamento: async (pagamento, usuarioId) => {
    const [cliente, atendimento] = await Promise.all([
      firebaseService.getById('clientes', pagamento.clienteId).catch(() => null),
      firebaseService.getById('atendimentos', pagamento.atendimentoId).catch(() => null)
    ]);

    const formasPagamento = {
      dinheiro: '💵 Dinheiro',
      cartao_credito: '💳 Cartão de Crédito',
      cartao_debito: '💳 Cartão de Débito',
      pix: '📱 PIX',
      boleto: '📄 Boleto',
      transferencia: '🏦 Transferência'
    };

    const dataFormatada = new Date(pagamento.data).toLocaleDateString('pt-BR');
    const agora = new Date().toLocaleString('pt-BR');

    return notificacoesService.criar({
      usuarioId,
      tipo: 'pagamento',
      titulo: '💰 Novo Pagamento Recebido',
      mensagem: `${cliente?.nome || 'Cliente'} - R$ ${pagamento.valor?.toFixed(2)} (${formasPagamento[pagamento.formaPagamento] || pagamento.formaPagamento})`,
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
        link: `/financeiro/receber`
      },
      link: `/financeiro/receber`,
      icone: 'payment'
    });
  },

  // 🔥 NOTIFICAÇÃO DE ATENDIMENTO INICIADO
  notificarAtendimentoIniciado: async (atendimento, usuarioId) => {
    const [cliente, profissional, servico] = await Promise.all([
      firebaseService.getById('clientes', atendimento.clienteId).catch(() => null),
      firebaseService.getById('profissionais', atendimento.profissionalId).catch(() => null),
      firebaseService.getById('servicos', atendimento.servicoId).catch(() => null)
    ]);

    const agora = new Date().toLocaleString('pt-BR');

    return notificacoesService.criar({
      usuarioId,
      tipo: 'atendimento',
      titulo: '▶️ Atendimento Iniciado',
      mensagem: `${cliente?.nome || 'Cliente'} - ${servico?.nome || 'Serviço'} com ${profissional?.nome || 'Profissional'}`,
      detalhes: {
        id: atendimento.id,
        agendamentoId: atendimento.agendamentoId,
        clienteNome: cliente?.nome || 'Não informado',
        profissionalNome: profissional?.nome || 'Não informado',
        servicoNome: servico?.nome || 'Não informado',
        servicoPreco: servico?.preco || 0,
        data: atendimento.data,
        horaInicio: atendimento.horaInicio,
        status: atendimento.status,
        criadoEm: agora,
        link: `/atendimento/${atendimento.id}`
      },
      link: `/atendimento/${atendimento.id}`,
      icone: 'play'
    });
  },

  // 🔥 NOTIFICAÇÃO DE ATENDIMENTO FINALIZADO
  notificarAtendimentoFinalizado: async (atendimento, usuarioId) => {
    const [cliente, profissional] = await Promise.all([
      firebaseService.getById('clientes', atendimento.clienteId).catch(() => null),
      firebaseService.getById('profissionais', atendimento.profissionalId).catch(() => null)
    ]);

    const agora = new Date().toLocaleString('pt-BR');
    const totalServicos = atendimento.itensServico?.reduce((acc, item) => acc + (item.preco || 0), 0) || 0;
    const totalProdutos = atendimento.itensProduto?.reduce((acc, item) => acc + ((item.preco || 0) * (item.quantidade || 1)), 0) || 0;

    return notificacoesService.criar({
      usuarioId,
      tipo: 'atendimento',
      titulo: '✅ Atendimento Finalizado',
      mensagem: `${cliente?.nome || 'Cliente'} - Total: R$ ${atendimento.valorTotal?.toFixed(2)}`,
      detalhes: {
        id: atendimento.id,
        agendamentoId: atendimento.agendamentoId,
        clienteNome: cliente?.nome || 'Não informado',
        profissionalNome: profissional?.nome || 'Não informado',
        data: atendimento.data,
        horaInicio: atendimento.horaInicio,
        horaFim: atendimento.horaFim,
        totalServicos: totalServicos,
        totalProdutos: totalProdutos,
        valorTotal: atendimento.valorTotal || 0,
        servicos: atendimento.itensServico || [],
        produtos: atendimento.itensProduto || [],
        observacoes: atendimento.observacoes || 'Sem observações',
        criadoEm: agora,
        link: `/atendimento/${atendimento.id}`
      },
      link: `/atendimento/${atendimento.id}`,
      icone: 'check'
    });
  }
};

export default notificacoesService;
