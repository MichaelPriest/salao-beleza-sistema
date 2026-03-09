import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export function useDados(endpoint) {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/${endpoint}`);
      setDados(response.data);
      setError(null);
    } catch (err) {
      console.error(`Erro ao carregar ${endpoint}:`, err);
      setError(`Erro ao carregar ${endpoint}`);
      toast.error(`Erro ao carregar ${endpoint}`);
    } finally {
      setLoading(false);
    }
  };

  const adicionar = async (novoDado) => {
    try {
      const response = await api.post(`/${endpoint}`, novoDado);
      setDados([...dados, response.data]);
      toast.success(`${endpoint.slice(0,-1)} adicionado com sucesso!`);
      return response.data;
    } catch (err) {
      console.error(`Erro ao adicionar ${endpoint}:`, err);
      toast.error(`Erro ao adicionar ${endpoint.slice(0,-1)}`);
      throw err;
    }
  };

  const atualizar = async (id, dadosAtualizados) => {
    try {
      const response = await api.put(`/${endpoint}/${id}`, dadosAtualizados);
      setDados(dados.map(item => item.id === id ? response.data : item));
      toast.success(`${endpoint.slice(0,-1)} atualizado com sucesso!`);
      return response.data;
    } catch (err) {
      console.error(`Erro ao atualizar ${endpoint}:`, err);
      toast.error(`Erro ao atualizar ${endpoint.slice(0,-1)}`);
      throw err;
    }
  };

  const excluir = async (id) => {
    try {
      await api.delete(`/${endpoint}/${id}`);
      setDados(dados.filter(item => item.id !== id));
      toast.success(`${endpoint.slice(0,-1)} excluído com sucesso!`);
    } catch (err) {
      console.error(`Erro ao excluir ${endpoint}:`, err);
      toast.error(`Erro ao excluir ${endpoint.slice(0,-1)}`);
      throw err;
    }
  };

  useEffect(() => {
    carregar();
  }, [endpoint]);

  return { dados, loading, error, carregar, adicionar, atualizar, excluir };
}