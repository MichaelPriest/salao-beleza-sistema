// src/services/notificacoesPushService.js
import { firebaseService } from './firebase';
import { browserPushService } from './browserPushService';

const asArray = (value) => Array.isArray(value) ? value : [value];

const uniqueIds = (value) => Array.from(new Set(asArray(value).flatMap((item) => {
  if (!item) return [];
  if (typeof item === 'object') {
    return [item.id, item.uid, item.authUid, item.googleUid, item.clienteId, item.email];
  }
  return [item];
}).filter(Boolean).map(String)));

const getClienteLocalIds = () => {
  try {
    const cliente = JSON.parse(localStorage.getItem('cliente') || localStorage.getItem('clienteLogado') || '{}');
    const firebaseUser = JSON.parse(localStorage.getItem('firebaseUser') || '{}');
    return uniqueIds([cliente, firebaseUser]);
  } catch {
    return [];
  }
};

const notificationMatchesCliente = (notificacao, ids = []) => {
  const normalizedIds = new Set(uniqueIds(ids));
  if (normalizedIds.size === 0) return false;

  const camposDiretos = [
    notificacao.clienteId,
    notificacao.clienteUid,
    notificacao.authUid,
    notificacao.googleUid,
    notificacao.usuarioId,
    notificacao.destinatarioId,
    notificacao.paraClienteId,
    notificacao.email,
    notificacao.clienteEmail,
  ].filter(Boolean).map(String);

  const listas = [
    notificacao.clienteIds,
    notificacao.destinatarios,
    notificacao.destinatariosIds,
    notificacao.usuarios,
  ].flatMap((lista) => Array.isArray(lista) ? lista : []).filter(Boolean).map(String);

  return [...camposDiretos, ...listas].some((id) => normalizedIds.has(id));
};

class NotificacoesPushService {
  constructor() {
    this.listeners = [];
    this.notificacoesNaoLidas = 0;
    this.ultimaNotificacao = null;
  }

  // 🔥 INSCREVER LISTENER PARA RECEBER NOTIFICAÇÕES
  inscrever(callback) {
    this.listeners.push(callback);
    console.log('📋 Listener de notificações inscrito. Total:', this.listeners.length);
    
    // Retornar função para remover listener
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('📋 Listener removido. Total:', this.listeners.length);
    };
  }

  // 🔥 NOTIFICAR TODOS OS LISTENERS
  notificarListeners(notificacao) {
    this.ultimaNotificacao = notificacao;
    this.listeners.forEach(callback => {
      try {
        callback(notificacao);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  // 🔥 ATUALIZAR CONTAGEM DE NÃO LIDAS
  atualizarContagem(quantidade) {
    this.notificacoesNaoLidas = quantidade;
    this.notificarListeners({ 
      tipo: 'contagem', 
      quantidade: this.notificacoesNaoLidas 
    });
  }

  // 🔥 INCREMENTAR CONTAGEM
  incrementarContagem() {
    this.notificacoesNaoLidas++;
    this.notificarListeners({ 
      tipo: 'contagem', 
      quantidade: this.notificacoesNaoLidas 
    });
  }

  // 🔥 ZERAR CONTAGEM
  zerarContagem() {
    this.notificacoesNaoLidas = 0;
    this.notificarListeners({ 
      tipo: 'contagem', 
      quantidade: 0 
    });
  }

  // 🔥 BUSCAR NOTIFICAÇÕES DO CLIENTE
  async buscarNotificacoes(clienteId) {
    try {
      const idsCliente = uniqueIds([clienteId, getClienteLocalIds()]);
      console.log('🔍 Buscando notificações para cliente:', idsCliente);

      if (idsCliente.length === 0) {
        this.atualizarContagem(0);
        return [];
      }

      const buscas = await Promise.all(idsCliente.map((id) =>
        firebaseService.query('notificacoes_cliente', [
          { field: 'clienteId', operator: '==', value: id }
        ], 'data', 'desc').catch(() => [])
      ));

      const todas = await firebaseService.getAll('notificacoes_cliente').catch(() => []);
      let notificacoes = Array.from(new Map([
        ...buscas.flat(),
        ...todas.filter((notificacao) => notificationMatchesCliente(notificacao, idsCliente)),
      ].map((item) => [item.id, item])).values());

      notificacoes.sort((a, b) => new Date(b.createdAt || b.data || 0) - new Date(a.createdAt || a.data || 0));

      // Atualizar contagem
      const naoLidas = notificacoes.filter(n => !n.lida).length;
      this.atualizarContagem(naoLidas);
      
      return notificacoes;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  // 🔥 MARCAR COMO LIDA
  async marcarComoLida(notificacaoId) {
    try {
      await firebaseService.update('notificacoes_cliente', notificacaoId, {
        lida: true,
        lidaEm: new Date().toISOString()
      });
      
      // Decrementar contagem
      if (this.notificacoesNaoLidas > 0) {
        this.notificacoesNaoLidas--;
        this.notificarListeners({ 
          tipo: 'contagem', 
          quantidade: this.notificacoesNaoLidas 
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      return false;
    }
  }

  // 🔥 MARCAR TODAS COMO LIDAS
  async marcarTodasComoLidas(clienteId) {
    try {
      const notificacoes = await this.buscarNotificacoes(clienteId);
      const naoLidas = notificacoes.filter((n) => !n.lida);
      
      const promises = naoLidas.map(n => 
        firebaseService.update('notificacoes_cliente', n.id, {
          lida: true,
          lidaEm: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      
      // Zerar contagem
      this.zerarContagem();
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      return false;
    }
  }

  // 🔥 CRIAR NOTIFICAÇÃO PARA CLIENTE
  async criarNotificacao(dados) {
    try {
      const agora = new Date().toISOString();
      
      const novaNotificacao = {
        ...dados,
        lida: false,
        data: agora,
        createdAt: agora,
        updatedAt: agora
      };
      
      const result = await firebaseService.add('notificacoes_cliente', novaNotificacao);
      console.log('✅ Notificação criada para cliente:', dados.clienteId);

      await browserPushService.notificarNotificacaoCriada(
        { ...novaNotificacao, id: result.id },
        { tipoUsuario: 'cliente', colecaoOrigem: 'notificacoes_cliente', defaultLink: '/cliente/notificacoes' }
      );
      
      // Incrementar contagem para este cliente (simulação)
      // Na prática, isso seria feito via polling ou WebSocket
      
      return { ...novaNotificacao, id: result.id };
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  // 🔥 NOTIFICAÇÃO DE AGENDAMENTO CONFIRMADO
  async notificarAgendamentoConfirmado(agendamento, clienteId) {
    return this.criarNotificacao({
      clienteId,
      tipo: 'agendamento',
      titulo: '✅ Agendamento Confirmado',
      mensagem: `Seu agendamento para ${agendamento.servicoNome} no dia ${new Date(agendamento.data).toLocaleDateString('pt-BR')} às ${agendamento.horario} foi confirmado!`,
      icone: 'check_circle',
      link: '/cliente/agendamentos',
      dados: {
        agendamentoId: agendamento.id,
        data: agendamento.data,
        horario: agendamento.horario,
        servico: agendamento.servicoNome
      }
    });
  }

  // 🔥 NOTIFICAÇÃO DE LEMBRETE
  async notificarLembrete(agendamento, clienteId) {
    return this.criarNotificacao({
      clienteId,
      tipo: 'lembrete',
      titulo: '⏰ Lembrete de Agendamento',
      mensagem: `Você tem um agendamento amanhã às ${agendamento.horario} para ${agendamento.servicoNome}.`,
      icone: 'alarm',
      link: '/cliente/agendamentos',
      dados: {
        agendamentoId: agendamento.id,
        data: agendamento.data,
        horario: agendamento.horario,
        servico: agendamento.servicoNome
      }
    });
  }

  // 🔥 NOTIFICAÇÃO DE PONTOS GANHOS
  async notificarPontosGanhos(clienteId, quantidade, motivo, atendimentoId) {
    return this.criarNotificacao({
      clienteId,
      tipo: 'pontos',
      titulo: '⭐ Pontos Ganhos!',
      mensagem: `Você ganhou ${quantidade} pontos! ${motivo}`,
      icone: 'star',
      link: '/cliente/pontos',
      dados: {
        quantidade,
        motivo,
        atendimentoId
      }
    });
  }

  // 🔥 NOTIFICAÇÃO DE NOVO NÍVEL
  async notificarNovoNivel(clienteId, nivel) {
    return this.criarNotificacao({
      clienteId,
      tipo: 'nivel',
      titulo: '🏆 Novo Nível!',
      mensagem: `Parabéns! Você alcançou o nível ${nivel.toUpperCase()} no programa de fidelidade.`,
      icone: 'emoji_events',
      link: '/cliente/dashboard',
      dados: { nivel }
    });
  }

  // 🔥 NOTIFICAÇÃO DE RECOMPENSA DISPONÍVEL
  async notificarRecompensaDisponivel(clienteId, recompensa) {
    return this.criarNotificacao({
      clienteId,
      tipo: 'recompensa',
      titulo: '🎁 Nova Recompensa Disponível!',
      mensagem: `Você pode resgatar ${recompensa.nome} com ${recompensa.pontosNecessarios} pontos.`,
      icone: 'card_giftcard',
      link: '/cliente/recompensas',
      dados: {
        recompensaId: recompensa.id,
        nome: recompensa.nome,
        pontos: recompensa.pontosNecessarios
      }
    });
  }

  // 🔥 NOTIFICAÇÃO DE RESGATE REALIZADO
  async notificarResgateRealizado(clienteId, recompensa, pontosGastos) {
    return this.criarNotificacao({
      clienteId,
      tipo: 'resgate',
      titulo: '🎁 Resgate Realizado!',
      mensagem: `Você resgatou ${recompensa.nome} com ${pontosGastos} pontos.`,
      icone: 'redeem',
      link: '/cliente/recompensas',
      dados: {
        recompensaId: recompensa.id,
        nome: recompensa.nome,
        pontos: pontosGastos
      }
    });
  }
}

export const notificacoesPushService = new NotificacoesPushService();
