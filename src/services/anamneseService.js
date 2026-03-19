// src/services/anamneseService.js
import { firebaseService } from './firebase';

export const anamneseService = {
  // Verificar se há formulário pendente para um agendamento
  verificarFormularioPendente: async (agendamentoId) => {
    try {
      // Buscar o agendamento
      const agendamento = await firebaseService.getById('agendamentos', agendamentoId);
      if (!agendamento) return false;

      // Buscar formulários ativos associados ao serviço
      const formularios = await firebaseService.query('formularios_anamnese', [
        { field: 'servicoIds', operator: 'array-contains', value: agendamento.servicoId },
        { field: 'ativo', operator: '==', value: true }
      ]);

      if (formularios.length === 0) return false;

      // Verificar se já existe resposta
      const respostas = await firebaseService.query('respostas_anamnese', [
        { field: 'agendamentoId', operator: '==', value: agendamentoId }
      ]);

      return respostas.length === 0;
    } catch (error) {
      console.error('Erro ao verificar formulário:', error);
      return false;
    }
  },

  // Criar um registro de resposta pendente (opcional)
  criarPendencia: async (agendamentoId) => {
    // Implementar se necessário
  },

  // Obter o formulário para um agendamento
  obterFormularioParaAgendamento: async (agendamentoId) => {
    try {
      const agendamento = await firebaseService.getById('agendamentos', agendamentoId);
      if (!agendamento) return null;

      const formularios = await firebaseService.query('formularios_anamnese', [
        { field: 'servicoIds', operator: 'array-contains', value: agendamento.servicoId },
        { field: 'ativo', operator: '==', value: true }
      ]);

      return formularios[0] || null;
    } catch (error) {
      console.error('Erro ao obter formulário:', error);
      return null;
    }
  }
};
