// src/services/auditoriaService.js
import { firebaseService } from './firebase';
import { Timestamp } from '../services/firebase';

class AuditoriaService {
  
  // 🔥 FUNÇÃO PARA OBTER USUÁRIO DE FORMA SEGURA
  obterUsuarioSeguro() {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        return {
          id: usuario.id || usuario.uid || 'sistema',
          nome: usuario.nome || 'Sistema',
          email: usuario.email || '',
          cargo: usuario.cargo || 'visitante'
        };
      }
    } catch (error) {
      console.warn('Erro ao obter usuário:', error);
    }
    // 🔥 FALLBACK SEMPRE DISPONÍVEL
    return {
      id: 'sistema',
      nome: 'Sistema',
      email: '',
      cargo: 'sistema'
    };
  }

  // 🔥 FUNÇÃO PARA REMOVER UNDEFINED DE QUALQUER OBJETO
  removerUndefined(obj) {
    if (!obj) return {};
    if (typeof obj !== 'object') return obj;
    
    const limpo = {};
    Object.keys(obj).forEach(key => {
      const valor = obj[key];
      
      // 🔥 IGNORA UNDEFINED E FUNÇÕES
      if (valor === undefined || valor === null) {
        return;
      }
      
      if (typeof valor === 'function') {
        return;
      }
      
      if (typeof valor === 'object') {
        const valorLimpo = this.removerUndefined(valor);
        if (Object.keys(valorLimpo).length > 0) {
          limpo[key] = valorLimpo;
        }
      } else {
        limpo[key] = valor;
      }
    });
    return limpo;
  }

  // 🔥 REGISTRAR AÇÃO NO LOG - VERSÃO ULTRA SEGURA
  async registrar(acao, dados = {}) {
    try {
      // 🔥 OBTER USUÁRIO DE FORMA SEGURA
      const usuario = this.obterUsuarioSeguro();
      
      // 🔥 OBTER IP (OPCIONAL, NÃO CRÍTICO)
      let ip = '127.0.0.1';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ip = data.ip || ip;
      } catch (ipError) {
        console.warn('Não foi possível obter IP:', ipError);
      }

      // 🔥 CONSTRUIR OBJETO BASE COM VALORES SEGUROS
      const log = {
        acao: acao || 'acao_nao_especificada',
        usuario: usuario.nome,
        usuarioId: usuario.id, // 🔧 AGORA NUNCA É UNDEFINED
        usuarioEmail: usuario.email,
        usuarioCargo: usuario.cargo,
        ip: ip,
        data: new Date().toISOString(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // 🔥 DADOS ADICIONAIS (JÁ LIMPOS)
        entidade: dados.entidade || 'sistema',
        entidadeId: dados.entidadeId || 'sem_id',
        detalhes: dados.detalhes || '',
      };

      // 🔥 PROCESSAR DADOS ADICIONAIS (SE HOUVER)
      if (dados.dados) {
        log.dados = this.removerUndefined(dados.dados);
      }

      // 🔥 REMOVER QUALQUER UNDEFINED QUE TENHA ESCAPADO
      const logFinal = this.removerUndefined(log);

      console.log('📝 Registrando auditoria:', JSON.stringify(logFinal, null, 2));

      const result = await firebaseService.add('auditoria', logFinal);
      console.log('✅ Auditoria registrada com ID:', result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao registrar auditoria:', error);
      // 🔥 NÃO INTERROMPE O FLUXO PRINCIPAL
      return null;
    }
  }

  // 🔥 MÉTODOS ESPECÍFICOS (TODOS COM FALLBACKS SEGUROS)

  async registrarLogin(usuario) {
    const usuarioSeguro = usuario ? {
      id: usuario.id || usuario.uid || 'sistema',
      nome: usuario.nome || 'Usuário',
      email: usuario.email || '',
      cargo: usuario.cargo || 'visitante'
    } : this.obterUsuarioSeguro();

    return this.registrar('login', {
      entidade: 'usuarios',
      entidadeId: usuarioSeguro.id,
      detalhes: `Login realizado por ${usuarioSeguro.nome}`,
      dados: {
        email: usuarioSeguro.email,
        cargo: usuarioSeguro.cargo
      }
    });
  }

  async registrarLogout(usuario) {
    const usuarioSeguro = usuario ? {
      id: usuario.id || usuario.uid || 'sistema',
      nome: usuario.nome || 'Usuário'
    } : this.obterUsuarioSeguro();

    return this.registrar('logout', {
      entidade: 'usuarios',
      entidadeId: usuarioSeguro.id,
      detalhes: `Logout realizado por ${usuarioSeguro.nome}`
    });
  }

  async registrarCriacao(entidade, entidadeId, dados, detalhes = '') {
    const dadosSeguros = this.removerUndefined(dados || {});
    
    return this.registrar('criar', {
      entidade: entidade || 'desconhecida',
      entidadeId: entidadeId || 'sem_id',
      detalhes: detalhes || `Criação de ${entidade}`,
      dados: dadosSeguros
    });
  }

  async registrarAtualizacao(entidade, entidadeId, dadosAntigos, dadosNovos, detalhes = '') {
    const antigosSeguros = this.removerUndefined(dadosAntigos || {});
    const novosSeguros = this.removerUndefined(dadosNovos || {});
    
    const camposAlterados = Object.keys(novosSeguros).filter(
      key => JSON.stringify(antigosSeguros[key]) !== JSON.stringify(novosSeguros[key])
    );

    return this.registrar('atualizar', {
      entidade: entidade || 'desconhecida',
      entidadeId: entidadeId || 'sem_id',
      detalhes: detalhes || `Atualização de ${entidade}: ${camposAlterados.length} campo(s) alterado(s)`,
      dados: {
        antes: antigosSeguros,
        depois: novosSeguros,
        camposAlterados
      }
    });
  }

  async registrarExclusao(entidade, entidadeId, dados, detalhes = '') {
    const dadosSeguros = this.removerUndefined(dados || {});
    
    return this.registrar('excluir', {
      entidade: entidade || 'desconhecida',
      entidadeId: entidadeId || 'sem_id',
      detalhes: detalhes || `Exclusão de ${entidade}`,
      dados: dadosSeguros
    });
  }

  async registrarVisualizacao(entidade, entidadeId, detalhes = '') {
    return this.registrar('visualizar', {
      entidade: entidade || 'desconhecida',
      entidadeId: entidadeId || 'sem_id',
      detalhes: detalhes || `Visualização de ${entidade}`
    });
  }

  async registrarErro(erro, contexto = {}) {
    const contextoSeguro = this.removerUndefined(contexto || {});
    
    return this.registrar('erro', {
      detalhes: erro?.message || 'Erro desconhecido',
      dados: {
        stack: erro?.stack,
        ...contextoSeguro
      }
    });
  }

  async registrarAlerta(mensagem, nivel = 'medio', dados = {}) {
    const dadosSeguros = this.removerUndefined(dados || {});
    
    return this.registrar('alerta', {
      detalhes: mensagem || 'Alerta sem mensagem',
      dados: {
        nivel: nivel || 'medio',
        ...dadosSeguros
      }
    });
  }
}

// 🔥 EXPORTA UMA INSTÂNCIA ÚNICA
export const auditoriaService = new AuditoriaService();
