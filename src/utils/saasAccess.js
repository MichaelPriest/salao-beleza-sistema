// src/utils/saasAccess.js
export const SAAS_PLATFORM_ROLES = ['superadmin', 'admin_saas', 'saas_admin', 'admin_plataforma'];

export const isSaasPlatformAdmin = (usuario = {}) => {
  if (!usuario) return false;

  return Boolean(
    usuario.isSaasAdmin ||
    usuario.adminSaas ||
    usuario.tipoUsuario === 'saas_admin' ||
    usuario.tipoUsuario === 'plataforma' ||
    SAAS_PLATFORM_ROLES.includes(usuario.cargo) ||
    SAAS_PLATFORM_ROLES.includes(usuario.role) ||
    usuario.permissoes?.includes('admin_saas')
  );
};

export const isTenantUser = (usuario = {}) => Boolean(usuario?.empresaId || usuario?.empresa?.id);
