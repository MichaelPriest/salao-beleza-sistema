import api from './api';

export const notificacoesService = {
  // Listar notificações de um usuário
  listar: async (usuarioId) => {
    try {
      console.log('🔍 Buscando notificações para usuário:', usuarioId);
      
      if (!usuarioId) {
        console.log('⚠️ Usuário não informado, retornando lista vazia');
        return [];
      }
      
      // Tentar buscar por usuárioId
      const response = await api.get(`/notificacoes?usuarioId=${usuarioId}`);
      
      console.log('✅ Notificações encontradas:', response.data);
      
      // Verificar se response.data é array
      if (!Array.isArray(response.data)) {
        console.log('⚠️ Resposta não é um array, retornando lista vazia');
        return [];
      }
      
      // Ordenar por data (mais recentes primeiro)
      const notificacoes = response.data.sort((a, b) => {
        const dataA = a.data ? new Date(a.data) : new Date(0);
        const dataB = b.data ? new Date(b.data) : new Date(0);
        return dataB - dataA;
      });
      
      return notificacoes;
      
    } catch (error) {
      console.error('❌ Erro ao listar notificações:', error);
      
      // Verificar tipo de erro
      if (error.code === 'ECONNABORTED') {
        console.log('⏰ Timeout - servidor demorou para responder');
      } else if (error.message.includes('Network Error')) {
        console.log('🔌 Erro de rede - servidor não está acessível');
        console.log('👉 Verifique se o JSON Server está rodando em http://localhost:3001');
      } else if (error.response) {
        console.log(`📡 Status: ${error.response.status}`);
        if (error.response.status === 404) {
          console.log('⚠️ Rota não encontrada - verifique se o recurso "notificacoes" existe no db.json');
        }
      }
      
      // Retornar array vazio em caso de erro para não quebrar a UI
      return [];
    }
  },

  // Buscar notificação por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/notificacoes/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar notificação:', error);
      throw error;
    }
  },

  // Criar notificação
  criar: async (dados) => {
    try {
      console.log('📝 Criando notificação:', dados);
      
      // Validar dados obrigatórios
      if (!dados.usuarioId || !dados.titulo || !dados.mensagem) {
        throw new Error('Dados incompletos para criar notificação');
      }
      
      const novaNotificacao = {
        ...dados,
        id: Date.now(), // Gerar ID único
        lida: false,
        data: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await api.post('/notificacoes', novaNotificacao);
      console.log('✅ Notificação criada:', response.data);
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  },

  // Marcar notificação como lida
  marcarComoLida: async (id) => {
    try {
      console.log('📌 Marcando notificação como lida:', id);
      
      // Primeiro verificar se a notificação existe
      await api.get(`/notificacoes/${id}`);
      
      const response = await api.patch(`/notificacoes/${id}`, {
        lida: true,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Notificação marcada como lida');
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro ao marcar notificação:', error);
      throw error;
    }
  },

  // Marcar todas como lidas
  marcarTodasComoLidas: async (usuarioId) => {
    try {
      console.log('📌 Marcando todas notificações como lidas para usuário:', usuarioId);
      
      // Buscar todas notificações não lidas do usuário
      const response = await api.get(`/notificacoes?usuarioId=${usuarioId}&lida=false`);
      const notificacoes = response.data;
      
      if (!notificacoes.length) {
        console.log('ℹ️ Nenhuma notificação não lida encontrada');
        return;
      }
      
      // Marcar cada uma como lida
      const promises = notificacoes.map(notif => 
        api.patch(`/notificacoes/${notif.id}`, {
          lida: true,
          updatedAt: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      console.log(`✅ ${notificacoes.length} notificações marcadas como lidas`);
      
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
      throw error;
    }
  },

  // Excluir notificação
  excluir: async (id) => {
    try {
      console.log('🗑️ Excluindo notificação:', id);
      
      await api.delete(`/notificacoes/${id}`);
      console.log('✅ Notificação excluída');
      
    } catch (error) {
      console.error('❌ Erro ao excluir notificação:', error);
      throw error;
    }
  },

  // Excluir todas notificações de um usuário
  excluirTodas: async (usuarioId) => {
    try {
      console.log('🗑️ Excluindo todas notificações do usuário:', usuarioId);
      
      const response = await api.get(`/notificacoes?usuarioId=${usuarioId}`);
      const notificacoes = response.data;
      
      if (!notificacoes.length) {
        console.log('ℹ️ Nenhuma notificação encontrada para excluir');
        return;
      }
      
      const promises = notificacoes.map(notif => 
        api.delete(`/notificacoes/${notif.id}`)
      );
      
      await Promise.all(promises);
      console.log(`✅ ${notificacoes.length} notificações excluídas`);
      
    } catch (error) {
      console.error('❌ Erro ao excluir todas:', error);
      throw error;
    }
  },

  // Contar notificações não lidas
  contarNaoLidas: async (usuarioId) => {
    try {
      const response = await api.get(`/notificacoes?usuarioId=${usuarioId}&lida=false`);
      return response.data.length;
    } catch (error) {
      console.error('❌ Erro ao contar notificações:', error);
      return 0;
    }
  },

  // Métodos helpers para criar notificações específicas
  notificarAgendamento: async (agendamento, usuarioId) => {
    return notificacoesService.criar({
      usuarioId,
      tipo: 'agendamento',
      titulo: 'Novo Agendamento',
      mensagem: `Agendamento para ${new Date(agendamento.data).toLocaleDateString('pt-BR')} às ${agendamento.horario}`,
      link: `/agendamentos/${agendamento.id}`,
      icone: 'event'
    });
  },

  notificarLembrete: async (agendamento, usuarioId) => {
    return notificacoesService.criar({
      usuarioId,
      tipo: 'lembrete',
      titulo: 'Lembrete de Agendamento',
      mensagem: `Você tem um agendamento amanhã às ${agendamento.horario}`,
      link: `/agendamentos/${agendamento.id}`,
      icone: 'alarm'
    });
  },

  notificarNovoCliente: async (cliente, usuarioId) => {
    return notificacoesService.criar({
      usuarioId,
      tipo: 'cliente',
      titulo: 'Novo Cliente',
      mensagem: `${cliente.nome} se cadastrou no sistema`,
      link: `/clientes/${cliente.id}`,
      icone: 'person'
    });
  },

  notificarEstoqueBaixo: async (produto, usuarioId) => {
    return notificacoesService.criar({
      usuarioId,
      tipo: 'estoque',
      titulo: 'Estoque Baixo',
      mensagem: `${produto.nome} está com estoque baixo (${produto.quantidadeEstoque} unidades)`,
      link: `/estoque/${produto.id}`,
      icone: 'warning'
    });
  },

  notificarPagamento: async (pagamento, usuarioId) => {
    return notificacoesService.criar({
      usuarioId,
      tipo: 'pagamento',
      titulo: 'Pagamento Recebido',
      mensagem: `Pagamento de R$ ${pagamento.valor.toFixed(2)} recebido`,
      link: `/pagamentos/${pagamento.id}`,
      icone: 'payment'
    });
  }
};

export default notificacoesService;