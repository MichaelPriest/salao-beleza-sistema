// src/services/atendimentoService.js
import { firebaseService } from './firebase';
import { comissoesService } from './comissoesService';

export const atendimentoService = {
  // Buscar todos os atendimentos
  listarTodos: async () => {
    try {
      const atendimentos = await firebaseService.getAll('atendimentos');
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
        itensServico: dados.itensServico || [],
        itensProduto: dados.itensProduto || [],
        dataCriacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const novoId = await firebaseService.add('atendimentos', dadosParaSalvar);
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
        itensServico: dados.itensServico || undefined,
        itensProduto: dados.itensProduto || undefined,
        updatedAt: new Date().toISOString()
      };

      await firebaseService.update('atendimentos', id, dadosParaSalvar);
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

      const agendamento = await firebaseService.getById('agendamentos', agendamentoId);
      if (!agendamento) {
        throw new Error('Agendamento não encontrado');
      }

      const [profissional, servico] = await Promise.all([
        firebaseService.getById('profissionais', agendamento.profissionalId),
        firebaseService.getById('servicos', agendamento.servicoId)
      ]);

      if (!agendamento.clienteId) throw new Error('Cliente não informado no agendamento');
      if (!agendamento.profissionalId) throw new Error('Profissional não informado no agendamento');
      if (!agendamento.servicoId) throw new Error('Serviço não informado no agendamento');

      const todosAtendimentos = await firebaseService.getAll('atendimentos');
      const atendimentoExistente = todosAtendimentos.find(a => a.agendamentoId === agendamentoId);
      
      if (atendimentoExistente) {
        if (atendimentoExistente.status !== 'finalizado') {
          return atendimentoExistente;
        }
      }

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
        itensServico: [{
          id: agendamento.servicoId,
          nome: servico?.nome || agendamento.servicoNome || 'Serviço',
          preco: Number(agendamento.valor) || Number(servico?.preco) || 0,
          principal: true
        }],
        itensProduto: [],
        dataCriacao: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const atendimentoId = await firebaseService.add('atendimentos', novoAtendimento);
      
      await firebaseService.update('agendamentos', agendamentoId, { 
        status: 'em_andamento',
        updatedAt: new Date().toISOString()
      });

      await registrarLog('iniciar', 'atendimentos', atendimentoId, 'Atendimento iniciado a partir de agendamento');

      return { ...novoAtendimento, id: atendimentoId };
    } catch (error) {
      console.error('❌ Erro ao iniciar atendimento:', error);
      throw error;
    }
  },

  // Finalizar atendimento - VERSÃO CORRIGIDA
  finalizarAtendimento: async (atendimentoId, dados) => {
    console.log('🏁 FINALIZAR ATENDIMENTO - INÍCIO');
    console.log('📌 Atendimento ID:', atendimentoId);
    
    try {
      const atendimento = await firebaseService.getById('atendimentos', atendimentoId);
      if (!atendimento) {
        throw new Error('Atendimento não encontrado');
      }
      
      console.log('📌 Atendimento encontrado:', atendimento);

      const horaFim = new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const dadosAtualizados = {
        horaFim: horaFim,
        status: 'finalizado',
        observacoes: dados?.observacoes || atendimento.observacoes || '',
        valorTotal: Number(dados?.valorTotal) || atendimento.valorTotal || 0,
        itensServico: dados?.itensServico || atendimento.itensServico || [],
        itensProduto: dados?.itensProduto || atendimento.itensProduto || [],
        updatedAt: new Date().toISOString()
      };

      console.log('📌 Atualizando atendimento...');
      await firebaseService.update('atendimentos', atendimentoId, dadosAtualizados);

      if (atendimento.agendamentoId) {
        console.log('📌 Atualizando agendamento relacionado...');
        await firebaseService.update('agendamentos', atendimento.agendamentoId, {
          status: 'finalizado',
          updatedAt: new Date().toISOString()
        });
      }

      // 🔥 REGISTRAR COMISSÃO - CHAMADA DIRETA
      console.log('💰 Registrando comissão para atendimento:', atendimentoId);
      
      // Buscar dados completos
      const profissional = await firebaseService.getById('profissionais', atendimento.profissionalId);
      const servico = await firebaseService.getById('servicos', atendimento.servicoId);
      
      console.log('📌 Profissional:', profissional);
      console.log('📌 Serviço:', servico);

      const percentual = profissional?.comissao || servico?.comissaoProfissional || 40;
      const valorComissao = (dadosAtualizados.valorTotal * percentual) / 100;

      console.log('📊 Cálculo da comissão:');
      console.log('   - Percentual:', percentual);
      console.log('   - Valor total:', dadosAtualizados.valorTotal);
      console.log('   - Comissão:', valorComissao);

      const comissaoData = {
        atendimentoId: atendimento.id,
        profissionalId: atendimento.profissionalId,
        profissionalNome: profissional?.nome || atendimento.profissionalNome,
        servicoId: atendimento.servicoId,
        servicoNome: servico?.nome || atendimento.servicoNome,
        valorAtendimento: dadosAtualizados.valorTotal,
        percentual,
        valor: valorComissao,
        data: atendimento.data,
        status: 'pendente',
        dataRegistro: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('📌 Salvando comissão no Firebase...');
      const comissaoId = await firebaseService.add('comissoes', comissaoData);
      console.log('✅ Comissão registrada com ID:', comissaoId);

      await registrarLog('finalizar', 'atendimentos', atendimentoId, 'Atendimento finalizado com comissão');

      return { 
        atendimento: { ...atendimento, ...dadosAtualizados, id: atendimentoId },
        comissao: { ...comissaoData, id: comissaoId }
      };
    } catch (error) {
      console.error('❌ Erro ao finalizar atendimento:', error);
      throw error;
    }
  },

  // Alias
  finalizar: async function(id, dados) {
    return this.finalizarAtendimento(id, dados);
  },

  // Cancelar atendimento
  cancelarAtendimento: async (atendimentoId) => {
    try {
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

      await registrarLog('cancelar', 'atendimentos', atendimentoId, 'Atendimento cancelado');

      return { ...atendimento, ...dadosAtualizados, id: atendimentoId };
    } catch (error) {
      console.error('Erro ao cancelar atendimento:', error);
      throw error;
    }
  },

  cancelar: async function(id) {
    return this.cancelarAtendimento(id);
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
