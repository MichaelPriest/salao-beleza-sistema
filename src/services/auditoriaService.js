// src/services/auditoriaService.js
import { firebaseService } from './firebase';
import { Timestamp } from 'firebase/firestore';

class AuditoriaService {
  
  // 🔥 REGISTRAR AÇÃO NO LOG
  async registrar(acao, dados = {}) {
    try {
      // Obter IP do usuário (se disponível)
      let ip = '127.0.0.1';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ip = data.ip;
      } catch (error) {
        console.warn('Não foi possível obter IP:', error);
      }

      // Obter usuário atual
      const usuarioStr = localStorage.getItem('usuario');
      let usuario = null;
      let usuarioId = null;
      
      if (usuarioStr) {
        try {
          usuario = JSON.parse(usuarioStr);
          usuarioId = usuario.id || usuario.uid;
        } catch (e) {
          console.error('Erro ao parsear usuário:', e);
        }
      }

      const agora = new Date().toISOString();

      const log = {
        acao,
        usuario: usuario?.nome || 'Sistema',
        usuarioId: usuarioId || 'sistema',
        ip,
        data: agora,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...dados
      };

      console.log('📝 Registrando auditoria:', log);

      const result = await firebaseService.add('auditoria', log);
      console.log('✅ Auditoria registrada com ID:', result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao registrar auditoria:', error);
      return null;
    }
  }

  // 🔥 LOGIN
  async registrarLogin(usuario) {
    return this.registrar('login', {
      entidade: 'usuarios',
      entidadeId: usuario.id || usuario.uid,
      detalhes: `Login realizado por ${usuario.nome || usuario.email}`,
      dados: {
        email: usuario.email,
        cargo: usuario.cargo
      }
    });
  }

  // 🔥 LOGOUT
  async registrarLogout(usuario) {
    return this.registrar('logout', {
      entidade: 'usuarios',
      entidadeId: usuario?.id || usuario?.uid || 'desconhecido',
      detalhes: `Logout realizado`
    });
  }

  // 🔥 CRIAÇÃO DE REGISTRO
  async registrarCriacao(entidade, entidadeId, dados, usuarioNome = null) {
    return this.registrar('criar', {
      entidade,
      entidadeId,
      detalhes: `Criação de ${entidade}: ${dados.nome || dados.titulo || entidadeId}`,
      dados
    });
  }

  // 🔥 ATUALIZAÇÃO DE REGISTRO
  async registrarAtualizacao(entidade, entidadeId, dadosAntigos, dadosNovos, usuarioNome = null) {
    const camposAlterados = Object.keys(dadosNovos).filter(
      key => JSON.stringify(dadosAntigos[key]) !== JSON.stringify(dadosNovos[key])
    );

    return this.registrar('atualizar', {
      entidade,
      entidadeId,
      detalhes: `Atualização de ${entidade}: ${camposAlterados.length} campo(s) alterado(s)`,
      dados: {
        antes: dadosAntigos,
        depois: dadosNovos,
        camposAlterados
      }
    });
  }

  // 🔥 EXCLUSÃO DE REGISTRO
  async registrarExclusao(entidade, entidadeId, dados, usuarioNome = null) {
    return this.registrar('excluir', {
      entidade,
      entidadeId,
      detalhes: `Exclusão de ${entidade}: ${dados.nome || dados.titulo || entidadeId}`,
      dados
    });
  }

  // 🔥 VISUALIZAÇÃO DE REGISTRO
  async registrarVisualizacao(entidade, entidadeId, usuarioNome = null) {
    return this.registrar('visualizar', {
      entidade,
      entidadeId,
      detalhes: `Visualização de ${entidade}`
    });
  }

  // 🔥 ERRO
  async registrarErro(erro, contexto = {}) {
    return this.registrar('erro', {
      detalhes: erro.message || 'Erro desconhecido',
      dados: {
        stack: erro.stack,
        ...contexto
      }
    });
  }

  // 🔥 ALERTA DE SEGURANÇA
  async registrarAlerta(mensagem, nivel = 'medio', dados = {}) {
    return this.registrar('alerta', {
      detalhes: mensagem,
      dados: {
        nivel,
        ...dados
      }
    });
  }

  // 🔥 ACESSO NEGADO
  async registrarAcessoNegado(usuario, recurso) {
    return this.registrar('acesso_negado', {
      entidade: recurso,
      detalhes: `Tentativa de acesso negado a ${recurso}`,
      dados: {
        usuario: usuario?.email || 'desconhecido',
        recurso
      }
    });
  }

  // 🔥 BUSCAR LOGS POR USUÁRIO
  async buscarPorUsuario(usuarioId, limite = 100) {
    try {
      const logs = await firebaseService.query('auditoria', [
        { field: 'usuarioId', operator: '==', value: usuarioId }
      ], 'data', 'desc');
      
      return logs.slice(0, limite);
    } catch (error) {
      console.error('Erro ao buscar logs por usuário:', error);
      return [];
    }
  }

  // 🔥 BUSCAR LOGS POR ENTIDADE
  async buscarPorEntidade(entidade, entidadeId, limite = 100) {
    try {
      const logs = await firebaseService.query('auditoria', [
        { field: 'entidade', operator: '==', value: entidade },
        { field: 'entidadeId', operator: '==', value: entidadeId }
      ], 'data', 'desc');
      
      return logs.slice(0, limite);
    } catch (error) {
      console.error('Erro ao buscar logs por entidade:', error);
      return [];
    }
  }

  // 🔥 BUSCAR LOGS POR AÇÃO
  async buscarPorAcao(acao, limite = 100) {
    try {
      const logs = await firebaseService.query('auditoria', [
        { field: 'acao', operator: '==', value: acao }
      ], 'data', 'desc');
      
      return logs.slice(0, limite);
    } catch (error) {
      console.error('Erro ao buscar logs por ação:', error);
      return [];
    }
  }

  // 🔥 BUSCAR LOGS POR PERÍODO
  async buscarPorPeriodo(dataInicio, dataFim, limite = 500) {
    try {
      const logs = await firebaseService.query('auditoria', [
        { field: 'data', operator: '>=', value: dataInicio },
        { field: 'data', operator: '<=', value: dataFim }
      ], 'data', 'desc');
      
      return logs.slice(0, limite);
    } catch (error) {
      console.error('Erro ao buscar logs por período:', error);
      return [];
    }
  }

  // 🔥 OBTER ESTATÍSTICAS
  async obterEstatisticas(periodo = 30) {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - periodo);
      
      const logs = await firebaseService.query('auditoria', [
        { field: 'data', operator: '>=', value: dataLimite.toISOString() }
      ], 'data', 'desc');
      
      const stats = {
        total: logs.length,
        porAcao: {},
        porUsuario: {},
        porEntidade: {},
        porDia: {}
      };

      logs.forEach(log => {
        // Por ação
        stats.porAcao[log.acao] = (stats.porAcao[log.acao] || 0) + 1;
        
        // Por usuário
        if (log.usuario) {
          stats.porUsuario[log.usuario] = (stats.porUsuario[log.usuario] || 0) + 1;
        }
        
        // Por entidade
        if (log.entidade) {
          stats.porEntidade[log.entidade] = (stats.porEntidade[log.entidade] || 0) + 1;
        }
        
        // Por dia
        const dia = log.data?.split('T')[0];
        if (dia) {
          stats.porDia[dia] = (stats.porDia[dia] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }
}

export const auditoriaService = new AuditoriaService();
