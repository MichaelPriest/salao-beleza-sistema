// src/services/auditoriaService.js
import { firebaseService } from './firebase';
import { Timestamp } from 'firebase/firestore';

class AuditoriaService {
  
  // 🔥 FUNÇÃO AUXILIAR PARA OBTER IP
  async obterIp() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Não foi possível obter IP:', error);
      return '127.0.0.1';
    }
  }

  // 🔥 FUNÇÃO AUXILIAR PARA OBTER USUÁRIO - CORRIGIDA
  obterUsuario() {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        return {
          ...usuario,
          id: usuario.id || usuario.uid || 'sistema',
          nome: usuario.nome || 'Usuário'
        };
      }
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
    }
    return { id: 'sistema', nome: 'Sistema' }; // 🔥 FALLBACK
  }

  // 🔥 REGISTRAR AÇÃO NO LOG - CORRIGIDO
  async registrar(acao, dados = {}) {
    try {
      const ip = await this.obterIp();
      const usuario = this.obterUsuario();
      
      const agora = new Date().toISOString();

      // 🔥 GARANTIR QUE USUARIOID NUNCA É UNDEFINED
      const usuarioId = usuario.id || usuario.uid || 'sistema';
      const usuarioNome = usuario.nome || 'Sistema';

      const log = {
        acao,
        usuario: usuarioNome,
        usuarioId: usuarioId, // 🔥 AGORA SEMPRE TEM VALOR
        ip,
        data: agora,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...dados
      };

      // 🔥 REMOVER QUALQUER CAMPO UNDEFINED
      Object.keys(log).forEach(key => {
        if (log[key] === undefined) {
          delete log[key];
        }
      });

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
      entidadeId: usuario?.id || usuario?.uid || 'sistema',
      detalhes: `Login realizado por ${usuario?.nome || usuario?.email || 'Sistema'}`,
      dados: {
        email: usuario?.email,
        cargo: usuario?.cargo
      }
    });
  }

  // 🔥 LOGOUT
  async registrarLogout(usuario) {
    return this.registrar('logout', {
      entidade: 'usuarios',
      entidadeId: usuario?.id || usuario?.uid || 'sistema',
      detalhes: `Logout realizado`
    });
  }

  // 🔥 CRIAÇÃO DE REGISTRO
  async registrarCriacao(entidade, entidadeId, dados, detalhes = '') {
    return this.registrar('criar', {
      entidade,
      entidadeId: entidadeId || 'sem_id',
      detalhes: detalhes || `Criação de ${entidade}: ${dados?.nome || dados?.descricao || entidadeId}`,
      dados: dados || {}
    });
  }

  // 🔥 ATUALIZAÇÃO DE REGISTRO
  async registrarAtualizacao(entidade, entidadeId, dadosAntigos, dadosNovos, detalhes = '') {
    const camposAlterados = Object.keys(dadosNovos || {}).filter(
      key => JSON.stringify(dadosAntigos?.[key]) !== JSON.stringify(dadosNovos?.[key])
    );

    return this.registrar('atualizar', {
      entidade,
      entidadeId: entidadeId || 'sem_id',
      detalhes: detalhes || `Atualização de ${entidade}: ${camposAlterados.length} campo(s) alterado(s)`,
      dados: {
        antes: dadosAntigos || {},
        depois: dadosNovos || {},
        camposAlterados
      }
    });
  }

  // 🔥 EXCLUSÃO DE REGISTRO
  async registrarExclusao(entidade, entidadeId, dados, detalhes = '') {
    return this.registrar('excluir', {
      entidade,
      entidadeId: entidadeId || 'sem_id',
      detalhes: detalhes || `Exclusão de ${entidade}: ${dados?.nome || dados?.descricao || entidadeId}`,
      dados: dados || {}
    });
  }

  // 🔥 VISUALIZAÇÃO DE REGISTRO
  async registrarVisualizacao(entidade, entidadeId, detalhes = '') {
    return this.registrar('visualizar', {
      entidade,
      entidadeId: entidadeId || 'sem_id',
      detalhes: detalhes || `Visualização de ${entidade}`
    });
  }

  // 🔥 ERRO
  async registrarErro(erro, contexto = {}) {
    return this.registrar('erro', {
      detalhes: erro?.message || 'Erro desconhecido',
      dados: {
        stack: erro?.stack,
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
}

export const auditoriaService = new AuditoriaService();
