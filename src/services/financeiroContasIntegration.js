// src/services/financeiroContasIntegration.js
// Normaliza contas a receber/pagar para o mesmo contrato usado pelo dashboard financeiro e fluxo de caixa.

const toDateString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value.includes('T') ? value.split('T')[0] : value;
  if (value?.toDate) return value.toDate().toISOString().split('T')[0];
  if (value?.seconds) return new Date(value.seconds * 1000).toISOString().split('T')[0];
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return null;
};

const toIsoString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toISOString();
  if (value?.seconds) return new Date(value.seconds * 1000).toISOString();
  if (value instanceof Date) return value.toISOString();
  return null;
};

export const normalizarStatusContaReceber = (status = 'pendente') => {
  if (['recebido', 'pago', 'quitado', 'liquidado'].includes(status)) return 'pago';
  if (['cancelado', 'cancelada'].includes(status)) return 'cancelado';
  if (status === 'atrasado') return 'atrasado';
  return 'pendente';
};

export const normalizarStatusContaPagar = (status = 'pendente') => {
  if (['pago', 'recebido', 'quitado', 'liquidado'].includes(status)) return 'pago';
  if (['cancelado', 'cancelada'].includes(status)) return 'cancelado';
  if (status === 'atrasado') return 'atrasado';
  return 'pendente';
};

export const contaReceberParaTransacao = (conta = {}) => {
  const status = normalizarStatusContaReceber(conta.status);
  const dataVencimento = toDateString(conta.dataVencimento || conta.vencimento || conta.data);
  const dataPagamento = toIsoString(conta.dataRecebimento || conta.dataPagamento || conta.recebidoEm);

  return {
    ...conta,
    id: `conta_receber_${conta.id}`,
    tipo: 'receita',
    origem: 'conta_receber',
    origemId: conta.id,
    descricao: conta.descricao || conta.titulo || 'Conta a receber',
    valor: Number(conta.valor || 0),
    data: status === 'pago' ? (toDateString(dataPagamento) || dataVencimento) : dataVencimento,
    dataVencimento,
    dataPagamento,
    categoria: conta.categoria || 'Contas a receber',
    formaPagamento: conta.formaPagamento || 'dinheiro',
    status,
    clienteId: conta.clienteId || null,
    observacoes: conta.observacoes || '',
    parcelas: Number(conta.parcelas || 1),
    createdAt: toIsoString(conta.createdAt || conta.dataCriacao),
    updatedAt: toIsoString(conta.updatedAt),
    arquivado: Boolean(conta.arquivado),
  };
};

export const contaPagarParaTransacao = (conta = {}) => {
  const status = normalizarStatusContaPagar(conta.status);
  const dataVencimento = toDateString(conta.dataVencimento || conta.vencimento || conta.data);
  const dataPagamento = toIsoString(conta.dataPagamento || conta.pagoEm);

  return {
    ...conta,
    id: `conta_pagar_${conta.id}`,
    tipo: 'despesa',
    origem: 'conta_pagar',
    origemId: conta.id,
    descricao: conta.descricao || conta.titulo || 'Conta a pagar',
    valor: Number(conta.valor || 0),
    data: status === 'pago' ? (toDateString(dataPagamento) || dataVencimento) : dataVencimento,
    dataVencimento,
    dataPagamento,
    categoria: conta.categoria || 'Contas a pagar',
    formaPagamento: conta.formaPagamento || 'boleto',
    status,
    fornecedorId: conta.fornecedorId || null,
    profissionalId: conta.profissionalId || null,
    atendimentoId: conta.atendimentoId || null,
    observacoes: conta.observacoes || '',
    parcelas: Number(conta.parcelas || 1),
    recorrente: Boolean(conta.recorrente),
    createdAt: toIsoString(conta.createdAt || conta.dataCriacao),
    updatedAt: toIsoString(conta.updatedAt),
    arquivado: Boolean(conta.arquivado),
  };
};

export const contasReceberParaTransacoes = (contas = []) => (Array.isArray(contas) ? contas : [])
  .filter((conta) => conta?.id && normalizarStatusContaReceber(conta.status) !== 'cancelado')
  .map(contaReceberParaTransacao);

export const contasPagarParaTransacoes = (contas = []) => (Array.isArray(contas) ? contas : [])
  .filter((conta) => conta?.id && normalizarStatusContaPagar(conta.status) !== 'cancelado')
  .map(contaPagarParaTransacao);
