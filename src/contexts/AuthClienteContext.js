// src/contexts/AuthClienteContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService, supabaseConfig } from '../services/firebase';
import { 
  getAuth, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  setTenantContextFromUser, 
  setTenantContext, 
  getTenantContext, 
  clearTenantContext 
} from '../services/firebase';


const AuthClienteContext = createContext({});

const getEmpresaPublicaContext = () => ({
  empresaId: window.sessionStorage.getItem('empresa_publica_id') || null,
  empresaNome: window.sessionStorage.getItem('empresa_publica_nome') || null,
  empresaSlug: window.sessionStorage.getItem('empresa_publica_slug') || null
});

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

  const buscarClienteNoTenant = async (uid, email, empresaId = getTenantContext().empresaId) => {
    if (!empresaId) {
      console.log('❌ Nenhum empresaId fornecido para busca');
      return null;
    }

    console.log('🔍 Buscando cliente por:', { uid, email, empresaId });
    
    try {
      // Buscar por email (mais confiável)
      if (email) {
        const clientes = await firebaseService.query('clientes', [
          { field: 'email', operator: '==', value: email },
          { field: 'empresaId', operator: '==', value: empresaId }
        ]);
        
        if (clientes && clientes.length > 0) {
          console.log('✅ Cliente encontrado por email:', clientes[0].nome);
          
          // Atualizar authUid se necessário
          const cliente = clientes[0];
          if (!cliente.authUid || cliente.authUid !== uid) {
            await firebaseService.update('clientes', cliente.id, {
              authUid: uid,
              googleUid: uid,
              updatedAt: new Date().toISOString()
            });
            cliente.authUid = uid;
            cliente.googleUid = uid;
          }
          
          return cliente;
        }
      }
      
      // Buscar por authUid
      let clientes = await firebaseService.query('clientes', [
        { field: 'authUid', operator: '==', value: uid },
        { field: 'empresaId', operator: '==', value: empresaId }
      ]);
      
      if (clientes && clientes.length > 0) {
        console.log('✅ Cliente encontrado por authUid:', clientes[0].nome);
        return clientes[0];
      }
      
      // Buscar por googleUid
      clientes = await firebaseService.query('clientes', [
        { field: 'googleUid', operator: '==', value: uid },
        { field: 'empresaId', operator: '==', value: empresaId }
      ]);
      
      if (clientes && clientes.length > 0) {
        console.log('✅ Cliente encontrado por googleUid:', clientes[0].nome);
        return clientes[0];
      }
      
      console.log('❌ Nenhum cliente encontrado');
      return null;
      
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  };

  const carregarClientePorUid = async (uid, email) => {
    try {
      const { empresaId } = getTenantContext();
      console.log('🔍 AuthClienteProvider - Buscando cliente:', { uid, email, empresaId });
      
      const clienteData = await buscarClienteNoTenant(uid, email, empresaId);

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
      
      const clienteData = await buscarClienteNoTenant(user.uid, user.email, empresaId);
      
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

  const loginComGoogle = async (dadosTenant = {}) => {
    try {
      setLoading(true);
      const { empresaId, empresaNome, empresaSlug } = ensureClienteTenantContext(dadosTenant);
      
      console.log('🔐 Login com Google - Empresa:', empresaId);
      
      // Salvar dados da empresa para usar depois do callback
      sessionStorage.setItem('empresa_publica_id', empresaId);
      sessionStorage.setItem('empresa_publica_nome', empresaNome || '');
      sessionStorage.setItem('empresa_publica_slug', empresaSlug || '');
      
      // Construir URL de callback mantendo o slug da empresa no retorno do OAuth.
      const callbackUrl = new URL('/cliente/auth/callback', window.location.origin);
      if (empresaSlug) {
        callbackUrl.searchParams.set('empresa', empresaSlug);
      }
      const redirectTo = encodeURIComponent(callbackUrl.toString());
      
      // URL do Supabase OAuth
      const authUrl = `${supabaseConfig.url}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
      
      console.log('🚀 Redirecionando para Google OAuth');
      
      // Redirecionar para o Supabase
      window.location.href = authUrl;
      
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
      
      const clientesPorCpf = await firebaseService.query('clientes', [
        { field: 'cpf', operator: '==', value: cpfFormatado },
        { field: 'empresaId', operator: '==', value: empresaId }
      ]);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        toast.error('Este CPF já está cadastrado');
        return false;
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

      const user = userCredential.user;
      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      const novoCliente = {
        id: getClienteTenantDocumentId(empresaId, user.uid),
        authUid: user.uid,
        empresaId: empresaId,
        empresaNome: empresaNome,
        nome: dadosCliente.nome,
        email: dadosCliente.email,
        telefone: dadosCliente.telefone,
        cpf: cpfFormatado,
        dataNascimento: dadosCliente.dataNascimento || null,
        dataCadastro: hoje,
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
