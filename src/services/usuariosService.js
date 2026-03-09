import api from './api';

export const usuariosService = {
  // Login
  login: async (email, senha) => {
    try {
      console.log('🔑 Tentando login com:', email);
      
      // Buscar usuário por email
      const response = await api.get(`/usuarios?email=${email}`);
      console.log('📥 Resposta da API:', response.data);
      
      const usuarios = response.data;
      
      if (!usuarios || usuarios.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      const usuario = usuarios[0];
      
      // Verificar senha
      if (usuario.senha !== senha) {
        throw new Error('Senha incorreta');
      }
      
      // Remover senha antes de salvar
      const { senha: _, ...usuarioSemSenha } = usuario;
      
      // Salvar no localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioSemSenha));
      
      // Disparar evento para notificar outros componentes
      window.dispatchEvent(new CustomEvent('usuarioAtualizado', { detail: usuarioSemSenha }));
      
      console.log('✅ Login bem-sucedido:', usuarioSemSenha.nome);
      return usuarioSemSenha;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('usuario');
    window.dispatchEvent(new CustomEvent('usuarioAtualizado', { detail: null }));
    console.log('👋 Logout realizado');
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
      const response = await api.patch(`/usuarios/${id}`, dados);
      const usuario = response.data;
      
      // Atualizar localStorage se for o usuário atual
      const usuarioAtual = usuariosService.getUsuarioAtual();
      if (usuarioAtual && usuarioAtual.id === id) {
        const { senha, ...usuarioSemSenha } = usuario;
        localStorage.setItem('usuario', JSON.stringify(usuarioSemSenha));
        window.dispatchEvent(new CustomEvent('usuarioAtualizado', { detail: usuarioSemSenha }));
      }
      
      return usuario;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
};

export default usuariosService;
