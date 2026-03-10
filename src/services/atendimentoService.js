// src/services/atendimentoService.js
import { firebaseService } from './firebase';
import { comissoesService } from './comissoesService'; // NOVO: importar serviço de comissões

export const atendimentoService = {
  // Buscar todos os atendimentos
  listarTodos: async () => {
    try {
      const atendimentos = await firebaseService.getAll('atendimentos');
      
      // Ordenar por data (mais recentes primeiro)
      atendimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      return atendimentos;
    } catch (error) {
      console.error('Erro ao listar atendimentos:', error);
      throw error;
    }
  },

  // Buscar atendimento por ID
  buscarPorId: async (id) => {
    try {
      const atendimento = await firebaseService.getById('atendimentos', id);
      return atendimento;
    } catch (error) {
      console.error('Erro ao buscar atendimento:', error);
      throw error;
    }
  },

  // Buscar atendimentos por cliente
  buscarPorCliente: async (clienteId) => {
    try {
      const atendimentos = await firebaseService.getAll('atendimentos');
      
      return atendimentos
        .filter(a => a.clienteId === clienteId)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    } catch (error) {
      console.error('Erro ao buscar atendimentos do cliente:', error);
      throw error;
    }
  },

  // Buscar atendimentos por profissional
  buscarPorProfissional: async (profissionalId) => {
    try {
      const atendimentos = await firebaseService.getAll('atendimentos');
      
      return atendimentos
        .filter(a => a.profissionalId === profissionalId)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    } catch (error) {
      console.error('Erro ao buscar atendimentos do profissional:', error);
      throw error;
    }
  },

  // Buscar atendimentos por data
  buscarPorData: async (data) => {
    try {
      const atendimentos = await firebaseService.getAll('atendimentos');
      const dataFiltro = data.split('T')[0];
      
      return atendimentos
        .filter(a => a.data && a.data.split('T')[0] === dataFiltro)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    } catch (error) {
      console.error('Erro ao buscar atendimentos por data:', error);
      throw error;
    }
  },

  // Buscar atendimentos por período
  buscarPorPeriodo: async (dataInicio, dataFim) => {
    try {
      const atendimentos = await firebaseService.getAll('atendimentos');
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      
      return atendimentos
        .filter(a => {
          const dataAtendimento = new Date(a.data);
          return dataAtendimento >= inicio && dataAtendimento <= fim;
        })
        .sort((a, b) => new Date(a.data) - new Date(b.data));
    } catch (error) {
      console.error('Erro ao buscar atendimentos por período:', error);
      throw error;
    }
  },

  // Criar atendimento
  criar: async (dados) => {
    try {
      const dadosParaSalvar = {
        ...dados,
        agendamentoId: dados.agendamentoId ? String(dados.agendamentoId) : null,
        clienteId: String(dados.clienteId),
        profissionalId: String(dados.profissionalId),
        servicoId: String(dados.servicoId),
        data: String(dados.data),
        horaInicio: String(dados.horaInicio),
        horaFim: dados.horaFim ? String(dados.horaFim) : null,
        status: dados.status || 'em_andamento',
        observacoes: dados.observacoes ? String(dados.observacoes) : '',
        valorTotal: Number(dados.valorTotal) || 0,
        dataCriacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const novoId = await firebaseService.add('atendimentos', dadosParaSalvar);
      
      // Registrar log de auditoria
      await registrarLog('criar', 'atendimentos', novoId, 'Atendimento criado');

      return { ...dadosParaSalvar, id: novoId };
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      throw error;
    }
  },

  // Atualizar atendimento
  atualizar: async (id, dados) => {
    try {
      const dadosParaSalvar = {
        ...dados,
        clienteId: dados.clienteId ? String(dados.clienteId) : undefined,
        profissionalId: dados.profissionalId ? String(dados.profissionalId) : undefined,
        servicoId: dados.servicoId ? String(dados.servicoId) : undefined,
        valorTotal: dados.valorTotal ? Number(dados.valorTotal) : undefined,
        updatedAt: new Date().toISOString()
      };

      await firebaseService.update('atendimentos', id, dadosParaSalvar);
      
      // Registrar log
      await registrarLog('atualizar', 'atendimentos', id, 'Atendimento atualizado');

      return { ...dadosParaSalvar, id };
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      throw error;
    }
  },

  // INICIAR ATENDIMENTO
  iniciarAtendimento: async (agendamentoId) => {
    console.log('🚀 Iniciando atendimento para agendamento:', agendamentoId);
    
    try {
      if (!agendamentoId) {
        throw new Error('ID do agendamento não fornecido');
      }

      // Buscar o agendamento
      console.log('📋 Buscando agendamento...');
      const agendamento = await firebaseService.getById('agendamentos', agendamentoId);
      
      if (!agendamento) {
        throw new Error('Agendamento não encontrado');
      }
      
      console.log('✅ Agendamento encontrado:', agendamento);

      // Buscar dados completos do profissional e serviço
      const [profissional, servico] = await Promise.all([
        firebaseService.getById('profissionais', agendamento.profissionalId),
        firebaseService.getById('servicos', agendamento.servicoId)
      ]);

      // Validar dados
      if (!agendamento.clienteId) throw new Error('Cliente não informado no agendamento');
      if (!agendamento.profissionalId) throw new Error('Profissional não informado no agendamento');
      if (!agendamento.servicoId) throw new Error('Serviço não informado no agendamento');

      // Verificar se já existe um atendimento para este agendamento
      const todosAtendimentos = await firebaseService.getAll('atendimentos');
      const atendimentoExistente = todosAtendimentos.find(a => a.agendamentoId === agendamentoId);
      
      if (atendimentoExistente) {
        console.log('⚠️ Atendimento já existe:', atendimentoExistente);
        if (atendimentoExistente.status !== 'finalizado') {
          return atendimentoExistente;
        }
      }

      console.log('📝 Criando novo atendimento...');
      
      // Criar novo atendimento
      const novoAtendimento = {
        agendamentoId: agendamento.id,
        clienteId: agendamento.clienteId,
        clienteNome: agendamento.clienteNome || 'Cliente',
        profissionalId: agendamento.profissionalId,
        profissionalNome: profissional?.nome || agendamento.profissionalNome || 'Profissional',
        servicoId: agendamento.servicoId,
        servicoNome: servico?.nome || agendamento.servicoNome || 'Serviço',
        data: agendamento.data,
        horaInicio: agendamento.horaInicio || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        horaFim: null,
        status: 'em_andamento',
        observacoes: agendamento.observacoes || '',
        valorTotal: Number(agendamento.valor) || Number(servico?.preco) || 0,
        dataCriacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('📦 Dados do atendimento:', novoAtendimento);
      
      const atendimentoId = await firebaseService.add('atendimentos', novoAtendimento);
      
      // Atualizar status do agendamento
      console.log('🔄 Atualizando status do agendamento...');
      await firebaseService.update('agendamentos', agendamentoId, { 
        status: 'em_andamento',
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Agendamento atualizado para em_andamento');

      // Registrar log
      await registrarLog('iniciar', 'atendimentos', atendimentoId, 'Atendimento iniciado a partir de agendamento');

      return { ...novoAtendimento, id: atendimentoId };
    } catch (error) {
      console.error('❌ Erro ao iniciar atendimento:', error);
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
      const atendimento = await firebaseService.getById('atendimentos', atendimentoId);
      
      if (!atendimento) {
        throw new Error('Atendimento não encontrado');
      }
      
      const horaFim = new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Atualizar atendimento
      const dadosAtualizados = {
        horaFim: horaFim,
        status: 'finalizado',
        observacoes: dados?.observacoes || atendimento.observacoes || '',
        valorTotal: Number(dados?.valorTotal) || atendimento.valorTotal || 0,
        updatedAt: new Date().toISOString()
      };

      await firebaseService.update('atendimentos', atendimentoId, dadosAtualizados);

      // Atualizar agendamento relacionado
      if (atendimento.agendamentoId) {
        console.log('🔄 Atualizando agendamento relacionado...');
        await firebaseService.update('agendamentos', atendimento.agendamentoId, {
          status: 'finalizado',
          updatedAt: new Date().toISOString()
        });
      }

      // REGISTRAR COMISSÃO AUTOMATICAMENTE
      if (atendimento.profissionalId && dadosAtualizados.status === 'finalizado') {
        try {
          console.log('💰 Registrando comissão para o profissional:', atendimento.profissionalId);
          await comissoesService.registrar(atendimentoId);
          console.log('✅ Comissão registrada com sucesso');
        } catch (comissaoError) {
          console.error('⚠️ Erro ao registrar comissão (não crítico):', comissaoError);
          // Não interrompe o fluxo principal se a comissão falhar
        }
      }

      // Registrar log
      await registrarLog('finalizar', 'atendimentos', atendimentoId, 'Atendimento finalizado');

      console.log('✅ Atendimento finalizado');
      return { ...atendimento, ...dadosAtualizados, id: atendimentoId };
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
      
      const atendimento = await firebaseService.getById('atendimentos', atendimentoId);
      
      if (!atendimento) {
        throw new Error('Atendimento não encontrado');
      }
      
      const dadosAtualizados = {
        status: 'cancelado',
        updatedAt: new Date().toISOString()
      };

      await firebaseService.update('atendimentos', atendimentoId, dadosAtualizados);

      if (atendimento.agendamentoId) {
        await firebaseService.update('agendamentos', atendimento.agendamentoId, {
          status: 'cancelado',
          updatedAt: new Date().toISOString()
        });
      }

      // Registrar log
      await registrarLog('cancelar', 'atendimentos', atendimentoId, 'Atendimento cancelado');

      console.log('✅ Atendimento cancelado');
      return { ...atendimento, ...dadosAtualizados, id: atendimentoId };
    } catch (error) {
      console.error('Erro ao cancelar atendimento:', error);
      throw error;
    }
  },

  // Alias para cancelarAtendimento (compatibilidade)
  cancelar: async function(id) {
    return this.cancelarAtendimento(id);
  },

  // Registrar pagamento
  registrarPagamento: async (atendimentoId, dados) => {
    try {
      console.log('💰 Registrando pagamento para atendimento:', atendimentoId);
      
      // Buscar atendimento
      const atendimento = await firebaseService.getById('atendimentos', atendimentoId);
      
      if (!atendimento) {
        throw new Error('Atendimento não encontrado');
      }

      // Criar pagamento
      const pagamento = {
        atendimentoId: atendimento.id,
        clienteId: atendimento.clienteId,
        clienteNome: atendimento.clienteNome,
        valor: Number(atendimento.valorTotal) || 0,
        formaPagamento: String(dados.formaPagamento),
        parcelas: Number(dados.parcelas) || 1,
        observacoes: dados.observacoes ? String(dados.observacoes) : '',
        status: 'pago',
        data: new Date().toISOString(),
        dataCriacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const pagamentoId = await firebaseService.add('pagamentos', pagamento);
      
      // Atualizar status do atendimento
      await firebaseService.update('atendimentos', atendimentoId, {
        status: 'pago',
        updatedAt: new Date().toISOString()
      });

      // Registrar log
      await registrarLog('pagar', 'atendimentos', atendimentoId, 'Pagamento registrado');

      console.log('✅ Pagamento registrado');
      return { ...pagamento, id: pagamentoId };
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      throw error;
    }
  },

  // Buscar pagamentos do atendimento
  buscarPagamentos: async (atendimentoId) => {
    try {
      const pagamentos = await firebaseService.getAll('pagamentos');
      return pagamentos.filter(p => p.atendimentoId === atendimentoId);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  },

  // Buscar atendimentos com comissões
  buscarComComissoes: async (atendimentoId) => {
    try {
      const [atendimento, comissoes] = await Promise.all([
        firebaseService.getById('atendimentos', atendimentoId),
        firebaseService.getAll('comissoes')
      ]);

      const comissao = comissoes.find(c => c.atendimentoId === atendimentoId);

      return {
        ...atendimento,
        comissao: comissao || null
      };
    } catch (error) {
      console.error('Erro ao buscar atendimento com comissão:', error);
      throw error;
    }
  },

  // Buscar estatísticas
  buscarEstatisticas: async () => {
    try {
      const [atendimentos, comissoes] = await Promise.all([
        firebaseService.getAll('atendimentos'),
        firebaseService.getAll('comissoes')
      ]);
      
      const atendimentosFinalizados = atendimentos.filter(a => a.status === 'finalizado');
      const valorTotal = atendimentosFinalizados.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
      const totalComissoes = comissoes.reduce((acc, c) => acc + (c.valor || 0), 0);

      return {
        total: atendimentos.length,
        emAndamento: atendimentos.filter(a => a.status === 'em_andamento').length,
        finalizados: atendimentosFinalizados.length,
        cancelados: atendimentos.filter(a => a.status === 'cancelado').length,
        pagos: atendimentos.filter(a => a.status === 'pago').length,
        valorTotal,
        totalComissoes,
        mediaPorAtendimento: atendimentosFinalizados.length > 0 
          ? valorTotal / atendimentosFinalizados.length 
          : 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
};

// Função auxiliar para registrar logs
async function registrarLog(acao, entidade, entidadeId, detalhes) {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    await firebaseService.add('auditoria', {
      acao,
      entidade,
      entidadeId,
      usuario: usuario.nome || 'Sistema',
      usuarioId: usuario.id || null,
      data: new Date().toISOString(),
      detalhes
    });
  } catch (error) {
    console.warn('Erro ao registrar log:', error);
  }
}
