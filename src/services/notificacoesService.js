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
  },

  notificarAgendamentoSite: async (agendamento, usuarioId) => {
    return notificacoesService.criar({
      usuarioId,
      tipo: 'agendamento',
      titulo: 'Novo Agendamento pelo Site',
      mensagem: `Cliente ${agendamento.clienteNome} agendou ${agendamento.servicoNome} para ${new Date(agendamento.data).toLocaleDateString('pt-BR')} às ${agendamento.horario}`,
      link: `/agendamentos/${agendamento.id}`,
      icone: 'event',
      origem: 'site'
    });
  }
};

export default notificacoesService;
