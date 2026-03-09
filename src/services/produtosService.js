import api from './api';

export const produtosService = {
  // Listar todos os produtos
  listar: async () => {
    const response = await api.get('/produtos');
    return response.data;
  },

  // Buscar produto por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  // Criar novo produto
  criar: async (produto) => {
    const response = await api.post('/produtos', produto);
    return response.data;
  },

  // Atualizar produto
  atualizar: async (id, produto) => {
    const response = await api.put(`/produtos/${id}`, produto);
    return response.data;
  },

  // Excluir produto
  excluir: async (id) => {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  },

  // Atualizar estoque
  atualizarEstoque: async (id, quantidade) => {
    const produto = await api.get(`/produtos/${id}`);
    const novaQuantidade = produto.data.quantidadeEstoque + quantidade;
    const response = await api.patch(`/produtos/${id}`, {
      quantidadeEstoque: novaQuantidade
    });
    return response.data;
  },

  // Buscar produtos com estoque baixo
  buscarEstoqueBaixo: async (limite = 10) => {
    const response = await api.get('/produtos');
    return response.data.filter(p => p.quantidadeEstoque <= (p.estoqueMinimo || limite));
  }
};