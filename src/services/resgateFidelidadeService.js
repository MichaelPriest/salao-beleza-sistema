// src/services/resgateFidelidadeService.js
import { firebaseService } from './firebase';
import { Timestamp } from './firebase';
import { pontuacaoService } from './pontuacaoService';

export const getPontosRecompensa = (recompensa) => {
  const dados = recompensa || {};
  return Number(dados.pontosNecessarios ?? dados.pontos ?? dados.custoPontos ?? dados.valorPontos ?? 0);
};

export const getQuantidadeDisponivel = (recompensa) => {
  const dados = recompensa || {};
  if (dados.ilimitado === true) return Infinity;
  const valor = dados.quantidadeDisponivel ?? dados.quantidade ?? dados.estoque ?? null;
  return valor === null || valor === undefined || valor === '' ? Infinity : Number(valor);
};

export const resgateFidelidadeService = {
  // Buscar resgates de um cliente
  buscarPorCliente: async (clienteId) => {
    try {
      const resgates = await firebaseService.query('resgates_fidelidade', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);
      
      return resgates.sort((a, b) => {
        const dataA = a.data || a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dataB = b.data || b.createdAt?.toDate?.() || new Date(b.createdAt);
        return new Date(dataB) - new Date(dataA);
      });
    } catch (error) {
      console.error('Erro ao buscar resgates:', error);
      return [];
    }
  },

  // Criar resgate
  criar: async (dados) => {
    try {
      if (!dados.clienteId) throw new Error('clienteId obrigatório');
      if (!dados.pontosGastos || dados.pontosGastos <= 0) throw new Error('pontos inválidos');

      // Verificar saldo
      const saldo = await pontuacaoService.calcularSaldo(dados.clienteId);
      if (saldo < dados.pontosGastos) {
        throw new Error('Saldo insuficiente');
      }

      const resgate = {
        clienteId: dados.clienteId,
        clienteNome: dados.clienteNome || 'Cliente',
        recompensaId: dados.recompensaId || '',
        recompensaNome: dados.recompensaNome || 'Recompensa',
        pontosGastos: Number(dados.pontosGastos),
        data: dados.data || new Date().toISOString().split('T')[0],
        status: dados.status || 'disponivel',
        utilizado: false,
        codigo: dados.codigo || `RESGATE-${Date.now()}`,
        observacoes: dados.observacoes || '',
        clienteAuthUid: dados.clienteAuthUid || dados.authUid || '',
        authUid: dados.authUid || dados.clienteAuthUid || '',
        googleUid: dados.googleUid || '',
        recompensaImagem: dados.recompensaImagem || '',
        validadeAte: dados.validadeAte || '',
        origem: dados.origem || 'admin',
        usuarioId: dados.usuarioId || 'sistema',
        usuarioNome: dados.usuarioNome || 'Sistema',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const novoResgate = await firebaseService.add('resgates_fidelidade', resgate);
      const id = novoResgate?.id || novoResgate;

      // Remover pontos
      await pontuacaoService.removerPontos({
        clienteId: dados.clienteId,
        clienteNome: dados.clienteNome,
        quantidade: dados.pontosGastos,
        motivo: `Resgate: ${resgate.recompensaNome}`,
        resgateId: id,
        usuarioId: dados.usuarioId,
        usuarioNome: dados.usuarioNome
      });

      return { ...resgate, ...(typeof novoResgate === 'object' ? novoResgate : {}), id };
    } catch (error) {
      console.error('Erro ao criar resgate:', error);
      throw error;
    }
  },

  // Utilizar resgate
  utilizar: async (id, dados = {}) => {
    try {
      const atualizacao = {
        status: 'utilizado',
        utilizado: true,
        dataUtilizacao: new Date().toISOString(),
        usuarioUtilizacaoId: dados.usuarioId || 'sistema',
        usuarioUtilizacaoNome: dados.usuarioNome || 'Sistema',
        observacoesUtilizacao: dados.observacoes || '',
        updatedAt: Timestamp.now()
      };

      await firebaseService.update('resgates_fidelidade', id, atualizacao);
      return { id, ...atualizacao };
    } catch (error) {
      console.error('Erro ao utilizar resgate:', error);
      throw error;
    }
  },

  // Cancelar resgate administrativo. Quando estornarPontos=true, devolve os pontos ao cliente.
  cancelar: async (id, dados = {}) => {
    try {
      const resgate = dados.resgate || await firebaseService.getById('resgates_fidelidade', id);
      if (!resgate) throw new Error('Resgate não encontrado');
      if (resgate.utilizado || resgate.status === 'utilizado') {
        throw new Error('Resgate já utilizado não pode ser cancelado');
      }

      const atualizacao = {
        status: 'cancelado',
        utilizado: false,
        dataCancelamento: new Date().toISOString(),
        usuarioCancelamentoId: dados.usuarioId || 'sistema',
        usuarioCancelamentoNome: dados.usuarioNome || 'Sistema',
        motivoCancelamento: dados.motivo || 'Cancelado pela administração',
        pontosEstornados: Boolean(dados.estornarPontos),
        updatedAt: Timestamp.now()
      };

      await firebaseService.update('resgates_fidelidade', id, atualizacao);

      if (dados.estornarPontos) {
        await pontuacaoService.adicionarPontos({
          clienteId: resgate.clienteId,
          clienteNome: resgate.clienteNome || 'Cliente',
          quantidade: Number(resgate.pontosGastos) || 0,
          motivo: `Estorno de resgate: ${resgate.recompensaNome || 'Recompensa'}`,
          resgateId: id,
          usuarioId: dados.usuarioId,
          usuarioNome: dados.usuarioNome,
          observacoes: dados.motivo || 'Cancelamento de resgate'
        });
      }

      return { id, ...atualizacao };
    } catch (error) {
      console.error('Erro ao cancelar resgate:', error);
      throw error;
    }
  }
};
