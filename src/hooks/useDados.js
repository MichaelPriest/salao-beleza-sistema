// src/hooks/useDados.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useDados(endpoint) {
  const [dados, setDados] = useState([]); // 🔥 SEMPRE COMEÇA COMO ARRAY VAZIO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`🔄 Carregando ${endpoint}...`);
      const response = await api.get(`/${endpoint}`);
      console.log(`✅ ${endpoint} carregados:`, response.data);
      
      // 🔥 GARANTIR QUE OS DADOS SÃO UM ARRAY
      const dadosArray = Array.isArray(response.data) ? response.data : [];
      setDados(dadosArray);
      setError(null);
    } catch (err) {
      console.error(`❌ Erro ao carregar ${endpoint}:`, err);
      setError(err.message);
      setDados([]); // 🔥 EM CASO DE ERRO, MANTÉM ARRAY VAZIO
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const adicionar = async (novoItem) => {
    try {
      const response = await api.post(`/${endpoint}`, novoItem);
      setDados(prev => Array.isArray(prev) ? [...prev, response.data] : [response.data]);
      return response.data;
    } catch (err) {
      console.error(`Erro ao adicionar em ${endpoint}:`, err);
      throw err;
    }
  };

  const atualizar = async (id, dadosAtualizados) => {
    try {
      const response = await api.patch(`/${endpoint}/${id}`, dadosAtualizados);
      setDados(prev => 
        Array.isArray(prev) 
          ? prev.map(item => item?.id === id ? response.data : item)
          : []
      );
      return response.data;
    } catch (err) {
      console.error(`Erro ao atualizar em ${endpoint}:`, err);
      throw err;
    }
  };

  const excluir = async (id) => {
    try {
      await api.delete(`/${endpoint}/${id}`);
      setDados(prev => 
        Array.isArray(prev) 
          ? prev.filter(item => item?.id !== id)
          : []
      );
    } catch (err) {
      console.error(`Erro ao excluir em ${endpoint}:`, err);
      throw err;
    }
  };

  return { 
    dados, 
    loading, 
    error, 
    carregar, 
    adicionar, 
    atualizar, 
    excluir 
  };
}
