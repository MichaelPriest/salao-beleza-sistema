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

// APENAS UMA DECLARAÇÃO de getPontosRecompensa
export const getPontosRecompensa = (recompensa = {}) => {
  const dados = recompensa || {};
  return Number(dados.pontosNecessarios ?? dados.pontos ?? dados.custoPontos ?? dados.valorPontos ?? 0);
};

// APENAS UMA DECLARAÇÃO de getQuantidadeDisponivel
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
        clienteId: dados.clienteId,
        clienteNome: dados.clienteNome || 'Cliente',
        recompensaId: dados.recompensaId || '',
        recompensaNome: dados.recompensaNome || 'Recompensa',
        pontosGastos: Number(dados.pontosGastos),
        data: dados.data || new Date().toISOString().split('T')[0],
        status: dados.status || 'disponivel',
        utilizado: false,
        codigo: dados.codigo || gerarCodigoResgate(),
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
        updatedAt: Timestamp.now(),
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

export default resgateFidelidadeService;
