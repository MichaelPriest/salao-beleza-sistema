// src/hooks/useFirebase.js
import { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';
import { toast } from 'react-hot-toast';

export function useFirebase(collectionName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = async () => {
    try {
      setLoading(true);
      const result = await firebaseService.getAll(collectionName);
      setData(result);
      setError(null);
    } catch (err) {
      console.error(`Erro ao carregar ${collectionName}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [collectionName]);

  const adicionar = async (novoItem) => {
    try {
      const result = await firebaseService.add(collectionName, novoItem);
      setData([...data, result]);
      toast.success('Item adicionado com sucesso!');
      return result;
    } catch (err) {
      console.error(`Erro ao adicionar em ${collectionName}:`, err);
      toast.error('Erro ao adicionar item');
      throw err;
    }
  };

  const atualizar = async (id, dadosAtualizados) => {
    try {
      const result = await firebaseService.update(collectionName, id, dadosAtualizados);
      setData(data.map(item => item.id === id ? result : item));
      toast.success('Item atualizado com sucesso!');
      return result;
    } catch (err) {
      console.error(`Erro ao atualizar em ${collectionName}:`, err);
      toast.error('Erro ao atualizar item');
      throw err;
    }
  };

  const excluir = async (id) => {
    try {
      await firebaseService.delete(collectionName, id);
      setData(data.filter(item => item.id !== id));
      toast.success('Item excluído com sucesso!');
    } catch (err) {
      console.error(`Erro ao excluir de ${collectionName}:`, err);
      toast.error('Erro ao excluir item');
      throw err;
    }
  };

  const query = async (conditions = [], orderByField = null) => {
    try {
      setLoading(true);
      const result = await firebaseService.query(collectionName, conditions, orderByField);
      setData(result);
      return result;
    } catch (err) {
      console.error(`Erro na query de ${collectionName}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    carregar,
    adicionar,
    atualizar,
    excluir,
    query
  };
}
