// src/services/siteService.js
import { firebaseService } from './firebase';

export const siteService = {
  // Buscar configurações do salão
  buscarConfiguracoes: async () => {
    try {
      const configs = await firebaseService.getAll('configuracoes');
      return configs[0] || null;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  },

  // Buscar serviços ativos
  buscarServicos: async () => {
    try {
      const servicos = await firebaseService.getAll('servicos');
      return servicos.filter(s => s.ativo !== false);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  },

  // Buscar profissionais ativos
  buscarProfissionais: async () => {
    try {
      const profissionais = await firebaseService.getAll('profissionais');
      return profissionais.filter(p => p.status === 'ativo');
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      return [];
    }
  },

  // Criar agendamento público
  criarAgendamento: async (dados) => {
    try {
      const agendamento = {
        ...dados,
        status: 'pendente',
        origem: 'site',
        dataCriacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const novoId = await firebaseService.add('agendamentos', agendamento);
      return { ...agendamento, id: novoId };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  // Verificar disponibilidade de horário
  verificarDisponibilidade: async (profissionalId, data, horario) => {
    try {
      const agendamentos = await firebaseService.getAll('agendamentos');
      const existente = agendamentos.find(a => 
        a.profissionalId === profissionalId &&
        a.data === data &&
        a.horario === horario &&
        a.status !== 'cancelado'
      );
      return !existente;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  }
};
