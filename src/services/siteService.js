// src/services/siteService.js
import { firebaseService } from './firebase';
import { saasService } from './saasService';

export const siteService = {
  // Buscar configurações do salão
  buscarConfiguracoes: async (empresaId = null) => {
    try {
      const configs = empresaId
        ? await firebaseService.query('configuracoes', [{ field: 'empresaId', operator: '==', value: empresaId }])
        : await firebaseService.getAll('configuracoes');
      return configs[0] || null;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  },

  // Buscar serviços ativos
  buscarServicos: async (empresaId = null) => {
    try {
      const servicos = empresaId
        ? await firebaseService.query('servicos', [{ field: 'empresaId', operator: '==', value: empresaId }])
        : await firebaseService.getAll('servicos');
      return servicos.filter(s => s.ativo !== false);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  },

  // Buscar profissionais ativos
  buscarProfissionais: async (empresaId = null) => {
    try {
      const profissionais = empresaId
        ? await firebaseService.query('profissionais', [{ field: 'empresaId', operator: '==', value: empresaId }])
        : await firebaseService.getAll('profissionais');
      return profissionais.filter(p => p.status === 'ativo');
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      return [];
    }
  },



  // Buscar dados públicos de uma empresa por slug para a landing page
  buscarLandingEmpresa: async (slug) => {
    const empresa = await saasService.buscarEmpresaPorSlug(slug);
    if (!empresa) return null;

    saasService.setContextoAtual({ empresa });

    const [configuracoes, servicos, profissionais] = await Promise.all([
      siteService.buscarConfiguracoes(empresa.id),
      siteService.buscarServicos(empresa.id),
      siteService.buscarProfissionais(empresa.id)
    ]);

    return { empresa, configuracoes, servicos, profissionais };
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
