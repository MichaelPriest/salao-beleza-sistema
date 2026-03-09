import { useState, useEffect } from 'react';
import { atendimentoService } from '../services/atendimentoService';
import { toast } from 'react-hot-toast';

export function useAtendimentos() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarAtendimentos = async () => {
    try {
      setLoading(true);
      const response = await atendimentoService.listarTodos();
      setAtendimentos(response);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar atendimentos');
      toast.error('Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  };

  const iniciarAtendimento = async (agendamentoId) => {
    try {
      const atendimento = await atendimentoService.iniciarAtendimento(agendamentoId);
      await carregarAtendimentos();
      toast.success('Atendimento iniciado!');
      return atendimento;
    } catch (err) {
      toast.error('Erro ao iniciar atendimento');
      throw err;
    }
  };

  const finalizarAtendimento = async (atendimentoId, dados) => {
    try {
      const atendimento = await atendimentoService.finalizarAtendimento(atendimentoId, dados);
      await carregarAtendimentos();
      toast.success('Atendimento finalizado!');
      return atendimento;
    } catch (err) {
      toast.error('Erro ao finalizar atendimento');
      throw err;
    }
  };

  const cancelarAtendimento = async (atendimentoId) => {
    try {
      await atendimentoService.cancelarAtendimento(atendimentoId);
      await carregarAtendimentos();
      toast.success('Atendimento cancelado!');
    } catch (err) {
      toast.error('Erro ao cancelar atendimento');
      throw err;
    }
  };

  useEffect(() => {
    carregarAtendimentos();
  }, []);

  return {
    atendimentos,
    loading,
    error,
    iniciarAtendimento,
    finalizarAtendimento,
    cancelarAtendimento,
    carregarAtendimentos
  };
}