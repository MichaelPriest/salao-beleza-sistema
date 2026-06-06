// src/services/produtosHistoricoService.js
import { firebaseService } from './firebase';

const toNumber = (value) => {
  const numero = Number(value);
  return Number.isFinite(numero) ? numero : 0;
};

const roundMoney = (value) => Number(toNumber(value).toFixed(2));

export const calcularMargemProduto = (precoCusto, precoVenda) => {
  const custo = toNumber(precoCusto);
  const venda = toNumber(precoVenda);
  if (custo <= 0) return 0;
  return Number((((venda - custo) / custo) * 100).toFixed(2));
};

export const houveAlteracaoPrecoProduto = (produtoAnterior = {}, produtoNovo = {}) => {
  const custoAnterior = roundMoney(produtoAnterior.precoCusto);
  const custoNovo = roundMoney(produtoNovo.precoCusto);
  const vendaAnterior = roundMoney(produtoAnterior.precoVenda);
  const vendaNovo = roundMoney(produtoNovo.precoVenda);

  return custoAnterior !== custoNovo || vendaAnterior !== vendaNovo;
};

const getUsuarioAtual = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario') || '{}') || {};
  } catch (error) {
    return {};
  }
};

const montarHistoricoPreco = ({
  produtoAnterior = {},
  produtoNovo = {},
  produtoId,
  produtoNome,
  origem = 'cadastro_produto',
  motivo = 'Alteração de preço',
  usuario = getUsuarioAtual(),
  referenciaId = null,
  referenciaTipo = null,
  documento = null,
}) => {
  const precoCustoAnterior = roundMoney(produtoAnterior.precoCusto);
  const precoCustoNovo = roundMoney(produtoNovo.precoCusto);
  const precoVendaAnterior = roundMoney(produtoAnterior.precoVenda);
  const precoVendaNovo = roundMoney(produtoNovo.precoVenda);

  return {
    produtoId,
    produtoNome: produtoNome || produtoNovo.nome || produtoAnterior.nome || 'Produto',
    precoCustoAnterior,
    precoCustoNovo,
    precoVendaAnterior,
    precoVendaNovo,
    margemAnterior: calcularMargemProduto(precoCustoAnterior, precoVendaAnterior),
    margemNova: calcularMargemProduto(precoCustoNovo, precoVendaNovo),
    origem,
    motivo,
    referenciaId,
    referenciaTipo,
    documento,
    usuarioId: usuario?.id || usuario?.uid || null,
    usuarioNome: usuario?.nome || usuario?.email || 'Sistema',
    createdAt: new Date().toISOString(),
  };
};

export const registrarAlteracaoPrecoProduto = async (params = {}) => {
  const { produtoAnterior = {}, produtoNovo = {}, produtoId } = params;

  if (!produtoId || !houveAlteracaoPrecoProduto(produtoAnterior, produtoNovo)) {
    return null;
  }

  const historico = montarHistoricoPreco(params);

  try {
    const id = await firebaseService.add('historico_precos_produtos', historico);
    return { ...historico, id };
  } catch (error) {
    console.warn('Erro ao registrar histórico de preço em tabela dedicada. Registrando fallback em movimentações:', error);
    await firebaseService.add('movimentacoes_estoque', {
      ...historico,
      tipo: 'alteracao_preco',
      quantidade: 0,
      data: historico.createdAt,
      saldo: toNumber(produtoNovo.quantidadeEstoque || produtoAnterior.quantidadeEstoque),
    }).catch((fallbackError) => {
      console.warn('Erro ao registrar fallback do histórico de preço:', fallbackError);
    });
    return historico;
  }
};

export const registrarMovimentacaoEstoqueProduto = async ({
  produto = {},
  tipo = 'entrada',
  quantidade = 0,
  estoqueAnterior = 0,
  estoqueNovo = 0,
  valorUnitario = 0,
  origem = 'manual',
  origemId = null,
  documento = null,
  observacoes = '',
  usuario = getUsuarioAtual(),
}) => {
  const movimentacao = {
    produtoId: produto.id,
    produtoNome: produto.nome || 'Produto',
    tipo,
    quantidade: toNumber(quantidade),
    estoqueAnterior: toNumber(estoqueAnterior),
    estoqueNovo: toNumber(estoqueNovo),
    saldo: toNumber(estoqueNovo),
    valorUnitario: roundMoney(valorUnitario),
    valorTotal: roundMoney(toNumber(quantidade) * toNumber(valorUnitario)),
    origem,
    origemId,
    documento,
    observacoes,
    usuarioId: usuario?.id || usuario?.uid || null,
    usuarioNome: usuario?.nome || usuario?.email || 'Sistema',
    data: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  try {
    const id = await firebaseService.add('movimentacoes_estoque', movimentacao);
    return { ...movimentacao, id };
  } catch (error) {
    console.warn('Erro ao registrar movimentação de estoque:', error);
    return movimentacao;
  }
};

export default {
  calcularMargemProduto,
  houveAlteracaoPrecoProduto,
  registrarAlteracaoPrecoProduto,
  registrarMovimentacaoEstoqueProduto,
};
