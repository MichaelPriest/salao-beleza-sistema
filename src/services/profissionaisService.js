import api from './api';

export const profissionaisService = {
  // Listar todos os profissionais
  listar: async () => {
    const response = await api.get('/profissionais');
    return response.data;
  },

  // Buscar profissional por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/profissionais/${id}`);
    return response.data;
  },

  // Criar novo profissional
  criar: async (profissional) => {
    const response = await api.post('/profissionais', profissional);
    return response.data;
  },

  // Atualizar profissional
  atualizar: async (id, profissional) => {
    const response = await api.put(`/profissionais/${id}`, profissional);
    return response.data;
  },

  // Excluir profissional
  excluir: async (id) => {
    const response = await api.delete(`/profissionais/${id}`);
    return response.data;
  },

  // Buscar agenda do profissional
  buscarAgenda: async (id, data) => {
    const response = await api.get(`/agendamentos?profissionalId=${id}&data=${data}`);
    return response.data;
  },

  // Buscar desempenho do profissional
  buscarDesempenho: async (id) => {
    const [atendimentos, avaliacoes] = await Promise.all([
      api.get(`/atendimentos?profissionalId=${id}`),
      api.get(`/avaliacoes?profissionalId=${id}`)
    ]);
    return {
      atendimentos: atendimentos.data,
      avaliacoes: avaliacoes.data
    };
  }
};