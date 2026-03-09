import api from './api';

export const notificacoesService = {
  // Listar notificações de um usuário
  listar: async (usuarioId) => {
    try {
      console.log('🔍 Buscando notificações para usuário:', usuarioId);
      
      const response = await api.get(`/notificacoes?usuarioId=${usuarioId}`);
      console.log('✅ Notificações encontradas:', response.data);
      
      // Ordenar por data (mais recentes primeiro)
      const notificacoes = (response.data || []).sort((a, b) => 
        new Date(b.data) - new Date(a.data)
      );
      
      return notificacoes;
    } catch (error) {
      console.error('❌ Erro ao listar notificações:', error);
      return [];
    }
  },

  // Marcar notificação como lida
  marcarComoLida: async (id) => {
    try {
      await api.patch(`/notificacoes/${id}`, { lida: true });
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
    }
  },

  // Marcar todas como lidas
  marcarTodasComoLidas: async (usuarioId) => {
    try {
      const response = await api.get(`/notificacoes?usuarioId=${usuarioId}&lida=false`);
      const notificacoes = response.data || [];
      
      for (const notif of notificacoes) {
        await api.patch(`/notificacoes/${notif.id}`, { lida: true });
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  },

  // Excluir notificação
  excluir: async (id) => {
    try {
      await api.delete(`/notificacoes/${id}`);
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  }
};

export default notificacoesService;
