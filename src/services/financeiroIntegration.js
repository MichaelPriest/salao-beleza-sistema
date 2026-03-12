// src/services/financeiroIntegration.js
import { firebaseService } from './firebase';

/**
 * Gera uma despesa no financeiro quando uma compra é confirmada/recebida
 */
export const gerarDespesaCompra = async (compra) => {
  try {
    const fornecedor = await firebaseService.getById('fornecedores', compra.fornecedorId);
    
    const itensDescricao = compra.itens?.map(item => 
      `${item.quantidade}x ${item.produtoNome}`
    ).join(', ') || 'Compra de produtos';

    const despesa = {
      tipo: 'despesa',
      descricao: `Compra #${compra.numeroPedido} - ${itensDescricao}`,
      valor: Number(compra.valorTotal),
      data: new Date().toISOString().split('T')[0],
      dataVencimento: calcularDataVencimento(compra.formaPagamento, compra.prazoEntrega),
      categoria: 'Compras',
      formaPagamento: compra.formaPagamento || 'pix',
      status: determinarStatusPagamento(compra.formaPagamento),
      fornecedorId: compra.fornecedorId,
      fornecedorNome: fornecedor?.nome || 'Fornecedor não identificado',
      observacoes: `Gerado automaticamente da compra #${compra.numeroPedido}\nItens: ${itensDescricao}`,
      referenciaId: compra.id,
      referenciaTipo: 'compra',
      parcelas: 1,
      recorrente: false,
      tags: ['compra', 'automático'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const idDespesa = await firebaseService.add('transacoes', despesa);
    
    console.log(`✅ Despesa #${idDespesa} gerada para compra #${compra.numeroPedido}`);
    return { success: true, id: idDespesa, despesa };
  } catch (error) {
    console.error('❌ Erro ao gerar despesa da compra:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gera uma despesa de comissão no financeiro
 */
export const gerarDespesaComissao = async (comissao) => {
  try {
    const despesa = {
      tipo: 'despesa',
      descricao: `Comissão ${comissao.profissionalNome} - ${comissao.servicoNome}`,
      valor: Number(comissao.valor),
      data: new Date().toISOString().split('T')[0],
      dataVencimento: new Date().toISOString().split('T')[0],
      categoria: 'Comissões',
      formaPagamento: 'dinheiro',
      status: 'pendente',
      profissionalId: comissao.profissionalId,
      profissionalNome: comissao.profissionalNome,
      observacoes: `Comissão de ${comissao.percentual}% sobre R$ ${comissao.valorAtendimento.toFixed(2)}\nAtendimento: ${comissao.atendimentoId}\nServiço: ${comissao.servicoNome}`,
      referenciaId: comissao.id,
      referenciaTipo: 'comissao',
      referenciaAtendimentoId: comissao.atendimentoId,
      parcelas: 1,
      recorrente: false,
      tags: ['comissão', 'automático', 'folha-pagamento'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const idDespesa = await firebaseService.add('transacoes', despesa);
    
    console.log(`✅ Despesa de comissão #${idDespesa} gerada para ${comissao.profissionalNome}`);
    return { success: true, id: idDespesa, despesa };
  } catch (error) {
    console.error('❌ Erro ao gerar despesa de comissão:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Atualiza o status de uma despesa relacionada a uma compra
 */
export const atualizarDespesaCompra = async (compraId, novoStatus) => {
  try {
    const transacoes = await firebaseService.getAll('transacoes');
    const despesa = transacoes.find(t => t.referenciaId === compraId && t.referenciaTipo === 'compra');
    
    if (!despesa) {
      console.warn('Despesa não encontrada para compra:', compraId);
      return { success: false, error: 'Despesa não encontrada' };
    }

    const dadosAtualizacao = {
      status: novoStatus,
      updatedAt: new Date().toISOString(),
    };

    if (novoStatus === 'pago') {
      dadosAtualizacao.dataPagamento = new Date().toISOString();
    }

    await firebaseService.update('transacoes', despesa.id, dadosAtualizacao);
    
    console.log(`✅ Despesa #${despesa.id} atualizada para status: ${novoStatus}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar despesa:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancela uma despesa relacionada a uma compra cancelada
 */
export const cancelarDespesaCompra = async (compraId) => {
  return atualizarDespesaCompra(compraId, 'cancelado');
};

// Funções auxiliares
function calcularDataVencimento(formaPagamento, prazoEntrega) {
  const hoje = new Date();
  
  switch (formaPagamento) {
    case 'pix':
    case 'dinheiro':
    case 'cartao_debito':
      return hoje.toISOString().split('T')[0];
    
    case 'cartao_credito':
      hoje.setDate(hoje.getDate() + 30);
      return hoje.toISOString().split('T')[0];
    
    case 'boleto':
      if (prazoEntrega) return prazoEntrega;
      hoje.setDate(hoje.getDate() + 7);
      return hoje.toISOString().split('T')[0];
    
    case 'transferencia':
      hoje.setDate(hoje.getDate() + 3);
      return hoje.toISOString().split('T')[0];
    
    default:
      return hoje.toISOString().split('T')[0];
  }
}

function determinarStatusPagamento(formaPagamento) {
  const pagamentoAVista = ['pix', 'dinheiro', 'cartao_debito'];
  return pagamentoAVista.includes(formaPagamento) ? 'pago' : 'pendente';
}

export default {
  gerarDespesaCompra,
  gerarDespesaComissao,
  atualizarDespesaCompra,
  cancelarDespesaCompra,
};
