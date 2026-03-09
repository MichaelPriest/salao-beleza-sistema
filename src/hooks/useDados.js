import { useState, useEffect } from 'react';
import api from '../services/api';

export function useDados(endpoint) {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Carregando ${endpoint}...`);
      const response = await api.get(`/${endpoint}`);
      console.log(`✅ ${endpoint} carregados:`, response.data);
      setDados(response.data || []);
      setError(null);
    } catch (err) {
      console.error(`❌ Erro ao carregar ${endpoint}:`, err);
      setError(err.message);
      setDados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [endpoint]);

  const adicionar = async (novoItem) => {
    try {
      const response = await api.post(`/${endpoint}`, novoItem);
      setDados([...dados, response.data]);
      return response.data;
    } catch (err) {
      console.error(`Erro ao adicionar em ${endpoint}:`, err);
      throw err;
    }
  };

  const atualizar = async (id, dadosAtualizados) => {
    try {
      const response = await api.patch(`/${endpoint}/${id}`, dadosAtualizados);
      setDados(dados.map(item => item.id === id ? response.data : item));
      return response.data;
    } catch (err) {
      console.error(`Erro ao atualizar em ${endpoint}:`, err);
      throw err;
    }
  };

  const excluir = async (id) => {
    try {
      await api.delete(`/${endpoint}/${id}`);
      setDados(dados.filter(item => item.id !== id));
    } catch (err) {
      console.error(`Erro ao excluir em ${endpoint}:`, err);
      throw err;
    }
  };

  return { dados, loading, error, carregar, adicionar, atualizar, excluir };
}
