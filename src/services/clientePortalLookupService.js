// src/services/clientePortalLookupService.js
import { firebaseService } from './firebase';

const normalizarEmail = (email = '') => String(email || '').trim().toLowerCase();

const getEmpresaCliente = (cliente = {}) => (
  cliente.empresaId ||
  cliente.empresa_id ||
  cliente.tenantId ||
  cliente.tenant_id ||
  cliente.empresa?.id ||
  null
);

const clientePertenceAoTenant = (cliente = {}, empresaId) => {
  if (!cliente || !empresaId) return false;
  const empresaCliente = getEmpresaCliente(cliente);
  if (empresaCliente && String(empresaCliente) === String(empresaId)) return true;
  return Boolean(cliente.id && String(cliente.id).startsWith(`${empresaId}_`));
};

const clienteTemIdentificador = (cliente = {}, uid) => {
  if (!uid) return false;
  const uidString = String(uid);
  return [
    cliente.id,
    cliente.document_id,
    cliente.uid,
    cliente.authUid,
    cliente.auth_uid,
    cliente.googleUid,
    cliente.google_uid,
    cliente.supabaseUid,
    cliente.supabase_uid,
  ].some((value) => value && String(value) === uidString) || Boolean(cliente.id && String(cliente.id).endsWith(`_${uidString}`));
};

const clienteTemEmail = (cliente = {}, email) => {
  const emailNormalizado = normalizarEmail(email);
  if (!emailNormalizado) return false;
  return normalizarEmail(cliente.email) === emailNormalizado;
};

const escolherClienteValido = (clientes = [], { uid, email, empresaId }) => (Array.isArray(clientes) ? clientes : [])
  .find((cliente) => clientePertenceAoTenant(cliente, empresaId) && (
    clienteTemIdentificador(cliente, uid) || clienteTemEmail(cliente, email)
  )) || null;

const buscarPorQuery = async (field, value, empresaId) => {
  if (!value) return [];
  return firebaseService.query('clientes', [
    { field, operator: '==', value },
    { field: 'empresaId', operator: '==', value: empresaId },
  ]).catch(() => []);
};

export const buscarClientePortalNoTenant = async ({ uid, email, empresaId }) => {
  if (!empresaId || (!uid && !email)) return null;

  const idsCandidatos = [
    uid ? `${empresaId}_${uid}` : null,
    uid || null,
  ].filter(Boolean);

  for (const id of idsCandidatos) {
    const clientePorId = await firebaseService.getById('clientes', id).catch(() => null);
    if (clientePorId && clientePertenceAoTenant(clientePorId, empresaId) && (
      clienteTemIdentificador(clientePorId, uid) || clienteTemEmail(clientePorId, email)
    )) {
      return clientePorId;
    }
  }

  const consultas = [];
  if (email) {
    consultas.push(...await buscarPorQuery('email', String(email).trim(), empresaId));
    const emailLower = normalizarEmail(email);
    if (emailLower !== String(email).trim()) {
      consultas.push(...await buscarPorQuery('email', emailLower, empresaId));
    }
  }
  if (uid) {
    consultas.push(...await buscarPorQuery('authUid', uid, empresaId));
    consultas.push(...await buscarPorQuery('googleUid', uid, empresaId));
    consultas.push(...await buscarPorQuery('uid', uid, empresaId));
  }

  const clienteConsultas = escolherClienteValido(consultas, { uid, email, empresaId });
  if (clienteConsultas) return clienteConsultas;

  const clientesTenant = await firebaseService.getAll('clientes').catch(() => []);
  return escolherClienteValido(clientesTenant, { uid, email, empresaId });
};

export const vincularAuthClientePortal = async (cliente, { uid, provider = 'email', foto = null } = {}) => {
  if (!cliente?.id || !uid) return cliente;

  const dadosVinculo = {
    authUid: uid,
    ultimoAcesso: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (provider === 'google') {
    dadosVinculo.googleUid = uid;
    if (foto) dadosVinculo.foto = cliente.foto || foto;
  }

  const precisaAtualizar = Object.entries(dadosVinculo)
    .some(([campo, valor]) => campo !== 'updatedAt' && valor !== undefined && cliente[campo] !== valor);

  if (precisaAtualizar) {
    await firebaseService.update('clientes', cliente.id, dadosVinculo).catch((error) => {
      console.warn('Não foi possível atualizar vínculo Auth do cliente:', error);
    });
  }

  return { ...cliente, ...dadosVinculo };
};

export default {
  buscarClientePortalNoTenant,
  vincularAuthClientePortal,
};
