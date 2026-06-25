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

const isSessaoCaixa = (item) => item?.tipoRegistro === 'sessao' || (!item?.tipoRegistro && (item?.dataAbertura || item?.abertoEm || item?.saldoInicial !== undefined));
const isMovimentoCaixa = (item) => item?.tipoRegistro === 'movimentacao';
const dataAberturaCaixa = (item) => item?.abertoEm || item?.dataAbertura || item?.createdAt;
const valorAberturaCaixa = (item) => moedaParaNumero(item?.valorAbertura ?? item?.saldoInicial ?? 0);

const notificarCaixaAtualizado = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('caixaAtualizado'));
  }
};

const criarTransacaoParaMovimento = async (movimento) => {
  if (movimento.transacaoId || movimento.criarTransacao === false) return null;

  const valor = moedaParaNumero(movimento.valor);
  if (valor <= 0 || movimento.tipo === 'abertura') return null;

  const isSaida = TIPOS_SAIDA.has(movimento.tipo);
  const transacao = {
    tipo: isSaida ? 'despesa' : 'receita',
    descricao: movimento.descricao || caixaService.tipoLabel(movimento.tipo),
    valor,
    data: new Date().toISOString().split('T')[0],
    dataVencimento: new Date().toISOString().split('T')[0],
    categoria: movimento.tipo === 'sangria' ? 'Sangria de Caixa' : movimento.tipo === 'reforco' ? 'Reforço de Caixa' : 'Caixa',
    formaPagamento: movimento.formaPagamento || 'dinheiro',
    status: 'pago',
    dataPagamento: agoraIso(),
    origem: 'caixa',
    caixaId: movimento.caixaId,
    caixaMovimentoId: movimento.id,
    referenciaId: movimento.id,
    referenciaTipo: 'caixa',
    observacoes: movimento.observacao || `Movimento de caixa: ${caixaService.tipoLabel(movimento.tipo)}`,
  };

  return firebaseService.add('transacoes', transacao);
};

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
      .filter((item) => isSessaoCaixa(item) && item.status === 'aberto')
      .sort((a, b) => new Date(dataAberturaCaixa(b) || 0) - new Date(dataAberturaCaixa(a) || 0))[0] || null;
  },

  listarMovimentos: async (caixaId) => {
    if (!caixaId) return [];
    const registros = await caixaService.listarRegistros();
    const caixaSessao = registros.find((item) => item.id === caixaId);
    const movimentosDiretos = registros.filter((item) => isMovimentoCaixa(item) && item.caixaId === caixaId);
    const movimentosLegados = Array.isArray(caixaSessao?.movimentacoes)
      ? caixaSessao.movimentacoes.map((movimento) => ({ ...movimento, tipoRegistro: 'movimentacao', caixaId }))
      : [];
    return [...movimentosDiretos, ...movimentosLegados];
  },

  calcularTotais: (caixaAberto, movimentos = []) => {
    const valorAbertura = valorAberturaCaixa(caixaAberto);
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
      .filter(isSessaoCaixa)
      .sort((a, b) => new Date(dataAberturaCaixa(b) || 0) - new Date(dataAberturaCaixa(a) || 0));
    const caixaAberto = historico.find((item) => item.status === 'aberto') || null;
    const movimentos = caixaAberto ? await caixaService.listarMovimentos(caixaAberto.id) : [];
    const totais = caixaService.calcularTotais(caixaAberto, movimentos);
    return { caixaAberto, movimentos, historico, totais };
  },

  abrirCaixa: async ({ valorAbertura = 0, observacao = '' } = {}) => {
    const caixaAberto = await caixaService.obterCaixaAberto();
    if (caixaAberto) throw new Error('Já existe um caixa aberto. Feche o caixa atual antes de abrir outro.');

    const valor = moedaParaNumero(valorAbertura);
    if (valor < 0) throw new Error('Valor de abertura inválido.');

    const id = await firebaseService.add('caixa', {
      tipoRegistro: 'sessao',
      status: 'aberto',
      valorAbertura: valor,
      observacaoAbertura: observacao,
      abertoEm: agoraIso(),
    });
    notificarCaixaAtualizado();
    return id;
  },

  registrarMovimento: async ({
    caixaId,
    tipo,
    valor,
    formaPagamento = 'dinheiro',
    descricao = '',
    observacao = '',
    origem = 'caixa',
    referenciaId = null,
    referenciaTipo = null,
    atendimentoId = null,
    clienteId = null,
    transacaoId = null,
    criarTransacao = true,
  }) => {
    if (!caixaId) throw new Error('Abra um caixa antes de registrar movimentos.');
    const valorNumerico = moedaParaNumero(valor);
    if (valorNumerico <= 0) throw new Error('Informe um valor maior que zero.');

    const movimento = await firebaseService.add('caixa', {
      tipoRegistro: 'movimentacao',
      caixaId,
      tipo,
      valor: valorNumerico,
      formaPagamento,
      descricao,
      observacao,
      origem,
      referenciaId,
      referenciaTipo,
      atendimentoId,
      clienteId,
      transacaoId,
      criarTransacao,
      data: agoraIso(),
    });

    const transacaoCriadaId = await criarTransacaoParaMovimento({ ...movimento, criarTransacao }).catch((error) => {
      console.warn('Não foi possível integrar movimento do caixa ao financeiro:', error);
      return null;
    });

    if (transacaoCriadaId) {
      await firebaseService.update('caixa', movimento.id, { transacaoId: transacaoCriadaId }).catch(() => null);
      notificarCaixaAtualizado();
      return { ...movimento, transacaoId: transacaoCriadaId };
    }

    notificarCaixaAtualizado();
    return movimento;
  },

  sincronizarRecebimentoAtendimento: async ({ pagamento, atendimentoId, clienteId, clienteNome, transacaoId }) => {
    const caixaAberto = await caixaService.obterCaixaAberto();
    if (!caixaAberto || !pagamento?.id) return null;

    const existentes = await firebaseService.query('caixa', [
      { field: 'referenciaId', operator: '==', value: pagamento.id },
      { field: 'referenciaTipo', operator: '==', value: 'pagamento_atendimento' },
    ]).catch(() => []);

    const movimentoExistente = existentes.find((item) => item.tipoRegistro === 'movimentacao');
    const dadosMovimento = {
      tipo: 'recebimento',
      valor: pagamento.valor,
      formaPagamento: pagamento.formaPagamento || 'dinheiro',
      descricao: `Recebimento atendimento - ${clienteNome || 'Cliente'}`,
      observacao: pagamento.observacoes || `Pagamento do atendimento ${atendimentoId}`,
      origem: 'atendimento',
      referenciaId: pagamento.id,
      referenciaTipo: 'pagamento_atendimento',
      atendimentoId,
      clienteId,
      transacaoId,
      criarTransacao: false,
    };

    if (movimentoExistente) {
      await firebaseService.update('caixa', movimentoExistente.id, dadosMovimento);
      notificarCaixaAtualizado();
      return { ...movimentoExistente, ...dadosMovimento };
    }

    return caixaService.registrarMovimento({ caixaId: caixaAberto.id, ...dadosMovimento });
  },

  removerMovimentosPorReferencia: async ({ referenciaId, referenciaTipo }) => {
    if (!referenciaId) return 0;
    const movimentos = await firebaseService.query('caixa', [
      { field: 'referenciaId', operator: '==', value: referenciaId },
      ...(referenciaTipo ? [{ field: 'referenciaTipo', operator: '==', value: referenciaTipo }] : []),
    ]).catch(() => []);

    await Promise.all((movimentos || [])
      .filter((item) => item.tipoRegistro === 'movimentacao')
      .map((item) => firebaseService.delete('caixa', item.id)));

    notificarCaixaAtualizado();
    return movimentos.length;
  },

  fecharCaixa: async (caixaId, { valorConferido, observacao = '' } = {}) => {
    const caixa = await firebaseService.getById('caixa', caixaId);
    if (!caixa || !isSessaoCaixa(caixa) || caixa.status !== 'aberto') {
      throw new Error('Caixa aberto não encontrado.');
    }

    const movimentos = await caixaService.listarMovimentos(caixaId);
    const totais = caixaService.calcularTotais(caixa, movimentos);
    const valorFinal = moedaParaNumero(valorConferido ?? totais.saldoAtual);
    const fechadoEm = agoraIso();

    const resultado = await firebaseService.update('caixa', caixaId, {
      status: 'fechado',
      fechadoEm,
      dataFechamento: fechadoEm,
      saldoEsperado: totais.saldoAtual,
      saldoFinal: valorFinal,
      saldoAtual: valorFinal,
      diferenca: valorFinal - totais.saldoAtual,
      observacaoFechamento: observacao,
      totalEntradas: totais.entradas,
      totalSaidas: totais.saidas,
      totalSangrias: totais.sangrias,
      totalReforcos: totais.reforcos,
      totalMovimentos: movimentos.length,
      totais,
    });
    notificarCaixaAtualizado();
    return resultado;
  },

  perguntarAberturaAoEntrar: async () => {
    if (typeof window === 'undefined') return null;
    const caixaAberto = await caixaService.obterCaixaAberto();
    if (caixaAberto) return caixaAberto;

    return new Promise((resolve) => {
      let tratadoPelaInterface = false;
      const concluir = async ({ abrir = false, valorAbertura = 0, observacao = 'Abertura solicitada na interface do sistema' } = {}) => {
        if (!abrir) {
          resolve(null);
          return;
        }
        try {
          const caixa = await caixaService.abrirCaixa({ valorAbertura, observacao });
          resolve(caixa);
        } catch (error) {
          resolve(null);
        }
      };

      window.dispatchEvent(new CustomEvent('caixaSolicitarAbertura', {
        detail: {
          mensagem: 'Não há caixa aberto. Deseja abrir o caixa agora?',
          concluir,
          marcarComoTratado: () => { tratadoPelaInterface = true; },
        },
      }));

      setTimeout(() => {
        if (tratadoPelaInterface) return;
        resolve(null);
      }, 300);
    });
  },

  perguntarFechamentoAoSair: async () => {
    if (typeof window === 'undefined') return null;
    const resumo = await caixaService.carregarResumoAtual();
    if (!resumo.caixaAberto) return null;
    if (!window.confirm(`Existe um caixa aberto com saldo esperado de ${formatarMoedaCaixa(resumo.totais.saldoAtual)}. Deseja fechar antes de sair?`)) {
      return resumo.caixaAberto;
    }
    return caixaService.fecharCaixa(resumo.caixaAberto.id, {
      valorConferido: resumo.totais.saldoAtual,
      observacao: 'Fechamento solicitado no logout',
    });
  },
};

export default caixaService;
