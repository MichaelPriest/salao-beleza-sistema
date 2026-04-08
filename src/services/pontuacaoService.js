// src/services/pontuacaoService.js
import { firebaseService } from './firebase';
import { Timestamp } from './timestamp';

export const pontuacaoService = {
  // Buscar pontuações de um cliente
  buscarPorCliente: async (clienteId) => {
    try {
      const pontuacoes = await firebaseService.query('pontuacao', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);
      
      return pontuacoes.sort((a, b) => {
        const dataA = a.data || a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dataB = b.data || b.createdAt?.toDate?.() || new Date(b.createdAt);
        return new Date(dataB) - new Date(dataA);
      });
    } catch (error) {
      console.error('Erro ao buscar pontuações do cliente:', error);
      throw error;
    }
  },

  // Calcular saldo de pontos de um cliente
  calcularSaldo: async (clienteId) => {
    try {
      const pontuacoes = await pontuacaoService.buscarPorCliente(clienteId);
      
      const saldo = pontuacoes.reduce((acc, p) => {
        const quantidade = Number(p.quantidade) || 0;
        return acc + (p.tipo === 'credito' ? quantidade : -quantidade);
      }, 0);
      
      return saldo;
    } catch (error) {
      console.error('Erro ao calcular saldo de pontos:', error);
      throw error;
    }
  },

  // Adicionar pontos (crédito)
  adicionarPontos: async (dados) => {
    try {
      // Validar dados obrigatórios
      if (!dados.clienteId) throw new Error('clienteId é obrigatório');
      if (!dados.clienteNome) throw new Error('clienteNome é obrigatório');
      if (!dados.quantidade || dados.quantidade <= 0) throw new Error('quantidade deve ser maior que zero');

      const pontuacao = {
        clienteId: String(dados.clienteId),
        clienteNome: String(dados.clienteNome),
        quantidade: Number(dados.quantidade),
        tipo: 'credito',
        motivo: dados.motivo || 'Pontuação',
        data: dados.data || new Date().toISOString().split('T')[0],
        atendimentoId: dados.atendimentoId || null,
        agendamentoId: dados.agendamentoId || null,
        usuarioId: dados.usuarioId || 'sistema',
        usuarioNome: dados.usuarioNome || 'Sistema',
        bonusAplicados: dados.bonusAplicados || [],
        nivelNoMomento: dados.nivelNoMomento || 'bronze',
        multiplicadorAplicado: dados.multiplicadorAplicado || 1,
        observacoes: dados.observacoes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const novoId = await firebaseService.add('pontuacao', pontuacao);
      
      // Registrar log de auditoria
      try {
        await firebaseService.add('auditoria', {
          acao: 'adicionar_pontos',
          entidade: 'pontuacao',
          entidadeId: novoId,
          usuario: dados.usuarioNome || 'Sistema',
          usuarioId: dados.usuarioId || null,
          data: new Date().toISOString(),
          detalhes: `${dados.quantidade} pontos adicionados para ${dados.clienteNome}`
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return { ...pontuacao, id: novoId };
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      throw error;
    }
  },

  // Remover pontos (débito - para resgates)
  removerPontos: async (dados) => {
    try {
      // Validar dados obrigatórios
      if (!dados.clienteId) throw new Error('clienteId é obrigatório');
      if (!dados.clienteNome) throw new Error('clienteNome é obrigatório');
      if (!dados.quantidade || dados.quantidade <= 0) throw new Error('quantidade deve ser maior que zero');

      // Verificar saldo suficiente
      const saldo = await pontuacaoService.calcularSaldo(dados.clienteId);
      if (saldo < dados.quantidade) {
        throw new Error('Saldo insuficiente para remover pontos');
      }

      const pontuacao = {
        clienteId: String(dados.clienteId),
        clienteNome: String(dados.clienteNome),
        quantidade: Number(dados.quantidade),
        tipo: 'debito',
        motivo: dados.motivo || 'Resgate de pontos',
        data: dados.data || new Date().toISOString().split('T')[0],
        resgateId: dados.resgateId || null,
        usuarioId: dados.usuarioId || 'sistema',
        usuarioNome: dados.usuarioNome || 'Sistema',
        observacoes: dados.observacoes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const novoId = await firebaseService.add('pontuacao', pontuacao);
      
      // Registrar log de auditoria
      try {
        await firebaseService.add('auditoria', {
          acao: 'remover_pontos',
          entidade: 'pontuacao',
          entidadeId: novoId,
          usuario: dados.usuarioNome || 'Sistema',
          usuarioId: dados.usuarioId || null,
          data: new Date().toISOString(),
          detalhes: `${dados.quantidade} pontos removidos de ${dados.clienteNome}`
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return { ...pontuacao, id: novoId };
    } catch (error) {
      console.error('Erro ao remover pontos:', error);
      throw error;
    }
  },

  // Buscar histórico completo de pontuação
  buscarHistorico: async (clienteId, limite = 50) => {
    try {
      const pontuacoes = await pontuacaoService.buscarPorCliente(clienteId);
      return pontuacoes.slice(0, limite);
    } catch (error) {
      console.error('Erro ao buscar histórico de pontuação:', error);
      throw error;
    }
  },

  // Buscar estatísticas de pontuação do cliente
  buscarEstatisticas: async (clienteId) => {
    try {
      const pontuacoes = await pontuacaoService.buscarPorCliente(clienteId);
      
      const estatisticas = {
        totalCreditos: 0,
        totalDebitos: 0,
        quantidadeCreditos: 0,
        quantidadeDebitos: 0,
        ultimoCredito: null,
        ultimoDebito: null
      };

      pontuacoes.forEach(p => {
        const quantidade = Number(p.quantidade) || 0;
        
        if (p.tipo === 'credito') {
          estatisticas.totalCreditos += quantidade;
          estatisticas.quantidadeCreditos++;
          if (!estatisticas.ultimoCredito || new Date(p.data) > new Date(estatisticas.ultimoCredito.data)) {
            estatisticas.ultimoCredito = p;
          }
        } else {
          estatisticas.totalDebitos += quantidade;
          estatisticas.quantidadeDebitos++;
          if (!estatisticas.ultimoDebito || new Date(p.data) > new Date(estatisticas.ultimoDebito.data)) {
            estatisticas.ultimoDebito = p;
          }
        }
      });

      estatisticas.saldo = estatisticas.totalCreditos - estatisticas.totalDebitos;

      return estatisticas;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pontuação:', error);
      throw error;
    }
  }
};
