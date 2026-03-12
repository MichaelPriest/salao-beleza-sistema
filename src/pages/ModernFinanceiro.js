// src/pages/ModernFinanceiro.js (exemplo de uso seguro)
import React, { useState, useMemo } from 'react';
import { useDadosContext } from '../contexts/DadosContext';

function ModernFinanceiro() {
  const { 
    transacoes, // 🔥 AGORA É SEMPRE UM ARRAY
    clientes,   // 🔥 AGORA É SEMPRE UM ARRAY
    caixaAtual,
    carregando 
  } = useDadosContext();

  // 🔥 USO SEGURO - não precisa mais verificar se é array
  const stats = useMemo(() => {
    const receitas = transacoes
      .filter(t => t.status === 'pago' && t.tipo === 'receita')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const despesas = transacoes
      .filter(t => t.status === 'pago' && t.tipo === 'despesa')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    return { receitas, despesas, saldo: receitas - despesas };
  }, [transacoes]);

  if (carregando) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Financeiro</h1>
      <p>Total de transações: {transacoes.length}</p>
      <p>Receitas: R$ {stats.receitas.toFixed(2)}</p>
      <p>Despesas: R$ {stats.despesas.toFixed(2)}</p>
      <p>Saldo: R$ {stats.saldo.toFixed(2)}</p>
      {caixaAtual && (
        <p>Caixa atual: R$ {caixaAtual.saldoAtual?.toFixed(2)}</p>
      )}
    </div>
  );
}

export default ModernFinanceiro;
