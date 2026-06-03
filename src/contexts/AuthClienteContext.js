// src/contexts/AuthClienteContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
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

  // 🔥 FUNÇÃO CORRIGIDA PARA BUSCAR CLIENTE NO SUPABASE
  const buscarClienteNoTenant = async (uid, email, empresaId = getTenantContext().empresaId) => {
    if (!empresaId) {
      console.log('❌ Nenhum empresaId fornecido para busca');
      return null;
    }

    console.log('🔍 Buscando cliente por:', { uid, email, empresaId });
    
    try {
      // 1. Buscar pelo authUid (UID do Firebase/Supabase Auth)
      let clientes = await firebaseService.query('clientes', [
        { field: 'authUid', operator: '==', value: uid },
        { field: 'empresaId', operator: '==', value: empresaId }
      ]);
      
      if (clientes && clientes.length > 0) {
        console.log('✅ Cliente encontrado por authUid:', clientes[0].nome);
        return clientes[0];
      }
      
      // 2. Buscar pelo googleUid (para login com Google)
      clientes = await firebaseService.query('clientes', [
        { field: 'googleUid', operator: '==', value: uid },
        { field: 'empresaId', operator: '==', value: empresaId }
      ]);
      
      if (clientes && clientes.length > 0) {
        console.log('✅ Cliente encontrado por googleUid:', clientes[0].nome);
        
        // Atualizar authUid se estiver vazio
        if (!clientes[0].authUid) {
          await firebaseService.update('clientes', clientes[0].id, {
            authUid: uid,
            updatedAt: new Date().toISOString()
          });
          clientes[0].authUid = uid;
        }
        
        return clientes[0];
      }
      
      // 3. Buscar pelo ID direto (se o UID for o ID do documento)
      if (uid) {
        const clientePorId = await firebaseService.getById('clientes', uid);
        if (clientePorId && isClienteDoTenant(clientePorId, empresaId)) {
          console.log('✅ Cliente encontrado por ID direto:', clientePorId.nome);
          return clientePorId;
        }
      }
      
      // 4. Buscar por ID composto (empresaId_uid)
      const compoundId = getClienteTenantDocumentId(empresaId, uid);
      const clientePorCompoundId = await firebaseService.getById('clientes', compoundId);
      if (clientePorCompoundId && isClienteDoTenant(clientePorCompoundId, empresaId)) {
        console.log('✅ Cliente encontrado por ID composto:', clientePorCompoundId.nome);
        return clientePorCompoundId;
      }
      
      // 5. Buscar por email (último recurso)
      if (email) {
        clientes = await firebaseService.query('clientes', [
          { field: 'email', operator: '==', value: email },
          { field: 'empresaId', operator: '==', value: empresaId }
        ]);
        
        if (clientes && clientes.length > 0) {
          console.log('✅ Cliente encontrado por email:', clientes[0].nome);
          
          // Atualiza o authUid para futuras buscas
          const clienteEncontrado = clientes[0];
          if (!clienteEncontrado.authUid || clienteEncontrado.authUid !== uid) {
            await firebaseService.update('clientes', clienteEncontrado.id, {
              authUid: uid,
              updatedAt: new Date().toISOString()
            });
            clienteEncontrado.authUid = uid;
          }
          
          return clienteEncontrado;
        }
      }
      
      console.log('❌ Nenhum cliente encontrado para:', { uid, email, empresaId });
      return null;
      
    } catch (error) {
      console.error('Erro ao buscar cliente no Supabase:', error);
      return null;
    }
  };

  const carregarClientePorUid = async (uid, email) => {
    try {
      const { empresaId } = getTenantContext();
      console.log('🔍 AuthClienteProvider - Buscando cliente para UID no tenant:', uid, empresaId);
      
      const clienteData = await buscarClienteNoTenant(uid, email, empresaId);

      if (clienteData) {
        console.log('✅ AuthClienteProvider - Cliente encontrado:', clienteData.nome);
        setCliente(clienteData);
        setIsAuthenticated(true);
        setTenantContextFromUser(clienteData);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
      } else {
        console.log('❌ AuthClienteProvider - Cliente não encontrado no tenant atual para o UID:', uid);
        setCliente(null);
        setIsAuthenticated(false);
        localStorage.removeItem('cliente');
      }
    } catch (error) {
      console.error('❌ AuthClienteProvider - Erro ao carregar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha, dadosTenant = {}) => {
    try {
      setLoading(true);
      const { empresaId } = ensureClienteTenantContext(dadosTenant);
      
      console.log('🔐 AuthClienteProvider - Tentando login com email:', email);
      
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, senha);
      const user = userCredential.user;
      console.log('✅ AuthClienteProvider - Usuário autenticado:', user.uid);
      
      const clienteData = await buscarClienteNoTenant(user.uid, user.email, empresaId);
      
      if (!isClienteDoTenant(clienteData, empresaId)) {
        console.error('❌ AuthClienteProvider - Cliente não pertence ao tenant atual:', user.uid);
        toast.error('Conta não encontrada para esta empresa. Use o link correto do salão.');
        await signOut(getAuth());
        return { success: false, error: 'cliente_fora_do_tenant' };
      }

      console.log('✅ AuthClienteProvider - Dados do cliente carregados:', clienteData.nome);
      setCliente(clienteData);
      setIsAuthenticated(true);
      setTenantContextFromUser(clienteData);
      localStorage.setItem('cliente', JSON.stringify(clienteData));
      
      toast.success(`Bem-vindo(a), ${clienteData.nome}!`);
      return { success: true, data: clienteData };
      
    } catch (error) {
      console.error('❌ AuthClienteProvider - Erro no login:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Email ou senha inválidos');
      } else if (error.message?.includes('link da empresa')) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao fazer login');
      }
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginComGoogle = async (dadosTenant = {}) => {
    try {
      setLoading(true);
      const { empresaId, empresaNome } = ensureClienteTenantContext(dadosTenant);
      
      console.log('🔐 AuthClienteProvider - Tentando login com Google para empresa:', empresaId);
      
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('✅ AuthClienteProvider - Usuário Google autenticado:', user.uid, user.email);
      
      const clienteData = await buscarClienteNoTenant(user.uid, user.email, empresaId);

      if (clienteData) {
        console.log('✅ AuthClienteProvider - Cliente encontrado no Supabase:', clienteData.nome);
        setCliente(clienteData);
        setIsAuthenticated(true);
        setTenantContextFromUser(clienteData);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
        toast.success(`Bem-vindo(a), ${clienteData.nome}!`);
        return { success: true, data: clienteData };
      } else {
        console.log('⚠️ AuthClienteProvider - Cliente não encontrado, precisa completar cadastro');
        
        const userData = {
          uid: user.uid,
          nome: user.displayName || user.email.split('@')[0],
          email: user.email,
          foto: user.photoURL || null,
          empresaId,
          empresaNome,
        };
        
        setPendingGoogleUser(userData);
        
        return { 
          success: false, 
          needCompletion: true, 
          userData 
        };
      }
      
    } catch (error) {
      console.error('❌ AuthClienteProvider - Erro no login com Google:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelado');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado. Permita popups para este site.');
      } else if (error.message?.includes('link da empresa')) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao fazer login com Google');
      }
      return { success: false, error: error.message };
      
    } finally {
      setLoading(false);
    }
  };

  const completarCadastroGoogle = async (dadosComplementares) => {
    try {
      setLoading(true);
      
      if (!pendingGoogleUser) {
        console.error('❌ AuthClienteProvider - Nenhum usuário pendente');
        toast.error('Nenhum usuário pendente para completar cadastro');
        return { success: false };
      }

      console.log('📝 AuthClienteProvider - Completando cadastro para:', pendingGoogleUser.email);

      const { empresaId: empresaPublicaId, empresaNome: empresaPublicaNome } = ensureClienteTenantContext(dadosComplementares);

      const cpfFormatado = dadosComplementares.cpf;
      
      console.log('🔍 Verificando se CPF já existe:', cpfFormatado);
      
      // Buscar por CPF
      const clientesPorCpf = await firebaseService.query('clientes', [
        { field: 'cpf', operator: '==', value: cpfFormatado },
        { field: 'empresaId', operator: '==', value: empresaPublicaId }
      ]);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        console.log('🔄 AuthClienteProvider - CPF já cadastrado, vinculando conta Google');
        
        const clienteExistente = clientesPorCpf[0];
        
        await firebaseService.update('clientes', clienteExistente.id, {
          googleUid: pendingGoogleUser.uid,
          authUid: pendingGoogleUser.uid,
          foto: pendingGoogleUser.foto || clienteExistente.foto,
          ultimoAcesso: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        const clienteCompleto = {
          ...clienteExistente,
          googleUid: pendingGoogleUser.uid,
          authUid: pendingGoogleUser.uid,
          foto: pendingGoogleUser.foto || clienteExistente.foto
        };
        
        console.log('✅ AuthClienteProvider - Cliente atualizado com Google UID:', clienteCompleto.nome);
        
        setCliente(clienteCompleto);
        setIsAuthenticated(true);
        setTenantContextFromUser(clienteCompleto);
        localStorage.setItem('cliente', JSON.stringify(clienteCompleto));
        setPendingGoogleUser(null);
        
        toast.success(`Bem-vindo(a) de volta, ${clienteCompleto.nome}!`);
        return { success: true, data: clienteCompleto };
      }

      console.log('🆕 AuthClienteProvider - Criando novo cliente');
      
      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      const novoCliente = {
        id: getClienteTenantDocumentId(empresaPublicaId, pendingGoogleUser.uid),
        authUid: pendingGoogleUser.uid,
        googleUid: pendingGoogleUser.uid,
        empresaId: empresaPublicaId,
        empresaNome: empresaPublicaNome,
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
      
      console.log('✅ AuthClienteProvider - Novo cliente criado:', novoCliente.nome);
      
      setCliente(novoCliente);
      setIsAuthenticated(true);
      setTenantContextFromUser(novoCliente);
      localStorage.setItem('cliente', JSON.stringify(novoCliente));
      setPendingGoogleUser(null);
      
      toast.success(`Bem-vindo(a), ${novoCliente.nome}!`);
      return { success: true, data: novoCliente };
      
    } catch (error) {
      console.error('❌ AuthClienteProvider - Erro ao completar cadastro:', error);
      toast.error('Erro ao completar cadastro: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cadastrar = async (dadosCliente) => {
    try {
      setLoading(true);

      console.log('📝 AuthClienteProvider - Cadastrando novo cliente:', dadosCliente.email);

      const { empresaId: empresaPublicaId, empresaNome: empresaPublicaNome } = ensureClienteTenantContext(dadosCliente);

      const cpfFormatado = dadosCliente.cpf;
      
      const cpfConditions = [
        { field: 'cpf', operator: '==', value: cpfFormatado },
        { field: 'empresaId', operator: '==', value: empresaPublicaId }
      ];
      
      const clientesPorCpf = await firebaseService.query('clientes', cpfConditions);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        toast.error('Este CPF já está cadastrado no sistema');
        return false;
      }

      let userCredential;
      try {
        const auth = getAuth();
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          dadosCliente.email, 
          dadosCliente.senha
        );
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          toast.error('Este email já está em uso');
        } else if (error.code === 'auth/weak-password') {
          toast.error('Senha muito fraca. Use pelo menos 6 caracteres');
        } else {
          toast.error('Erro ao criar conta');
        }
        return false;
      }

      const user = userCredential.user;
      console.log('✅ AuthClienteProvider - Usuário criado no Firebase Auth:', user.uid);

      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      const novoCliente = {
        id: getClienteTenantDocumentId(empresaPublicaId, user.uid),
        authUid: user.uid,
        empresaId: empresaPublicaId,
        empresaNome: empresaPublicaNome,
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
        foto: dadosCliente.foto || null,
        dataCadastro: hoje,
        ultimaVisita: null,
        totalGasto: 0,
        totalPontos: 0,
        nivelFidelidade: 'bronze',
        status: 'Regular',
        preferencias: {
          notificacoes: true,
          profissionalPreferido: dadosCliente.profissionalPreferido || '',
          servicosPreferidos: dadosCliente.servicosPreferidos || []
        },
        createdAt: agora,
        updatedAt: agora
      };

      await firebaseService.set('clientes', novoCliente.id, novoCliente);
      
      console.log('✅ AuthClienteProvider - Cliente salvo no Supabase com CPF:', cpfFormatado);
      
      toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
      return true;

    } catch (error) {
      console.error('❌ AuthClienteProvider - Erro no cadastro:', error);
      toast.error('Erro ao realizar cadastro');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('👋 AuthClienteProvider - Fazendo logout');
      await signOut(getAuth());
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setCliente(null);
      setIsAuthenticated(false);
      setPendingGoogleUser(null);
      localStorage.removeItem('cliente');
      clearTenantContext();
      toast.success('Logout realizado com sucesso!');
    }
  };

  const atualizarCliente = async (dadosAtualizados) => {
    try {
      if (!cliente?.id) return false;

      console.log('📝 AuthClienteProvider - Atualizando cliente:', cliente.id);

      await firebaseService.update('clientes', cliente.id, {
        ...dadosAtualizados,
        updatedAt: new Date().toISOString()
      });

      const clienteAtualizado = { ...cliente, ...dadosAtualizados };
      setCliente(clienteAtualizado);
      localStorage.setItem('cliente', JSON.stringify(clienteAtualizado));
      
      toast.success('Dados atualizados com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
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
