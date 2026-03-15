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

  // 🔥 FUNÇÃO AUXILIAR PARA OBTER USUÁRIO
  obterUsuario() {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        return JSON.parse(usuarioStr);
      }
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
    }
    return null;
  }

  // 🔥 REGISTRAR AÇÃO NO LOG
  async registrar(acao, dados = {}) {
    try {
      const ip = await this.obterIp();
      const usuario = this.obrerUsuario();
      
      const agora = new Date().toISOString();

      const log = {
        acao,
        usuario: usuario?.nome || 'Sistema',
        usuarioId: usuario?.id || usuario?.uid || 'sistema',
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
  async registrarCriacao(entidade, entidadeId, dados, detalhes = '') {
    return this.registrar('criar', {
      entidade,
      entidadeId,
      detalhes: detalhes || `Criação de ${entidade}: ${dados.nome || dados.descricao || entidadeId}`,
      dados
    });
  }

  // 🔥 ATUALIZAÇÃO DE REGISTRO
  async registrarAtualizacao(entidade, entidadeId, dadosAntigos, dadosNovos, detalhes = '') {
    const camposAlterados = Object.keys(dadosNovos).filter(
      key => JSON.stringify(dadosAntigos[key]) !== JSON.stringify(dadosNovos[key])
    );

    return this.registrar('atualizar', {
      entidade,
      entidadeId,
      detalhes: detalhes || `Atualização de ${entidade}: ${camposAlterados.length} campo(s) alterado(s)`,
      dados: {
        antes: dadosAntigos,
        depois: dadosNovos,
        camposAlterados
      }
    });
  }

  // 🔥 EXCLUSÃO DE REGISTRO
  async registrarExclusao(entidade, entidadeId, dados, detalhes = '') {
    return this.registrar('excluir', {
      entidade,
      entidadeId,
      detalhes: detalhes || `Exclusão de ${entidade}: ${dados.nome || dados.descricao || entidadeId}`,
      dados
    });
  }

  // 🔥 VISUALIZAÇÃO DE REGISTRO
  async registrarVisualizacao(entidade, entidadeId, detalhes = '') {
    return this.registrar('visualizar', {
      entidade,
      entidadeId,
      detalhes: detalhes || `Visualização de ${entidade}`
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
}

export const auditoriaService = new AuditoriaService();
