import api from './api';

export const usuariosService = {
  // Login
  login: async (email, senha) => {
    const response = await api.get(`/usuarios?email=${email}&senha=${senha}`);
    if (response.data.length > 0) {
      localStorage.setItem('usuario', JSON.stringify(response.data[0]));
      return response.data[0];
    }
    throw new Error('Usuário ou senha inválidos');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('usuario');
  },

  // Usuário atual
  getUsuarioAtual: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Atualizar perfil
  atualizarPerfil: async (id, dados) => {
    const response = await api.patch(`/usuarios/${id}`, dados);
    localStorage.setItem('usuario', JSON.stringify(response.data));
    return response.data;
  },

  // Alterar senha
  alterarSenha: async (id, senhaAtual, novaSenha) => {
    const usuario = await api.get(`/usuarios/${id}`);
    if (usuario.data.senha !== senhaAtual) {
      throw new Error('Senha atual incorreta');
    }
    const response = await api.patch(`/usuarios/${id}`, { senha: novaSenha });
    return response.data;
  },

  // Buscar permissões
  getPermissoes: (usuario) => {
    return usuario?.permissoes || [];
  },

  // Verificar permissão
  temPermissao: (usuario, permissao) => {
    const permissoes = usuario?.permissoes || [];
    return permissoes.includes(permissao) || permissoes.includes('admin');
  }
};