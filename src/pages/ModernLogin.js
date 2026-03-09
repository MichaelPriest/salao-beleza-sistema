import { firebaseService } from '../services/firebase';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const usuariosService = {
  // Login
  login: async (email, senha) => {
    try {
      console.log('🔑 Tentando login com:', email);
      
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      // Buscar dados adicionais do usuário no Firestore
      const usuarios = await firebaseService.query('usuarios', [
        { field: 'email', operator: '==', value: email }
      ]);
      
      if (usuarios.length === 0) {
        throw new Error('Usuário não encontrado no banco de dados');
      }
      
      const usuarioData = usuarios[0];
      
      // Combinar dados do Firebase Auth com dados do Firestore
      const usuarioCompleto = {
        id: user.uid,
        ...usuarioData,
        email: user.email
      };
      
      // Salvar no localStorage para manter a sessão
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      
      console.log('✅ Login bem-sucedido:', usuarioCompleto.nome);
      return usuarioCompleto;
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem('usuario');
      window.dispatchEvent(new CustomEvent('usuarioAtualizado', { detail: null }));
      console.log('👋 Logout realizado');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    }
  },

  // Obter usuário atual
  getUsuarioAtual: () => {
    try {
      const user = localStorage.getItem('usuario');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Erro ao recuperar usuário:', error);
      return null;
    }
  },

  // Verificar se está logado
  isLoggedIn: () => {
    return !!localStorage.getItem('usuario');
  },

  // Atualizar usuário
  atualizar: async (id, dados) => {
    try {
      await firebaseService.update('usuarios', id, dados);
      
      // Atualizar localStorage se for o usuário atual
      const usuarioAtual = usuariosService.getUsuarioAtual();
      if (usuarioAtual && usuarioAtual.id === id) {
        const usuarioAtualizado = { ...usuarioAtual, ...dados };
        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
        window.dispatchEvent(new CustomEvent('usuarioAtualizado', { detail: usuarioAtualizado }));
      }
      
      return { id, ...dados };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  // Criar usuário (para cadastro)
  criar: async (dados) => {
    try {
      const novoUsuario = await firebaseService.add('usuarios', dados);
      return novoUsuario;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }
};

export default usuariosService;
