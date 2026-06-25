const USUARIO_STORAGE_KEY = 'usuario';
const MAX_USUARIO_STORAGE_CHARS = 24000;

const pick = (obj, keys) => keys.reduce((acc, key) => {
  if (obj && obj[key] !== undefined && obj[key] !== null) acc[key] = obj[key];
  return acc;
}, {});

export const compactarUsuarioParaStorage = (usuario = {}) => {
  const compacto = pick(usuario, [
    'id', 'uid', 'authUid', 'email', 'nome', 'telefone', 'cargo', 'status',
    'empresaId', 'empresaNome', 'tenantId', 'unidadeId', 'unidadeNome',
    'clienteId', 'foto', 'avatar', 'permissoes', 'createdAt', 'updatedAt'
  ]);

  if (usuario.empresa) {
    compacto.empresa = pick(usuario.empresa, ['id', 'nome', 'slug', 'planoId', 'status']);
  }
  if (usuario.unidade) {
    compacto.unidade = pick(usuario.unidade, ['id', 'nome', 'status']);
  }

  return compacto;
};

export const safeSetUsuarioStorage = (usuario) => {
  if (typeof localStorage === 'undefined') return usuario;

  const tentarSalvar = (valor) => {
    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(valor));
    return valor;
  };

  try {
    const json = JSON.stringify(usuario || {});
    if (json.length <= MAX_USUARIO_STORAGE_CHARS) {
      localStorage.setItem(USUARIO_STORAGE_KEY, json);
      return usuario;
    }
    return tentarSalvar(compactarUsuarioParaStorage(usuario));
  } catch (error) {
    const quota = error?.name === 'QuotaExceededError' || error?.code === 22 || String(error?.message || '').toLowerCase().includes('quota');
    if (!quota) throw error;

    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('cache_') || key.startsWith('temp_') || key.startsWith('preview_'))
        .forEach((key) => localStorage.removeItem(key));
      return tentarSalvar(compactarUsuarioParaStorage(usuario));
    } catch (retryError) {
      console.warn('Não foi possível salvar usuario no localStorage; mantendo sessão em memória.', retryError);
      return compactarUsuarioParaStorage(usuario);
    }
  }
};
