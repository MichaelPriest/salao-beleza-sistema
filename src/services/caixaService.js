// src/services/caixaService.js
import { firebaseService } from './firebase';

export const METODOS_CAIXA = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_debito: 'Cartão de débito',
  cartao_credito: 'Cartão de crédito',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  cheque: 'Cheque',
  credito_loja: 'Crédito na loja',
};

const TIPOS_ENTRADA = new Set(['abertura', 'venda', 'recebimento', 'reforco']);
const TIPOS_SAIDA = new Set(['sangria', 'despesa', 'retirada', 'estorno']);

const moedaParaNumero = (valor) => {
  if (typeof valor === 'number') return valor;
  const normalizado = String(valor || '0').replace(/\./g, '').replace(',', '.');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
};

export const formatarMoedaCaixa = (valor) => Number(valor || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const agoraIso = () => new Date().toISOString();

export const caixaService = {
  tipoLabel: (tipo) => ({
    abertura: 'Abertura',
    venda: 'Venda',
    recebimento: 'Recebimento',
    reforco: 'Reforço',
    sangria: 'Sangria',
    despesa: 'Despesa',
    retirada: 'Retirada',
    estorno: 'Estorno',
  }[tipo] || tipo || 'Movimento'),

  listarRegistros: async () => {
    const registros = await firebaseService.getAll('caixa').catch(() => []);
    return Array.isArray(registros) ? registros : [];
  },

  obterCaixaAberto: async () => {
    const registros = await caixaService.listarRegistros();
    return registros
      .filter((item) => item.tipoRegistro === 'sessao' && item.status === 'aberto')
      .sort((a, b) => new Date(b.abertoEm || b.createdAt) - new Date(a.abertoEm || a.createdAt))[0] || null;
  },

  listarMovimentos: async (caixaId) => {
    if (!caixaId) return [];
    const registros = await caixaService.listarRegistros();
    return registros.filter((item) => item.tipoRegistro === 'movimentacao' && item.caixaId === caixaId);
  },

  calcularTotais: (caixaAberto, movimentos = []) => {
    const valorAbertura = moedaParaNumero(caixaAberto?.valorAbertura);
    const totais = movimentos.reduce((acc, movimento) => {
      const valor = moedaParaNumero(movimento.valor);
      if (TIPOS_SAIDA.has(movimento.tipo)) {
        acc.saidas += valor;
        if (movimento.tipo === 'sangria') acc.sangrias += valor;
      } else if (TIPOS_ENTRADA.has(movimento.tipo)) {
        acc.entradas += valor;
        if (movimento.tipo === 'reforco') acc.reforcos += valor;
      }

      const forma = movimento.formaPagamento || 'nao_informado';
      acc.porForma[forma] = (acc.porForma[forma] || 0) + (TIPOS_SAIDA.has(movimento.tipo) ? -valor : valor);
      return acc;
    }, { entradas: 0, saidas: 0, sangrias: 0, reforcos: 0, porForma: {} });

    return {
      ...totais,
      valorAbertura,
      saldoAtual: valorAbertura + totais.entradas - totais.saidas,
    };
  },

  carregarResumoAtual: async () => {
    const registros = await caixaService.listarRegistros();
    const historico = registros
      .filter((item) => item.tipoRegistro === 'sessao')
      .sort((a, b) => new Date(b.abertoEm || b.createdAt) - new Date(a.abertoEm || a.createdAt));
    const caixaAberto = historico.find((item) => item.status === 'aberto') || null;
    const movimentos = caixaAberto
      ? registros.filter((item) => item.tipoRegistro === 'movimentacao' && item.caixaId === caixaAberto.id)
      : [];
    const totais = caixaService.calcularTotais(caixaAberto, movimentos);
    return { caixaAberto, movimentos, historico, totais };
  },

  abrirCaixa: async ({ valorAbertura = 0, observacao = '' } = {}) => {
    const caixaAberto = await caixaService.obterCaixaAberto();
    if (caixaAberto) throw new Error('Já existe um caixa aberto. Feche o caixa atual antes de abrir outro.');

    const valor = moedaParaNumero(valorAbertura);
    if (valor < 0) throw new Error('Valor de abertura inválido.');

    return firebaseService.add('caixa', {
      tipoRegistro: 'sessao',
      status: 'aberto',
      valorAbertura: valor,
      observacaoAbertura: observacao,
      abertoEm: agoraIso(),
    });
  },

  registrarMovimento: async ({ caixaId, tipo, valor, formaPagamento = 'dinheiro', descricao = '', observacao = '' }) => {
    if (!caixaId) throw new Error('Abra um caixa antes de registrar movimentos.');
    const valorNumerico = moedaParaNumero(valor);
    if (valorNumerico <= 0) throw new Error('Informe um valor maior que zero.');

    return firebaseService.add('caixa', {
      tipoRegistro: 'movimentacao',
      caixaId,
      tipo,
      valor: valorNumerico,
      formaPagamento,
      descricao,
      observacao,
      data: agoraIso(),
    });
  },

  fecharCaixa: async (caixaId, { valorConferido, observacao = '' } = {}) => {
    const caixa = await firebaseService.getById('caixa', caixaId);
    if (!caixa || caixa.tipoRegistro !== 'sessao' || caixa.status !== 'aberto') {
      throw new Error('Caixa aberto não encontrado.');
    }

    const movimentos = await caixaService.listarMovimentos(caixaId);
    const totais = caixaService.calcularTotais(caixa, movimentos);
    const valorFinal = moedaParaNumero(valorConferido);

    return firebaseService.update('caixa', caixaId, {
      status: 'fechado',
      fechadoEm: agoraIso(),
      saldoEsperado: totais.saldoAtual,
      saldoFinal: valorFinal,
      diferenca: valorFinal - totais.saldoAtual,
      observacaoFechamento: observacao,
      totalEntradas: totais.entradas,
      totalSaidas: totais.saidas,
      totalSangrias: totais.sangrias,
      totalReforcos: totais.reforcos,
      totalMovimentos: movimentos.length,
    });
  },
};

export default caixaService;
