import api from './api';

export const servicosService = {
  // Listar serviços
  listar: async () => {
    const response = await api.get('/servicos');
    return response.data;
  },

  // Buscar serviço por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/servicos/${id}`);
    return response.data;
  },

  // Criar serviço
  criar: async (servico) => {
    const response = await api.post('/servicos', servico);
    return response.data;
  },

  // Atualizar serviço
  atualizar: async (id, servico) => {
    const response = await api.put(`/servicos/${id}`, servico);
    return response.data;
  },

  // Excluir serviço (desativar)
  excluir: async (id) => {
    const response = await api.patch(`/servicos/${id}`, { ativo: false });
    return response.data;
  }
};