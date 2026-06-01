// src/services/resgateFidelidadeService.js
import { firebaseService } from './firebase';
import { Timestamp } from '../services/firebase';
import { pontuacaoService } from './pontuacaoService';

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
        status: 'resgatado',
        utilizado: false,
        codigo: dados.codigo || `RESGATE-${Date.now()}`,
        observacoes: dados.observacoes || '',
        usuarioId: dados.usuarioId || 'sistema',
        usuarioNome: dados.usuarioNome || 'Sistema',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const id = await firebaseService.add('resgates_fidelidade', resgate);

      // Remover pontos
      await pontuacaoService.remover({
        clienteId: dados.clienteId,
        clienteNome: dados.clienteNome,
        quantidade: dados.pontosGastos,
        motivo: `Resgate: ${resgate.recompensaNome}`,
        resgateId: id,
        usuarioId: dados.usuarioId,
        usuarioNome: dados.usuarioNome
      });

      return { ...resgate, id };
    } catch (error) {
      console.error('Erro ao criar resgate:', error);
      throw error;
    }
  },

  // Utilizar resgate
  utilizar: async (id) => {
    try {
      await firebaseService.update('resgates_fidelidade', id, {
        utilizado: true,
        dataUtilizacao: new Date().toISOString(),
        updatedAt: Timestamp.now()
      });
      return { id, utilizado: true };
    } catch (error) {
      console.error('Erro ao utilizar resgate:', error);
      throw error;
    }
  }
};
