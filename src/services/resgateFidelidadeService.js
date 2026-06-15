// src/services/resgateFidelidadeService.js
import { firebaseService } from './firebase';
import { Timestamp } from './firebase';
import { pontuacaoService } from './pontuacaoService';
import { notificacoesPushService } from './notificacoesPushService';
import { notificacoesService } from './notificacoesService';
import { auditoriaService } from './auditoriaService';

const STATUS_ENCERRADOS = ['utilizado', 'cancelado', 'expirado'];

const agoraIso = () => new Date().toISOString();
const dataHoje = () => agoraIso().split('T')[0];

const getId = (resultado) => (typeof resultado === 'string' ? resultado : resultado?.id);

export const gerarCodigoResgate = () => `RES${Date.now()}${Math.floor(Math.random() * 1000)}`;

export const getPontosRecompensa = (recompensa = {}) => Number(
  recompensa.pontosNecessarios ?? recompensa.pontos ?? recompensa.custoPontos ?? recompensa.valorPontos ?? 0
);

export const getQuantidadeDisponivel = (recompensa = {}) => {
  if (recompensa.ilimitado === true) return Infinity;
  const valor = recompensa.quantidadeDisponivel ?? recompensa.quantidade ?? recompensa.estoque;
  return valor === null || valor === undefined || valor === '' ? Infinity : Number(valor);
};

export const resgateEstaAtivo = (resgate = {}) => {
  const status = String(resgate.status || 'disponivel').toLowerCase();
  return !resgate.utilizado && !STATUS_ENCERRADOS.includes(status);
};

const normalizarClienteIds = (cliente = {}, firebaseUser = null) => Array.from(new Set([
  cliente.id,
  cliente.uid,
  cliente.authUid,
  cliente.googleUid,
  cliente.email,
  firebaseUser?.uid,
  firebaseUser?.email,
].filter(Boolean).map(String)));

const buscarPontuacoesPorIds = async (ids = []) => {
  const consultas = await Promise.all(ids.map((id) => firebaseService.query('pontuacao', [
    { field: 'clienteId', operator: '==', value: id }
  ]).catch(() => [])));

  return Array.from(new Map(consultas.flat().map((item) => [item.id, item])).values());
};

const calcularSaldoPorIds = async (ids = []) => {
  const pontuacoes = await buscarPontuacoesPorIds(ids);
  return pontuacoes.reduce((acc, item) => {
    const quantidade = Number(item.quantidade) || 0;
    return acc + (item.tipo === 'credito' ? quantidade : -quantidade);
  }, 0);
};

const notificarAdministradores = async (resgate, titulo, mensagem, prioridade = 'media') => {
  const notificacao = {
    tipo: 'resgate_fidelidade',
    titulo,
    mensagem,
    icone: 'redeem',
    link: '/gerenciar-fidelidade',
    prioridade,
    cargos: ['admin', 'gerente'],
    detalhes: {
      resgateId: resgate.id,
      clienteId: resgate.clienteId,
      clienteNome: resgate.clienteNome,
      recompensaId: resgate.recompensaId,
      recompensaNome: resgate.recompensaNome,
      pontosGastos: resgate.pontosGastos,
      codigo: resgate.codigo,
    }
  };

  return notificacoesService.criar(notificacao).catch((error) => {
    console.warn('Não foi possível criar notificação administrativa do resgate:', error);
    return null;
  });
};

const notificarCliente = async (clienteId, dados) => {
  if (!clienteId) return null;
  return notificacoesPushService.criarNotificacao(dados).catch((error) => {
    console.warn('Não foi possível criar notificação para cliente do resgate:', error);
    return null;
  });
};

const gerarMovimentoFinanceiroResgate = async (resgate, recompensa = {}) => {
  const valorEstimado = Number(
    recompensa.valorFinanceiro
    ?? recompensa.custoFinanceiro
    ?? recompensa.valorCusto
    ?? (recompensa.tipo && recompensa.tipo !== 'desconto' ? recompensa.valor : 0)
    ?? 0
  );
  const movimento = {
    tipo: 'despesa',
    origem: 'resgate_fidelidade',
    origemId: resgate.id,
    referenciaId: resgate.id,
    referenciaTipo: 'resgate_fidelidade',
    descricao: `Custo de recompensa resgatada: ${resgate.recompensaNome}`,
    valor: valorEstimado,
    data: dataHoje(),
    dataVencimento: dataHoje(),
    categoria: 'Fidelidade e recompensas',
    formaPagamento: 'pontos_fidelidade',
    status: 'pago',
    clienteId: resgate.clienteId,
    clienteNome: resgate.clienteNome,
    observacoes: `Lançamento automático do resgate ${resgate.codigo}. Pontos utilizados: ${resgate.pontosGastos}.`,
    tags: ['fidelidade', 'recompensa', 'automático'],
    dataPagamento: agoraIso(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  return firebaseService.add('transacoes', movimento).catch((error) => {
    console.warn('Não foi possível gerar movimento financeiro do resgate:', error);
    return null;
  });
};

export const resgateFidelidadeService = {
  buscarPorCliente: async (clienteId) => {
    try {
      const resgates = await firebaseService.query('resgates_fidelidade', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);

      return resgates.sort((a, b) => new Date(b.createdAt || b.data || 0) - new Date(a.createdAt || a.data || 0));
    } catch (error) {
      console.error('Erro ao buscar resgates:', error);
      return [];
    }
  },

  buscarAtivosPorClienteIds: async (idsCliente = []) => {
    const consultas = await Promise.all(idsCliente.map((id) => firebaseService.query('resgates_fidelidade', [
      { field: 'clienteId', operator: '==', value: id }
    ], 'data', 'desc').catch(() => [])));

    return Array.from(new Map(consultas.flat().map((item) => [item.id, item])).values())
      .filter(resgateEstaAtivo)
      .sort((a, b) => new Date(b.createdAt || b.data || 0) - new Date(a.createdAt || a.data || 0));
  },

  criar: async (dados) => {
    try {
      const cliente = dados.cliente || {};
      const firebaseUser = dados.firebaseUser || null;
      const recompensa = dados.recompensa || {};
      const clienteId = String(dados.clienteId || cliente.id || '');
      const clienteNome = dados.clienteNome || cliente.nome || cliente.nomeCompleto || 'Cliente';
      const pontosGastos = Number(dados.pontosGastos || getPontosRecompensa(recompensa));
      const recompensaId = dados.recompensaId || recompensa.id || '';
      const recompensaNome = dados.recompensaNome || recompensa.nome || 'Recompensa';

      if (!clienteId) throw new Error('clienteId obrigatório');
      if (!recompensaId) throw new Error('recompensaId obrigatório');
      if (!pontosGastos || pontosGastos <= 0) throw new Error('pontos inválidos');

      const idsCliente = Array.from(new Set([clienteId, ...normalizarClienteIds(cliente, firebaseUser)].filter(Boolean)));
      const saldo = idsCliente.length > 1 ? await calcularSaldoPorIds(idsCliente) : await pontuacaoService.calcularSaldo(clienteId);
      if (saldo < pontosGastos) throw new Error('Saldo insuficiente');

      const quantidadeDisponivel = getQuantidadeDisponivel(recompensa);
      if (quantidadeDisponivel !== Infinity && quantidadeDisponivel <= 0) throw new Error('Recompensa esgotada');

      const resgate = {
        clienteId,
        clienteAuthUid: dados.clienteAuthUid || firebaseUser?.uid || cliente.authUid || '',
        authUid: dados.authUid || firebaseUser?.uid || cliente.authUid || '',
        googleUid: dados.googleUid || cliente.googleUid || '',
        clienteEmail: dados.clienteEmail || cliente.email || firebaseUser?.email || '',
        clienteNome,
        recompensaId,
        recompensaNome,
        recompensaImagem: dados.recompensaImagem || recompensa.imagem || '',
        pontosGastos,
        data: dados.data || agoraIso(),
        status: dados.status || 'disponivel',
        utilizado: false,
        codigo: dados.codigo || gerarCodigoResgate(),
        observacoes: dados.observacoes || '',
        validadeAte: dados.validadeAte || recompensa.validade || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        usuarioId: dados.usuarioId || firebaseUser?.uid || 'cliente',
        usuarioNome: dados.usuarioNome || clienteNome,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const resultadoResgate = await firebaseService.add('resgates_fidelidade', resgate);
      const resgateId = getId(resultadoResgate);
      const resgateComId = { ...resgate, id: resgateId };

      await pontuacaoService.removerPontos({
        clienteId,
        clienteNome,
        quantidade: pontosGastos,
        motivo: `Resgate: ${recompensaNome}`,
        resgateId,
        usuarioId: dados.usuarioId || firebaseUser?.uid || 'cliente',
        usuarioNome: dados.usuarioNome || clienteNome,
        observacoes: dados.observacoes || '',
      });

      if (quantidadeDisponivel !== Infinity) {
        await firebaseService.update('recompensas', recompensaId, {
          quantidadeDisponivel: quantidadeDisponivel - 1,
          quantidade: quantidadeDisponivel - 1,
          updatedAt: Timestamp.now(),
        });
      }

      const movimentoFinanceiro = await gerarMovimentoFinanceiroResgate(resgateComId, recompensa);
      if (movimentoFinanceiro?.id) {
        await firebaseService.update('resgates_fidelidade', resgateId, {
          transacaoFinanceiraId: movimentoFinanceiro.id,
          updatedAt: Timestamp.now(),
        }).catch(() => null);
      }

      await Promise.all([
        notificarCliente(clienteId, {
          clienteId,
          clienteUid: resgateComId.clienteAuthUid,
          authUid: resgateComId.authUid,
          googleUid: resgateComId.googleUid,
          clienteEmail: resgateComId.clienteEmail,
          tipo: 'resgate',
          titulo: '🎁 Recompensa resgatada!',
          mensagem: `Você resgatou ${recompensaNome}. Apresente o código ${resgateComId.codigo} no salão.`,
          icone: 'redeem',
          link: '/cliente/recompensas',
          dados: {
            resgateId,
            recompensaId,
            recompensaNome,
            pontosGastos,
            codigo: resgateComId.codigo,
          }
        }),
        notificarAdministradores(
          resgateComId,
          '🎁 Novo resgate de recompensa',
          `${clienteNome} resgatou ${recompensaNome} usando ${pontosGastos} pontos. Código: ${resgateComId.codigo}`,
          'alta'
        ),
      ]);

      auditoriaService.registrar('resgate_recompensa', {
        entidade: 'resgates_fidelidade',
        entidadeId: resgateId,
        detalhes: `Resgate de ${recompensaNome} por ${clienteNome}`,
        dados: {
          clienteId,
          clienteNome,
          recompensaId,
          recompensaNome,
          pontosGastos,
          saldoAnterior: saldo,
          saldoNovo: saldo - pontosGastos,
          transacaoFinanceiraId: movimentoFinanceiro?.id || null,
        }
      }).catch(() => null);

      return { ...resgateComId, transacaoFinanceiraId: movimentoFinanceiro?.id || null };
    } catch (error) {
      console.error('Erro ao criar resgate:', error);
      throw error;
    }
  },

  utilizar: async (id, dados = {}) => {
    try {
      const resgate = await firebaseService.getById('resgates_fidelidade', id);
      if (!resgate) throw new Error('Resgate não encontrado');
      if (resgate.utilizado || String(resgate.status).toLowerCase() === 'utilizado') return { ...resgate, utilizado: true };

      const atualizado = {
        utilizado: true,
        status: 'utilizado',
        dataUtilizacao: agoraIso(),
        utilizadoPor: dados.usuarioNome || dados.usuarioId || 'Sistema',
        usuarioUtilizacaoId: dados.usuarioId || 'sistema',
        observacoesUtilizacao: dados.observacoes || '',
        updatedAt: Timestamp.now(),
      };

      await firebaseService.update('resgates_fidelidade', id, atualizado);

      await Promise.all([
        notificarCliente(resgate.clienteId, {
          clienteId: resgate.clienteId,
          clienteUid: resgate.clienteAuthUid,
          authUid: resgate.authUid,
          googleUid: resgate.googleUid,
          clienteEmail: resgate.clienteEmail,
          tipo: 'resgate_utilizado',
          titulo: '✅ Recompensa utilizada',
          mensagem: `A recompensa ${resgate.recompensaNome} foi marcada como utilizada.`,
          icone: 'check_circle',
          link: '/cliente/recompensas',
          dados: { resgateId: id, codigo: resgate.codigo }
        }),
        notificarAdministradores(
          { ...resgate, id },
          '✅ Recompensa utilizada',
          `${resgate.recompensaNome} de ${resgate.clienteNome} foi marcada como utilizada.`,
          'media'
        ),
      ]);

      auditoriaService.registrar('utilizar_resgate_recompensa', {
        entidade: 'resgates_fidelidade',
        entidadeId: id,
        detalhes: `Resgate ${resgate.codigo} utilizado`,
        dados: { ...resgate, ...atualizado }
      }).catch(() => null);

      return { ...resgate, ...atualizado, id };
    } catch (error) {
      console.error('Erro ao utilizar resgate:', error);
      throw error;
    }
  },

  cancelar: async (id, dados = {}) => {
    try {
      const resgate = await firebaseService.getById('resgates_fidelidade', id);
      if (!resgate) throw new Error('Resgate não encontrado');
      if (STATUS_ENCERRADOS.includes(String(resgate.status || '').toLowerCase())) return resgate;

      const pontosGastos = Number(resgate.pontosGastos || 0);
      if (pontosGastos > 0 && dados.estornarPontos !== false) {
        await pontuacaoService.adicionarPontos({
          clienteId: resgate.clienteId,
          clienteNome: resgate.clienteNome || 'Cliente',
          quantidade: pontosGastos,
          motivo: `Estorno do resgate: ${resgate.recompensaNome}`,
          usuarioId: dados.usuarioId || 'sistema',
          usuarioNome: dados.usuarioNome || 'Sistema',
          observacoes: dados.motivo || 'Cancelamento de resgate',
        });
      }

      const atualizado = {
        status: 'cancelado',
        utilizado: false,
        dataCancelamento: agoraIso(),
        motivoCancelamento: dados.motivo || '',
        canceladoPor: dados.usuarioNome || dados.usuarioId || 'Sistema',
        updatedAt: Timestamp.now(),
      };
      await firebaseService.update('resgates_fidelidade', id, atualizado);

      const recompensa = resgate.recompensaId ? await firebaseService.getById('recompensas', resgate.recompensaId).catch(() => null) : null;
      if (recompensa && getQuantidadeDisponivel(recompensa) !== Infinity) {
        const quantidadeAtual = getQuantidadeDisponivel(recompensa);
        await firebaseService.update('recompensas', resgate.recompensaId, {
          quantidadeDisponivel: quantidadeAtual + 1,
          quantidade: quantidadeAtual + 1,
          updatedAt: Timestamp.now(),
        }).catch(() => null);
      }

      await notificarCliente(resgate.clienteId, {
        clienteId: resgate.clienteId,
        clienteUid: resgate.clienteAuthUid,
        authUid: resgate.authUid,
        googleUid: resgate.googleUid,
        clienteEmail: resgate.clienteEmail,
        tipo: 'resgate_cancelado',
        titulo: '↩️ Resgate cancelado',
        mensagem: `O resgate de ${resgate.recompensaNome} foi cancelado${dados.estornarPontos !== false ? ' e os pontos foram estornados.' : '.'}`,
        icone: 'cancel',
        link: '/cliente/recompensas',
        dados: { resgateId: id, codigo: resgate.codigo, pontosEstornados: dados.estornarPontos !== false ? pontosGastos : 0 }
      });

      auditoriaService.registrar('cancelar_resgate_recompensa', {
        entidade: 'resgates_fidelidade',
        entidadeId: id,
        detalhes: `Resgate ${resgate.codigo} cancelado`,
        dados: { ...resgate, ...atualizado, pontosEstornados: dados.estornarPontos !== false ? pontosGastos : 0 }
      }).catch(() => null);

      return { ...resgate, ...atualizado, id };
    } catch (error) {
      console.error('Erro ao cancelar resgate:', error);
      throw error;
    }
  }
};

export default resgateFidelidadeService;
