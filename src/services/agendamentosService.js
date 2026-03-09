import api from './api';

export const agendamentosService = {
  // Listar agendamentos
  listar: async (filtros = {}) => {
    let url = '/agendamentos';
    const params = new URLSearchParams();
    
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.profissionalId) params.append('profissionalId', filtros.profissionalId);
    if (filtros.status) params.append('status', filtros.status);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Buscar agendamento por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data;
  },

  // Criar agendamento
  criar: async (agendamento) => {
    const response = await api.post('/agendamentos', {
      ...agendamento,
      status: 'pendente',
      dataCriacao: new Date().toISOString()
    });
    return response.data;
  },

  // Atualizar agendamento
  atualizar: async (id, agendamento) => {
    const response = await api.put(`/agendamentos/${id}`, agendamento);
    return response.data;
  },

  // Cancelar agendamento
  cancelar: async (id) => {
    const response = await api.patch(`/agendamentos/${id}`, {
      status: 'cancelado'
    });
    return response.data;
  },

  // Confirmar agendamento
  confirmar: async (id) => {
    const response = await api.patch(`/agendamentos/${id}`, {
      status: 'confirmado'
    });
    return response.data;
  },

  // Finalizar agendamento (iniciar atendimento)
  finalizar: async (id, dados) => {
    const response = await api.post(`/agendamentos/${id}/finalizar`, dados);
    return response.data;
  }
};