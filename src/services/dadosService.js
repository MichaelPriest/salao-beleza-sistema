// src/services/dadosService.js
import { firebaseService } from './firebase';
import { notificacoesService } from './notificacoesService';

class DadosService {
  constructor() {
    this.cache = {
      clientes: [],
      profissionais: [],
      servicos: [],
      produtos: [],
      agendamentos: [],
      atendimentos: [],
      transacoes: [],
      compras: [],
      caixa: [],
      usuarios: [],
    };
    this.listeners = [];
    this.carregando = false;
  }

  // Inscrever para receber atualizações
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notificar todos os ouvintes
  notificar() {
    this.listeners.forEach(callback => callback(this.cache));
  }

  // Carregar todos os dados
  async carregarTodos() {
    if (this.carregando) return;
    
    try {
      this.carregando = true;
      console.log('📦 Carregando todos os dados...');

      const [
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
      ] = await Promise.all([
        firebaseService.getAll('clientes').catch(() => []),
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
        firebaseService.getAll('produtos').catch(() => []),
        firebaseService.getAll('agendamentos').catch(() => []),
        firebaseService.getAll('atendimentos').catch(() => []),
        firebaseService.getAll('transacoes').catch(() => []),
        firebaseService.getAll('compras').catch(() => []),
        firebaseService.getAll('caixa').catch(() => []),
        firebaseService.getAll('usuarios').catch(() => []),
      ]);

      this.cache = {
        clientes: Array.isArray(clientes) ? clientes : [],
        profissionais: Array.isArray(profissionais) ? profissionais : [],
        servicos: Array.isArray(servicos) ? servicos : [],
        produtos: Array.isArray(produtos) ? produtos : [],
        agendamentos: Array.isArray(agendamentos) ? agendamentos : [],
        atendimentos: Array.isArray(atendimentos) ? atendimentos : [],
        transacoes: Array.isArray(transacoes) ? transacoes : [],
        compras: Array.isArray(compras) ? compras : [],
        caixa: Array.isArray(caixa) ? caixa : [],
        usuarios: Array.isArray(usuarios) ? usuarios : [],
      };

      console.log('✅ Dados carregados:', {
        clientes: this.cache.clientes.length,
        profissionais: this.cache.profissionais.length,
        servicos: this.cache.servicos.length,
        produtos: this.cache.produtos.length,
        agendamentos: this.cache.agendamentos.length,
        atendimentos: this.cache.atendimentos.length,
        transacoes: this.cache.transacoes.length,
        compras: this.cache.compras.length,
      });

      this.notificar();
      return this.cache;
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      throw error;
    } finally {
      this.carregando = false;
    }
  }

  // Atualizar um item específico
  async atualizar(tipo, id, dados) {
    try {
      await firebaseService.update(tipo, id, dados);
      
      // Atualizar cache
      const index = this.cache[tipo].findIndex(item => item.id === id);
      if (index !== -1) {
        this.cache[tipo][index] = { ...this.cache[tipo][index], ...dados };
      }
      
      this.notificar();
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar ${tipo}:`, error);
      throw error;
    }
  }

  // Adicionar um novo item
  async adicionar(tipo, dados) {
    try {
      const novoId = await firebaseService.add(tipo, dados);
      const novoItem = { ...dados, id: novoId };
      
      this.cache[tipo].push(novoItem);
      this.notificar();
      
      return novoItem;
    } catch (error) {
      console.error(`Erro ao adicionar ${tipo}:`, error);
      throw error;
    }
  }

  // Excluir um item
  async excluir(tipo, id) {
    try {
      await firebaseService.delete(tipo, id);
      
      this.cache[tipo] = this.cache[tipo].filter(item => item.id !== id);
      this.notificar();
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir ${tipo}:`, error);
      throw error;
    }
  }

  // Obter dados do caixa atual
  getCaixaAtual() {
    const caixasAbertos = this.cache.caixa
      .filter(c => c && c.status === 'aberto')
      .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));
    
    return caixasAbertos[0] || null;
  }

  // Calcular totais financeiros
  calcularTotaisFinanceiros(dataInicio, dataFim) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().setDate(1));
    const fim = dataFim ? new Date(dataFim) : new Date();
    fim.setHours(23, 59, 59, 999);

    const transacoes = this.cache.transacoes.filter(t => {
      if (!t.data) return false;
      const data = new Date(t.data);
      return data >= inicio && data <= fim && t.status === 'pago';
    });

    const receitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    const despesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      totalTransacoes: transacoes.length,
    };
  }

  // Obter estatísticas de agendamentos
  getEstatisticasAgendamentos(data) {
    const dataObj = data ? new Date(data) : new Date();
    const dataStr = dataObj.toISOString().split('T')[0];

    const agendamentosHoje = this.cache.agendamentos.filter(a => a.data === dataStr);
    const atendimentosHoje = this.cache.atendimentos.filter(a => a.data === dataStr);

    return {
      agendamentos: agendamentosHoje.length,
      atendimentos: atendimentosHoje.length,
      confirmados: agendamentosHoje.filter(a => a.status === 'confirmado').length,
      pendentes: agendamentosHoje.filter(a => a.status === 'pendente').length,
      emAndamento: atendimentosHoje.filter(a => a.status === 'em_andamento').length,
    };
  }

  // Limpar cache
  limparCache() {
    this.cache = {
      clientes: [],
      profissionais: [],
      servicos: [],
      produtos: [],
      agendamentos: [],
      atendimentos: [],
      transacoes: [],
      compras: [],
      caixa: [],
      usuarios: [],
    };
  }
}

export const dadosService = new DadosService();
