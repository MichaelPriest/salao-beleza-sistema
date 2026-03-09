import api from './api';

export const atendimentoService = {
  // Buscar todos os atendimentos
  listarTodos: async () => {
    try {
      const response = await api.get('/atendimentos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar atendimentos:', error);
      throw error;
    }
  },

  // Buscar atendimento por ID
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/atendimentos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar atendimento:', error);
      throw error;
    }
  },

  // Buscar atendimentos por cliente
  buscarPorCliente: async (clienteId) => {
    try {
      const response = await api.get(`/atendimentos?clienteId=${clienteId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar atendimentos do cliente:', error);
      throw error;
    }
  },

  // Buscar atendimentos por profissional
  buscarPorProfissional: async (profissionalId) => {
    try {
      const response = await api.get(`/atendimentos?profissionalId=${profissionalId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar atendimentos do profissional:', error);
      throw error;
    }
  },

  // Buscar atendimentos por data
  buscarPorData: async (data) => {
    try {
      const response = await api.get(`/atendimentos?data=${data}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar atendimentos por data:', error);
      throw error;
    }
  },

  // Criar atendimento
  criar: async (dados) => {
    try {
      const response = await api.post('/atendimentos', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      throw error;
    }
  },

  // Atualizar atendimento
  atualizar: async (id, dados) => {
    try {
      const response = await api.patch(`/atendimentos/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      throw error;
    }
  },

  // INICIAR ATENDIMENTO - VERSÃO CORRIGIDA USANDO A ROTA PERSONALIZADA
  iniciarAtendimento: async (agendamentoId) => {
    console.log('🚀 Iniciando atendimento para agendamento:', agendamentoId);
    
    try {
      // Validar ID
      if (!agendamentoId) {
        throw new Error('ID do agendamento não fornecido');
      }

      // Buscar o agendamento primeiro para verificar se existe
      console.log('📋 Buscando agendamento...');
      const agendamentoResponse = await api.get(`/agendamentos/${agendamentoId}`);
      const agendamento = agendamentoResponse.data;
      
      console.log('✅ Agendamento encontrado:', agendamento);

      // Validar dados do agendamento
      if (!agendamento.clienteId) throw new Error('Cliente não informado no agendamento');
      if (!agendamento.profissionalId) throw new Error('Profissional não informado no agendamento');
      if (!agendamento.servicoId) throw new Error('Serviço não informado no agendamento');

      // Verificar se já existe um atendimento para este agendamento
      console.log('🔍 Verificando atendimentos existentes...');
      const atendimentosExistentes = await api.get(`/atendimentos?agendamentoId=${agendamentoId}`);
      
      if (atendimentosExistentes.data.length > 0) {
        console.log('⚠️ Atendimento já existe:', atendimentosExistentes.data[0]);
        
        // Se o atendimento existente não estiver finalizado, retornar ele
        if (atendimentosExistentes.data[0].status !== 'finalizado') {
          return atendimentosExistentes.data[0];
        }
      }

      // NOTA: O servidor tem uma rota personalizada /agendamentos/:id/finalizar
      // Mas vamos usar a rota padrão POST /atendimentos que é mais flexível
      
      console.log('📝 Criando novo atendimento via POST /atendimentos...');
      
      // Criar novo atendimento - o servidor adicionará createdAt e updatedAt automaticamente
      const novoAtendimento = {
        agendamentoId: agendamento.id,
        clienteId: agendamento.clienteId,
        profissionalId: agendamento.profissionalId,
        servicoId: agendamento.servicoId,
        data: agendamento.data,
        horaInicio: agendamento.horario || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        horaFim: null,
        status: 'em_andamento',
        observacoes: agendamento.observacoes || ''
      };

      console.log('📦 Dados do atendimento:', novoAtendimento);
      
      const response = await api.post('/atendimentos', novoAtendimento);
      console.log('✅ Atendimento criado:', response.data);

      // Atualizar status do agendamento para 'em_andamento'
      console.log('🔄 Atualizando status do agendamento...');
      await api.patch(`/agendamentos/${agendamentoId}`, { 
        status: 'em_andamento'
      });
      
      console.log('✅ Agendamento atualizado para em_andamento');

      return response.data;
    } catch (error) {
      console.error('❌ Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // Se falhar com POST /atendimentos, tente a rota personalizada como fallback
      if (error.response?.status === 404) {
        console.log('🔄 Tentando rota personalizada /agendamentos/:id/finalizar como fallback...');
        try {
          const fallbackResponse = await api.post(`/agendamentos/${agendamentoId}/finalizar`, {
            observacoes: 'Atendimento iniciado via fallback'
          });
          console.log('✅ Atendimento criado via fallback:', fallbackResponse.data);
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('❌ Fallback também falhou:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  },

  // Alias para iniciarAtendimento (compatibilidade)
  iniciarDeAgendamento: async function(agendamentoId) {
    return this.iniciarAtendimento(agendamentoId);
  },

  // Finalizar atendimento
  finalizarAtendimento: async (atendimentoId, dados) => {
    try {
      console.log('🏁 Finalizando atendimento:', atendimentoId);
      
      // Buscar o atendimento
      const atendimento = await api.get(`/atendimentos/${atendimentoId}`);
      
      const horaFim = new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Atualizar atendimento
      const response = await api.patch(`/atendimentos/${atendimentoId}`, {
        horaFim: horaFim,
        status: 'finalizado',
        observacoes: dados?.observacoes || atendimento.data.observacoes || '',
        valorTotal: dados?.valorTotal || 0
      });

      // Atualizar agendamento relacionado
      if (atendimento.data.agendamentoId) {
        console.log('🔄 Atualizando agendamento relacionado...');
        await api.patch(`/agendamentos/${atendimento.data.agendamentoId}`, {
          status: 'finalizado'
        });
      }

      console.log('✅ Atendimento finalizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      throw error;
    }
  },

  // Alias para finalizarAtendimento (compatibilidade)
  finalizar: async function(id, dados) {
    return this.finalizarAtendimento(id, dados);
  },

  // Cancelar atendimento
  cancelarAtendimento: async (atendimentoId) => {
    try {
      console.log('❌ Cancelando atendimento:', atendimentoId);
      
      const atendimento = await api.get(`/atendimentos/${atendimentoId}`);
      
      const response = await api.patch(`/atendimentos/${atendimentoId}`, {
        status: 'cancelado'
      });

      if (atendimento.data.agendamentoId) {
        await api.patch(`/agendamentos/${atendimento.data.agendamentoId}`, {
          status: 'cancelado'
        });
      }

      console.log('✅ Atendimento cancelado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar atendimento:', error);
      throw error;
    }
  },

  // Alias para cancelarAtendimento (compatibilidade)
  cancelar: async function(id) {
    return this.cancelarAtendimento(id);
  },

  // Registrar pagamento - USANDO A ROTA PERSONALIZADA
  registrarPagamento: async (atendimentoId, dados) => {
    try {
      console.log('💰 Registrando pagamento para atendimento:', atendimentoId);
      
      // Usar a rota personalizada /atendimentos/:id/pagamento
      const response = await api.post(`/atendimentos/${atendimentoId}/pagamento`, {
        formaPagamento: dados.formaPagamento,
        observacoes: dados.observacoes || ''
      });
      
      console.log('✅ Pagamento registrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      
      // Fallback: criar pagamento manualmente se a rota personalizada falhar
      if (error.response?.status === 404) {
        console.log('🔄 Tentando criar pagamento manualmente...');
        
        const atendimento = await api.get(`/atendimentos/${atendimentoId}`);
        const servico = await api.get(`/servicos/${atendimento.data.servicoId}`);
        
        const pagamento = {
          atendimentoId,
          clienteId: atendimento.data.clienteId,
          valor: servico.data.preco,
          formaPagamento: dados.formaPagamento,
          parcelas: dados.parcelas || 1,
          observacoes: dados.observacoes || '',
          status: 'pago',
          data: new Date().toISOString()
        };
        
        const response = await api.post('/pagamentos', pagamento);
        return response.data;
      }
      
      throw error;
    }
  },

  // Buscar pagamentos do atendimento
  buscarPagamentos: async (atendimentoId) => {
    try {
      const response = await api.get(`/pagamentos?atendimentoId=${atendimentoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  },

  // Buscar estatísticas
  buscarEstatisticas: async () => {
    try {
      const atendimentos = await api.get('/atendimentos');
      const data = atendimentos.data;
      
      return {
        total: data.length,
        emAndamento: data.filter(a => a.status === 'em_andamento').length,
        finalizados: data.filter(a => a.status === 'finalizado').length,
        cancelados: data.filter(a => a.status === 'cancelado').length
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
};