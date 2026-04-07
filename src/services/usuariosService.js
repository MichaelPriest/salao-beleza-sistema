// src/services/usuariosService.js
import { firebaseService } from './firebase';
import { supabaseAuthService } from './supabaseAuth';

class UsuariosService {
  constructor() {
    this.usuario = null;
    this.init();
  }

  async carregarUsuarioAuth(authUser) {
    if (!authUser?.id) return null;

    const usuarioExistente = localStorage.getItem('usuario');
    if (usuarioExistente) {
      try {
        const parsed = JSON.parse(usuarioExistente);
        if (parsed?.id === authUser.id) {
          this.usuario = parsed;
          return parsed;
        }
      } catch (_e) {}
    }

    const porId = await firebaseService.getById('usuarios', authUser.id).catch(() => null);
    if (porId) {
      this.usuario = { id: authUser.id, ...porId };
      localStorage.setItem('usuario', JSON.stringify(this.usuario));
      return this.usuario;
    }

    const usuarios = await firebaseService.query('usuarios', [
      { field: 'email', operator: '==', value: authUser.email }
    ]).catch(() => []);

    if (usuarios?.length > 0) {
      const usuarioData = usuarios[0];
      await firebaseService.set('usuarios', authUser.id, {
        ...usuarioData,
        uid: authUser.id,
        migrado: true,
        migradoEm: new Date().toISOString()
      });

      this.usuario = { id: authUser.id, ...usuarioData };
      localStorage.setItem('usuario', JSON.stringify(this.usuario));
      return this.usuario;
    }

    const novoUsuario = {
      id: authUser.id,
      email: authUser.email,
      nome: (authUser.email || 'usuario').split('@')[0],
      cargo: 'cliente',
      status: 'ativo',
      permissoes: [],
      createdAt: new Date().toISOString()
    };

    this.usuario = novoUsuario;
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    return novoUsuario;
  }

  init() {
    supabaseAuthService.onAuthStateChanged(async ({ user }) => {
      if (user) {
        await this.carregarUsuarioAuth(user).catch((error) => {
          console.error('❌ usuariosService - Erro ao buscar usuário:', error);
        });
      } else {
        this.usuario = null;
        localStorage.removeItem('usuario');
      }
    });
  }

  async login(email, senha) {
    const result = await supabaseAuthService.signInWithPassword(email, senha);
    return this.carregarUsuarioAuth(result.user);
  }

  async logout() {
    const usuario = this.getUsuarioAtual();
    const cargosFuncionario = ['admin', 'gerente', 'atendente', 'profissional'];

    if (usuario && cargosFuncionario.includes(usuario.cargo)) {
      console.warn('🚫 TENTATIVA DE LOGOUT BLOQUEADA - USUÁRIO FUNCIONÁRIO');
      return;
    }

    await supabaseAuthService.signOut();
    this.usuario = null;
    localStorage.removeItem('usuario');
  }

  getUsuarioAtual() {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      try {
        return JSON.parse(usuarioSalvo);
      } catch {
        return null;
      }
    }

    return this.usuario;
  }

  isLoggedIn() {
    return !!this.getUsuarioAtual();
  }

  temPermissao(permissao) {
    const usuario = this.getUsuarioAtual();
    if (!usuario) return false;

    if (usuario.cargo === 'admin') return true;

    return usuario.permissoes && usuario.permissoes.includes(permissao);
  }

  isAdmin() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'admin';
  }

  isGerente() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'gerente';
  }

  isAtendente() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'atendente';
  }

  isProfissional() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'profissional';
  }

  isCliente() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'cliente';
  }

  isFuncionario() {
    const usuario = this.getUsuarioAtual();
    return ['admin', 'gerente', 'atendente', 'profissional'].includes(usuario?.cargo);
  }
}

export const usuariosService = new UsuariosService();
export default usuariosService;
