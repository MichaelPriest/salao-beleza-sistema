import api from './api';

export const clientesService = {
  // Listar todos os clientes
  listar: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },

  // Buscar cliente por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  // Criar novo cliente
  criar: async (cliente) => {
    const response = await api.post('/clientes', cliente);
    return response.data;
  },

  // Atualizar cliente
  atualizar: async (id, cliente) => {
    const response = await api.put(`/clientes/${id}`, cliente);
    return response.data;
  },

  // Excluir cliente
  excluir: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },

  // Buscar histórico do cliente
  buscarHistorico: async (id) => {
    const [atendimentos, pagamentos] = await Promise.all([
      api.get(`/atendimentos?clienteId=${id}`),
      api.get(`/pagamentos?clienteId=${id}`)
    ]);
    return {
      atendimentos: atendimentos.data,
      pagamentos: pagamentos.data
    };
  }
};