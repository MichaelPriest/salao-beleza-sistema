// src/contexts/DadosContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDados } from '../hooks/useDados';

const DadosContext = createContext({});

export function DadosProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // Carregar usuário do localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('usuario');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsuario(user);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }, []);

  // Hooks para cada endpoint
  const clientes = useDados('clientes');
  const profissionais = useDados('profissionais');
  const servicos = useDados('servicos');
  const produtos = useDados('produtos');
  const agendamentos = useDados('agendamentos');
  const atendimentos = useDados('atendimentos');
  const transacoes = useDados('transacoes');
  const compras = useDados('compras');
  const caixa = useDados('caixa');
  const usuarios = useDados('usuarios');
  const fornecedores = useDados('fornecedores');
  const notificacoes = useDados('notificacoes');

  // Função para recarregar endpoints específicos
  const recarregar = useCallback(async (endpoints) => {
    const endpointsMap = {
      clientes,
      profissionais,
      servicos,
      produtos,
      agendamentos,
      atendimentos,
      transacoes,
      compras,
      caixa,
      usuarios,
      fornecedores,
      notificacoes,
    };

    const promises = endpoints.map(endpoint => endpointsMap[endpoint]?.carregar());
    await Promise.all(promises);
    setUltimaAtualizacao(new Date().toISOString());
  }, [clientes, profissionais, servicos, produtos, agendamentos, atendimentos, transacoes, compras, caixa, usuarios, fornecedores, notificacoes]);

  // Função para recarregar todos os dados
  const recarregarTodos = useCallback(async () => {
    await Promise.all([
      clientes.carregar(),
      profissionais.carregar(),
      servicos.carregar(),
      produtos.carregar(),
      agendamentos.carregar(),
      atendimentos.carregar(),
      transacoes.carregar(),
      compras.carregar(),
      caixa.carregar(),
      usuarios.carregar(),
      fornecedores.carregar(),
      notificacoes.carregar(),
    ]);
    setUltimaAtualizacao(new Date().toISOString());
  }, [clientes, profissionais, servicos, produtos, agendamentos, atendimentos, transacoes, compras, caixa, usuarios, fornecedores, notificacoes]);

  // Obter caixa atual
  const caixaAtual = useCallback(() => {
    return caixa.dados
      .filter(c => c.status === 'aberto')
      .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))[0] || null;
  }, [caixa.dados]);

  // Calcular totais financeiros
  const calcularTotaisFinanceiros = useCallback((dataInicio, dataFim) => {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().setDate(1));
    const fim = dataFim ? new Date(dataFim) : new Date();
    fim.setHours(23, 59, 59, 999);

    const transacoesFiltradas = transacoes.dados.filter(t => {
      if (!t.data) return false;
      const data = new Date(t.data);
      return data >= inicio && data <= fim && t.status === 'pago';
    });

    const receitas = transacoesFiltradas
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const despesas = transacoesFiltradas
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  }, [transacoes.dados]);

  // Estatísticas de agendamentos
  const estatisticasAgendamentos = useCallback((data) => {
    const dataStr = data || new Date().toISOString().split('T')[0];

    const agendamentosHoje = agendamentos.dados.filter(a => a.data === dataStr);
    const atendimentosHoje = atendimentos.dados.filter(a => a.data === dataStr);

    return {
      agendamentos: agendamentosHoje.length,
      atendimentos: atendimentosHoje.length,
      confirmados: agendamentosHoje.filter(a => a.status === 'confirmado').length,
      pendentes: agendamentosHoje.filter(a => a.status === 'pendente').length,
      emAndamento: atendimentosHoje.filter(a => a.status === 'em_andamento').length,
    };
  }, [agendamentos.dados, atendimentos.dados]);

  // Estado de carregamento global
  const carregando = 
    clientes.loading || 
    profissionais.loading || 
    servicos.loading || 
    produtos.loading || 
    agendamentos.loading || 
    atendimentos.loading || 
    transacoes.loading || 
    compras.loading || 
    caixa.loading || 
    usuarios.loading || 
    fornecedores.loading || 
    notificacoes.loading;

  return (
    <DadosContext.Provider value={{
      // Usuário
      usuario,
      
      // Dados (arrays)
      clientes: clientes.dados,
      profissionais: profissionais.dados,
      servicos: servicos.dados,
      produtos: produtos.dados,
      agendamentos: agendamentos.dados,
      atendimentos: atendimentos.dados,
      transacoes: transacoes.dados,
      compras: compras.dados,
      caixa: caixa.dados,
      usuarios: usuarios.dados,
      fornecedores: fornecedores.dados,
      notificacoes: notificacoes.dados,
      
      // Funções CRUD (hooks completos)
      clientesCrud: clientes,
      profissionaisCrud: profissionais,
      servicosCrud: servicos,
      produtosCrud: produtos,
      agendamentosCrud: agendamentos,
      atendimentosCrud: atendimentos,
      transacoesCrud: transacoes,
      comprasCrud: compras,
      caixaCrud: caixa,
      usuariosCrud: usuarios,
      fornecedoresCrud: fornecedores,
      notificacoesCrud: notificacoes,
      
      // Estados
      carregando,
      ultimaAtualizacao,
      
      // Funções auxiliares
      recarregar,
      recarregarTodos,
      calcularTotaisFinanceiros,
      caixaAtual: caixaAtual(),
      estatisticasAgendamentos,
    }}>
      {children}
    </DadosContext.Provider>
  );
}

export function useDadosContext() {
  const context = useContext(DadosContext);
  if (!context) {
    throw new Error('useDadosContext deve ser usado dentro de um DadosProvider');
  }
  return context;
}
