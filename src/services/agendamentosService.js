// src/services/agendamentosService.js
import { firebaseService } from './firebase';

export const agendamentosService = {
  // Listar agendamentos
  listar: async (filtros = {}) => {
    try {
      let agendamentos = await firebaseService.getAll('agendamentos');
      
      // Aplicar filtros
      if (filtros.data) {
        const dataFiltro = filtros.data.split('T')[0]; // Normalizar data
        agendamentos = agendamentos.filter(a => 
          a.data && a.data.split('T')[0] === dataFiltro
        );
      }
      
      if (filtros.profissionalId) {
        agendamentos = agendamentos.filter(a => 
          a.profissionalId === filtros.profissionalId
        );
      }
      
      if (filtros.status) {
        agendamentos = agendamentos.filter(a => 
          a.status === filtros.status
        );
      }
      
      // Ordenar por data (mais recentes primeiro)
      agendamentos.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      return agendamentos;
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      throw error;
    }
  },

  // Buscar agendamento por ID
  buscarPorId: async (id) => {
    try {
      const agendamento = await firebaseService.getById('agendamentos', id);
      return agendamento;
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      throw error;
    }
  },

  // Criar agendamento
  criar: async (agendamento) => {
    try {
      const dadosParaSalvar = {
        ...agendamento,
        data: String(agendamento.data),
        horaInicio: String(agendamento.horaInicio),
        horaFim: String(agendamento.horaFim),
        clienteId: String(agendamento.clienteId),
        profissionalId: String(agendamento.profissionalId),
        servicoId: String(agendamento.servicoId),
        valor: Number(agendamento.valor) || 0,
        status: 'pendente',
        dataCriacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const novoId = await firebaseService.add('agendamentos', dadosParaSalvar);
      
      // Registrar log de auditoria
      try {
        await firebaseService.add('auditoria', {
          acao: 'criar',
          entidade: 'agendamentos',
          entidadeId: novoId,
          usuario: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
          data: new Date().toISOString(),
          detalhes: `Agendamento criado para ${agendamento.clienteNome}`
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return { ...dadosParaSalvar, id: novoId };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  // Atualizar agendamento
  atualizar: async (id, agendamento) => {
    try {
      const dadosParaSalvar = {
        ...agendamento,
        data: agendamento.data ? String(agendamento.data) : undefined,
        horaInicio: agendamento.horaInicio ? String(agendamento.horaInicio) : undefined,
        horaFim: agendamento.horaFim ? String(agendamento.horaFim) : undefined,
        clienteId: agendamento.clienteId ? String(agendamento.clienteId) : undefined,
        profissionalId: agendamento.profissionalId ? String(agendamento.profissionalId) : undefined,
        servicoId: agendamento.servicoId ? String(agendamento.servicoId) : undefined,
        valor: agendamento.valor ? Number(agendamento.valor) : undefined,
        updatedAt: new Date().toISOString()
      };

      await firebaseService.update('agendamentos', id, dadosParaSalvar);
      
      // Registrar log de auditoria
      try {
        await firebaseService.add('auditoria', {
          acao: 'atualizar',
          entidade: 'agendamentos',
          entidadeId: id,
          usuario: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
          data: new Date().toISOString(),
          detalhes: `Agendamento ${id} atualizado`
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return { ...dadosParaSalvar, id };
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }
  },

  // Cancelar agendamento
  cancelar: async (id) => {
    try {
      await firebaseService.update('agendamentos', id, {
        status: 'cancelado',
        updatedAt: new Date().toISOString()
      });
      
      // Registrar log de auditoria
      try {
        await firebaseService.add('auditoria', {
          acao: 'cancelar',
          entidade: 'agendamentos',
          entidadeId: id,
          usuario: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
          data: new Date().toISOString(),
          detalhes: `Agendamento ${id} cancelado`
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return { id, status: 'cancelado' };
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  },

  // Confirmar agendamento
  confirmar: async (id) => {
    try {
      await firebaseService.update('agendamentos', id, {
        status: 'confirmado',
        updatedAt: new Date().toISOString()
      });
      
      // Registrar log de auditoria
      try {
        await firebaseService.add('auditoria', {
          acao: 'confirmar',
          entidade: 'agendamentos',
          entidadeId: id,
          usuario: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
          data: new Date().toISOString(),
          detalhes: `Agendamento ${id} confirmado`
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return { id, status: 'confirmado' };
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      throw error;
    }
  },

  // Finalizar agendamento (iniciar atendimento)
  finalizar: async (id, dados) => {
    try {
      const dadosParaSalvar = {
        ...dados,
        status: 'finalizado',
        dataFinalizacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await firebaseService.update('agendamentos', id, dadosParaSalvar);
      
      // Registrar log de auditoria
      try {
        await firebaseService.add('auditoria', {
          acao: 'finalizar',
          entidade: 'agendamentos',
          entidadeId: id,
          usuario: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema',
          data: new Date().toISOString(),
          detalhes: `Agendamento ${id} finalizado`
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return { id, ...dadosParaSalvar };
    } catch (error) {
      console.error('Erro ao finalizar agendamento:', error);
      throw error;
    }
  },

  // Buscar agendamentos por período
  buscarPorPeriodo: async (dataInicio, dataFim) => {
    try {
      const agendamentos = await firebaseService.getAll('agendamentos');
      
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      
      return agendamentos.filter(a => {
        const dataAgendamento = new Date(a.data);
        return dataAgendamento >= inicio && dataAgendamento <= fim;
      }).sort((a, b) => new Date(a.data) - new Date(b.data));
    } catch (error) {
      console.error('Erro ao buscar agendamentos por período:', error);
      throw error;
    }
  },

  // Buscar agendamentos de um profissional
  buscarPorProfissional: async (profissionalId, dataInicio, dataFim) => {
    try {
      const agendamentos = await firebaseService.getAll('agendamentos');
      
      return agendamentos.filter(a => {
        if (a.profissionalId !== profissionalId) return false;
        
        if (dataInicio && dataFim) {
          const dataAgendamento = new Date(a.data);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
          return dataAgendamento >= inicio && dataAgendamento <= fim;
        }
        
        return true;
      }).sort((a, b) => new Date(a.data) - new Date(b.data));
    } catch (error) {
      console.error('Erro ao buscar agendamentos do profissional:', error);
      throw error;
    }
  },

  // Verificar disponibilidade de horário
  verificarDisponibilidade: async (profissionalId, data, horaInicio, horaFim) => {
    try {
      const agendamentos = await firebaseService.getAll('agendamentos');
      
      const agendamentosProfissional = agendamentos.filter(a => 
        a.profissionalId === profissionalId &&
        a.data === data &&
        a.status !== 'cancelado'
      );
      
      // Verificar conflito de horários
      const conflito = agendamentosProfissional.some(a => {
        const inicioExistente = a.horaInicio;
        const fimExistente = a.horaFim;
        
        return (horaInicio < fimExistente && horaFim > inicioExistente);
      });
      
      return !conflito;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      throw error;
    }
  }
};
