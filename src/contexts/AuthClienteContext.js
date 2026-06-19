// src/contexts/AuthClienteContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService, supabaseConfig } from '../services/firebase';
import { buscarClientePortalNoTenant, vincularAuthClientePortal } from '../services/clientePortalLookupService';
import { 
  getAuth, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  setTenantContextFromUser, 
  setTenantContext, 
  getTenantContext, 
  clearTenantContext,
  consumeSupabaseAuthRedirect
} from '../services/firebase';

const AuthClienteContext = createContext({});

const getClienteSalvo = () => {
  try {
    return JSON.parse(localStorage.getItem('cliente') || 'null');
  } catch (error) {
    return null;
  }
};

const getEmpresaPublicaContext = () => {
  const tenant = getTenantContext();
  const clienteSalvo = getClienteSalvo();

  return {
    empresaId: window.sessionStorage.getItem('empresa_publica_id') || tenant.empresaId || clienteSalvo?.empresaId || null,
    empresaNome: window.sessionStorage.getItem('empresa_publica_nome') || tenant.empresa?.nome || clienteSalvo?.empresaNome || null,
    empresaSlug: window.sessionStorage.getItem('empresa_publica_slug') || tenant.empresa?.slug || clienteSalvo?.empresaSlug || null
  };
};

const ensureClienteTenantContext = (dados = {}) => {
  const contexto = getEmpresaPublicaContext();
  const empresaId = dados.empresaId || contexto.empresaId;
  const empresaNome = dados.empresaNome || contexto.empresaNome;

  if (!empresaId) {
    throw new Error('Acesse pelo link da empresa para entrar ou criar sua conta.');
  }

  setTenantContext({ empresaId, empresa: { id: empresaId, nome: empresaNome } });
  return { empresaId, empresaNome, empresaSlug: contexto.empresaSlug };
};

const isClienteDoTenant = (clienteData, empresaId) => Boolean(clienteData?.empresaId && clienteData.empresaId === empresaId);
const getClienteTenantDocumentId = (empresaId, uid) => `${empresaId}_${uid}`;

export const useAuthCliente = () => useContext(AuthClienteContext);

export const AuthClienteProvider = ({ children }) => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (!path.startsWith('/cliente')) {
      console.log('🚫 AuthClienteProvider - Ignorando inicialização fora da área do cliente');
      setLoading(false);
      return;
    }

    if (path === '/cliente/auth/callback') {
      console.log('🚫 AuthClienteProvider - Callback Google será processado pela página dedicada');
      setLoading(false);
      return;
    }

    console.log('✅ AuthClienteProvider - Inicializando na área do cliente');
    
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      console.log('📢 AuthClienteProvider - onAuthStateChanged:', user?.uid);
      setFirebaseUser(user);
      
      if (user) {
        await carregarClientePorUid(user.uid, user.email);
      } else {
        console.log('👤 AuthClienteProvider - Nenhum usuário no Firebase Auth');
        
        const clienteSalvo = localStorage.getItem('cliente');
        if (clienteSalvo) {
          try {
            const clienteData = JSON.parse(clienteSalvo);
            const empresaPublicaId = window.sessionStorage.getItem('empresa_publica_id');
            if (empresaPublicaId && clienteData.empresaId !== empresaPublicaId) {
              throw new Error('Cliente salvo pertence a outro tenant.');
            }
            console.log('✅ AuthClienteProvider - Cliente carregado do localStorage:', clienteData);
            setCliente(clienteData);
            setIsAuthenticated(true);
            setTenantContextFromUser(clienteData);
          } catch (error) {
            console.error('Erro ao carregar cliente do localStorage:', error);
            localStorage.removeItem('cliente');
            clearTenantContext();
          }
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const buscarClienteNoTenant = async (uid, email, empresaId = getTenantContext().empresaId, provider = 'email') => {
    if (!empresaId) {
      console.log('❌ Nenhum empresaId fornecido para busca');
      return null;
    }

    console.log('🔍 Buscando cliente do portal por:', { uid, email, empresaId, provider });

    try {
      const clienteEncontrado = await buscarClientePortalNoTenant({ uid, email, empresaId });

      if (!clienteEncontrado) {
        console.log('❌ Nenhum cliente encontrado no tenant informado');
        return null;
      }

      const clienteVinculado = await vincularAuthClientePortal(clienteEncontrado, { uid, provider });
      console.log('✅ Cliente encontrado para login:', clienteVinculado.nome || clienteVinculado.email);
      return clienteVinculado;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  };

  const carregarClientePorUid = async (uid, email) => {
    try {
      let { empresaId } = getTenantContext();
      const clienteSalvo = getClienteSalvo();

      if (!empresaId && clienteSalvo?.empresaId && (
        clienteSalvo.authUid === uid ||
        clienteSalvo.googleUid === uid ||
        clienteSalvo.email === email ||
        clienteSalvo.id?.endsWith(`_${uid}`)
      )) {
        console.log('🔄 Restaurando tenant do cliente salvo:', clienteSalvo.empresaId);
        setTenantContextFromUser(clienteSalvo);
        empresaId = clienteSalvo.empresaId;
      }

      console.log('🔍 AuthClienteProvider - Buscando cliente:', { uid, email, empresaId });
      
      const clienteData = await buscarClienteNoTenant(uid, email, empresaId, 'email');

      if (clienteData) {
        console.log('✅ Cliente encontrado:', clienteData.nome);
        setCliente(clienteData);
        setIsAuthenticated(true);
        setTenantContextFromUser(clienteData);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
      } else {
        console.log('❌ Cliente não encontrado');
        setCliente(null);
        setIsAuthenticated(false);
        localStorage.removeItem('cliente');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha, dadosTenant = {}) => {
    try {
      setLoading(true);
      const { empresaId } = ensureClienteTenantContext(dadosTenant);
      
      console.log('🔐 Login com email:', email);
      
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, senha);
      const user = userCredential.user;
      
      const clienteData = await buscarClienteNoTenant(user.uid, user.email, empresaId, 'email');
      
      if (!clienteData) {
        toast.error('Conta não encontrada para esta empresa');
        await signOut(getAuth());
        return { success: false, error: 'cliente_fora_do_tenant' };
      }

      setCliente(clienteData);
      setIsAuthenticated(true);
      setTenantContextFromUser(clienteData);
      localStorage.setItem('cliente', JSON.stringify(clienteData));
      
      toast.success(`Bem-vindo(a), ${clienteData.nome}!`);
      return { success: true, data: clienteData };
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      toast.error('Email ou senha inválidos');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO CORRIGIDA - Login com Google usando PKCE
  const loginComGoogle = async (dadosTenant = {}) => {
    try {
      setLoading(true);
      const { empresaId, empresaNome, empresaSlug } = ensureClienteTenantContext(dadosTenant);
      
      console.log('🔐 Login com Google - Empresa:', empresaId);
      
      // Salvar dados da empresa para usar depois do callback
      sessionStorage.setItem('empresa_publica_id', empresaId);
      sessionStorage.setItem('empresa_publica_nome', empresaNome || '');
      sessionStorage.setItem('empresa_publica_slug', empresaSlug || '');
      
      // Construir URL de callback mantendo o slug da empresa
      const callbackUrl = new URL('/cliente/auth/callback', window.location.origin);
      if (empresaSlug) {
        callbackUrl.searchParams.set('empresa', empresaSlug);
      }

      // Limpar tokens antigos
      localStorage.removeItem('supabase.auth.session');
      localStorage.removeItem('supabase.access_token');
      sessionStorage.removeItem('pending_google_user');
      sessionStorage.setItem('cliente_google_oauth_started_at', new Date().toISOString());

      // Não enviar response_type: o Supabase precisa controlar code/state no callback do Google.
      const authUrl = new URL(`${supabaseConfig.url}/auth/v1/authorize`);
      authUrl.searchParams.set('provider', 'google');
      authUrl.searchParams.set('redirect_to', callbackUrl.toString());
      authUrl.searchParams.set('prompt', 'select_account');
      
      console.log('🚀 Redirecionando para Google OAuth');
      console.log('🔗 URL:', authUrl.toString());
      
      // Redirecionar para o Supabase
      window.location.href = authUrl.toString();
      
      return { success: false, redirecting: true };
      
    } catch (error) {
      console.error('❌ Erro no login com Google:', error);
      toast.error('Erro ao iniciar login com Google');
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const completarCadastroGoogle = async (dadosComplementares) => {
    try {
      setLoading(true);
      
      const pendingUserStr = sessionStorage.getItem('pending_google_user');
      if (!pendingUserStr) {
        console.error('❌ Nenhum usuário pendente');
        toast.error('Sessão expirada. Tente novamente.');
        return { success: false };
      }
      
      const pendingGoogleUser = JSON.parse(pendingUserStr);
      console.log('📝 Completando cadastro para:', pendingGoogleUser.email);

      const { empresaId, empresaNome } = ensureClienteTenantContext(dadosComplementares);

      const cpfFormatado = dadosComplementares.cpf;
      
      // Verificar se CPF já existe
      const clientesPorCpf = await firebaseService.query('clientes', [
        { field: 'cpf', operator: '==', value: cpfFormatado },
        { field: 'empresaId', operator: '==', value: empresaId }
      ]);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        console.log('🔄 CPF já cadastrado, vinculando conta Google');
        
        const clienteExistente = clientesPorCpf[0];
        
        await firebaseService.update('clientes', clienteExistente.id, {
          googleUid: pendingGoogleUser.uid,
          authUid: pendingGoogleUser.uid,
          foto: pendingGoogleUser.foto,
          ultimoAcesso: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        const clienteCompleto = { ...clienteExistente, authUid: pendingGoogleUser.uid, googleUid: pendingGoogleUser.uid };
        
        setCliente(clienteCompleto);
        setIsAuthenticated(true);
        localStorage.setItem('cliente', JSON.stringify(clienteCompleto));
        sessionStorage.removeItem('pending_google_user');
        
        toast.success(`Bem-vindo(a) de volta, ${clienteCompleto.nome}!`);
        return { success: true, data: clienteCompleto };
      }

      console.log('🆕 Criando novo cliente');
      
      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      const novoCliente = {
        id: getClienteTenantDocumentId(empresaId, pendingGoogleUser.uid),
        authUid: pendingGoogleUser.uid,
        googleUid: pendingGoogleUser.uid,
        empresaId: empresaId,
        empresaNome: empresaNome,
        nome: pendingGoogleUser.nome,
        email: pendingGoogleUser.email,
        foto: pendingGoogleUser.foto,
        cpf: cpfFormatado,
        telefone: dadosComplementares.telefone || '',
        dataNascimento: dadosComplementares.dataNascimento || null,
        genero: dadosComplementares.genero || null,
        cep: dadosComplementares.cep || null,
        logradouro: dadosComplementares.logradouro || null,
        numero: dadosComplementares.numero || null,
        complemento: dadosComplementares.complemento || null,
        bairro: dadosComplementares.bairro || null,
        cidade: dadosComplementares.cidade || null,
        estado: dadosComplementares.estado || null,
        dataCadastro: hoje,
        ultimaVisita: new Date().toISOString(),
        totalGasto: 0,
        totalPontos: 0,
        nivelFidelidade: 'bronze',
        status: 'Regular',
        preferencias: {
          notificacoes: true,
          profissionalPreferido: '',
          servicosPreferidos: []
        },
        createdAt: agora,
        updatedAt: agora
      };

      await firebaseService.set('clientes', novoCliente.id, novoCliente);
      
      setCliente(novoCliente);
      setIsAuthenticated(true);
      localStorage.setItem('cliente', JSON.stringify(novoCliente));
      sessionStorage.removeItem('pending_google_user');
      
      toast.success(`Bem-vindo(a), ${novoCliente.nome}!`);
      return { success: true, data: novoCliente };
      
    } catch (error) {
      console.error('❌ Erro ao completar cadastro:', error);
      toast.error('Erro ao completar cadastro');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cadastrar = async (dadosCliente) => {
    try {
      setLoading(true);
      const { empresaId, empresaNome } = ensureClienteTenantContext(dadosCliente);

      const cpfFormatado = dadosCliente.cpf;

      if (cpfFormatado) {
        const clientesPorCpf = await firebaseService.query('clientes', [
          { field: 'cpf', operator: '==', value: cpfFormatado },
          { field: 'empresaId', operator: '==', value: empresaId }
        ]);

        if (clientesPorCpf && clientesPorCpf.length > 0) {
          toast.error('Este CPF já está cadastrado');
          return false;
        }
      }

      let userCredential;
      try {
        const auth = getAuth();
        userCredential = await createUserWithEmailAndPassword(auth, dadosCliente.email, dadosCliente.senha);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          toast.error('Este email já está em uso');
        } else {
          toast.error('Erro ao criar conta');
        }
        return false;
      }

      const user = userCredential?.user || null;
      const authUid = user?.uid || user?.id || null;
      const clienteId = authUid
        ? getClienteTenantDocumentId(empresaId, authUid)
        : getClienteTenantDocumentId(empresaId, firebaseService.generateId('clientes'));
      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      const novoCliente = {
        id: clienteId,
        authUid,
        empresaId: empresaId,
        empresaNome: empresaNome,
        nome: dadosCliente.nome,
        email: dadosCliente.email,
        telefone: dadosCliente.telefone,
        cpf: cpfFormatado,
        dataNascimento: dadosCliente.dataNascimento || null,
        genero: dadosCliente.genero || null,
        cep: dadosCliente.cep || null,
        logradouro: dadosCliente.logradouro || null,
        numero: dadosCliente.numero || null,
        complemento: dadosCliente.complemento || null,
        bairro: dadosCliente.bairro || null,
        cidade: dadosCliente.cidade || null,
        estado: dadosCliente.estado || null,
        endereco: {
          cep: dadosCliente.cep || null,
          logradouro: dadosCliente.logradouro || null,
          numero: dadosCliente.numero || null,
          complemento: dadosCliente.complemento || null,
          bairro: dadosCliente.bairro || null,
          cidade: dadosCliente.cidade || null,
          estado: dadosCliente.estado || null,
        },
        dataCadastro: hoje,
        totalGasto: 0,
        totalPontos: 0,
        nivelFidelidade: 'bronze',
        status: 'Regular',
        preferencias: {
          notificacoes: dadosCliente.receberPromocoes !== false,
          receberPromocoes: dadosCliente.receberPromocoes !== false,
          profissionalPreferido: dadosCliente.profissionalPreferido || '',
          servicosPreferidos: Array.isArray(dadosCliente.servicosPreferidos) ? dadosCliente.servicosPreferidos : []
        },
        acessoPortalPendente: !authUid,
        createdAt: agora,
        updatedAt: agora
      };

      await firebaseService.set('clientes', novoCliente.id, novoCliente);
      
      toast.success('Cadastro realizado!');
      return true;

    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      toast.error('Erro ao realizar cadastro');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(getAuth());
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setCliente(null);
      setIsAuthenticated(false);
      setPendingGoogleUser(null);
      localStorage.removeItem('cliente');
      clearTenantContext();
      toast.success('Logout realizado!');
    }
  };

  const atualizarCliente = async (dadosAtualizados) => {
    try {
      if (!cliente?.id) return false;
      await firebaseService.update('clientes', cliente.id, dadosAtualizados);
      const clienteAtualizado = { ...cliente, ...dadosAtualizados };
      setCliente(clienteAtualizado);
      localStorage.setItem('cliente', JSON.stringify(clienteAtualizado));
      toast.success('Dados atualizados!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar dados');
      return false;
    }
  };

  return (
    <AuthClienteContext.Provider value={{
      cliente,
      loading,
      isAuthenticated,
      firebaseUser,
      pendingGoogleUser,
      login,
      loginComGoogle,
      completarCadastroGoogle,
      cadastrar,
      logout,
      atualizarCliente
    }}>
      {children}
    </AuthClienteContext.Provider>
  );
};
