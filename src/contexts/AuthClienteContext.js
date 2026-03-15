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
  signInWithEmailAndPassword
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { removerMascaraCPF } from '../utils/cpfUtils';

// Configuração do Firebase (use as mesmas do seu projeto)
const firebaseConfig = {
  apiKey: "AIzaSyD7z7IjeHAa1BZayqyb4-ExmYz8xOYd5dA",
  authDomain: "fluted-sentry-305001.firebaseapp.com",
  projectId: "fluted-sentry-305001",
  storageBucket: "fluted-sentry-305001.firebasestorage.app",
  messagingSenderId: "386333037191",
  appId: "1:386333037191:web:3b944b250bf676e1901e22"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthClienteContext = createContext({});

export const useAuthCliente = () => useContext(AuthClienteContext);

export const AuthClienteProvider = ({ children }) => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null); // 🔥 NOVO: usuário Google pendente de cadastro

  // 🔥 OUVIR MUDANÇAS NO ESTADO DE AUTENTICAÇÃO DO FIREBASE
  useEffect(() => {
    // 🔥 VERIFICAÇÃO CRÍTICA: Só ativar se estiver na área do cliente
    const path = window.location.pathname;
    if (!path.startsWith('/cliente')) {
      console.log('🚫 AuthClienteProvider - Ignorando inicialização fora da área do cliente');
      setLoading(false);
      return; // Não inicializar fora da área do cliente
    }

    console.log('✅ AuthClienteProvider - Inicializando na área do cliente');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Usuário está logado no Firebase Auth
        await carregarClientePorUid(user.uid);
      } else {
        // Usuário não está logado no Firebase Auth
        const clienteSalvo = localStorage.getItem('cliente');
        if (clienteSalvo) {
          try {
            const clienteData = JSON.parse(clienteSalvo);
            setCliente(clienteData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Erro ao carregar cliente:', error);
            localStorage.removeItem('cliente');
          }
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const carregarClientePorUid = async (uid) => {
    try {
      // Buscar cliente pelo UID (ID do documento)
      const clienteData = await firebaseService.getById('clientes', uid);

      if (clienteData) {
        setCliente(clienteData);
        setIsAuthenticated(true);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
      } else {
        console.log('❌ Cliente não encontrado para o UID:', uid);
        console.log('🚫 AuthClienteProvider - Usuário não é cliente');
        // 🔥 NÃO FAZER LOGOUT AUTOMÁTICO - apenas limpar estado
        setCliente(null);
        setIsAuthenticated(false);
        localStorage.removeItem('cliente');
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN COM EMAIL/SENHA
  const login = async (email, senha) => {
    try {
      setLoading(true);
      
      // 1. Autenticar no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      // 2. Buscar dados do cliente no Firestore usando o UID
      const clienteData = await firebaseService.getById('clientes', user.uid);
      
      if (!clienteData) {
        toast.error('Dados do cliente não encontrados');
        await signOut(auth);
        return false;
      }

      // 3. Salvar no estado e localStorage
      setCliente(clienteData);
      setIsAuthenticated(true);
      localStorage.setItem('cliente', JSON.stringify(clienteData));
      
      toast.success(`Bem-vindo(a), ${clienteData.nome}!`);
      return { success: true, data: clienteData };
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Email ou senha inválidos');
      } else {
        toast.error('Erro ao fazer login');
      }
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOGIN COM GOOGLE - VERSÃO ATUALIZADA COM FLUXO DE CADASTRO
  const loginComGoogle = async () => {
    try {
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Verificar se o cliente já existe no Firestore (pelo UID)
      let clienteData = await firebaseService.getById('clientes', user.uid);

      if (clienteData) {
        // Cliente já existe - login normal
        setCliente(clienteData);
        setIsAuthenticated(true);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
        toast.success(`Bem-vindo(a), ${clienteData.nome}!`);
        return { success: true, data: clienteData };
      } else {
        // Cliente não existe - verificar se já existe por CPF? Não temos CPF ainda
        // Então precisamos de cadastro complementar
        const userData = {
          uid: user.uid,
          nome: user.displayName || 'Cliente Google',
          email: user.email,
          foto: user.photoURL || null,
        };
        
        // Guardar dados do usuário pendente
        setPendingGoogleUser(userData);
        
        // Retornar indicando que precisa completar cadastro
        return { 
          success: false, 
          needCompletion: true, 
          userData 
        };
      }
      
    } catch (error) {
      console.error('Erro no login com Google:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelado');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado. Permita popups para este site.');
      } else {
        toast.error('Erro ao fazer login com Google');
      }
      return { success: false, error: error.message };
      
    } finally {
      setLoading(false);
    }
  };

  // 🔥 COMPLETAR CADASTRO APÓS LOGIN GOOGLE
  const completarCadastroGoogle = async (dadosComplementares) => {
    try {
      setLoading(true);
      
      if (!pendingGoogleUser) {
        toast.error('Nenhum usuário pendente para completar cadastro');
        return false;
      }

      // Verificar se CPF já está cadastrado (evitar duplicatas)
      const cpfLimpo = removerMascaraCPF(dadosComplementares.cpf);
      const clientesPorCpf = await firebaseService.query('clientes', [
        { field: 'cpf', operator: '==', value: cpfLimpo }
      ]);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        // CPF já cadastrado - vincular conta Google ao cliente existente
        const clienteExistente = clientesPorCpf[0];
        
        // Atualizar o cliente com o UID do Google
        await firebaseService.update('clientes', clienteExistente.id, {
          googleUid: pendingGoogleUser.uid,
          foto: pendingGoogleUser.foto || clienteExistente.foto,
          ultimoAcesso: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        const clienteCompleto = {
          ...clienteExistente,
          googleUid: pendingGoogleUser.uid,
          foto: pendingGoogleUser.foto || clienteExistente.foto
        };
        
        setCliente(clienteCompleto);
        setIsAuthenticated(true);
        localStorage.setItem('cliente', JSON.stringify(clienteCompleto));
        setPendingGoogleUser(null);
        
        toast.success(`Bem-vindo(a), ${clienteCompleto.nome}!`);
        return { success: true, data: clienteCompleto };
      }

      // Se não encontrou CPF, criar novo cliente com todos os dados
      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      const novoCliente = {
        id: pendingGoogleUser.uid,
        nome: pendingGoogleUser.nome,
        email: pendingGoogleUser.email,
        foto: pendingGoogleUser.foto,
        cpf: cpfLimpo,
        telefone: dadosComplementares.telefone,
        dataNascimento: dadosComplementares.dataNascimento,
        genero: dadosComplementares.genero,
        cep: dadosComplementares.cep,
        logradouro: dadosComplementares.logradouro,
        numero: dadosComplementares.numero,
        complemento: dadosComplementares.complemento,
        bairro: dadosComplementares.bairro,
        cidade: dadosComplementares.cidade,
        estado: dadosComplementares.estado,
        googleUid: pendingGoogleUser.uid,
        dataCadastro: hoje,
        ultimaVisita: null,
        totalGasto: 0,
        status: 'Regular',
        preferencias: {
          notificacoes: true,
          profissionalPreferido: '',
          servicosPreferidos: []
        },
        createdAt: agora,
        updatedAt: agora
      };

      await firebaseService.set('clientes', pendingGoogleUser.uid, novoCliente);
      
      setCliente(novoCliente);
      setIsAuthenticated(true);
      localStorage.setItem('cliente', JSON.stringify(novoCliente));
      setPendingGoogleUser(null);
      
      toast.success(`Bem-vindo(a), ${novoCliente.nome}!`);
      return { success: true, data: novoCliente };
      
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
      toast.error('Erro ao completar cadastro');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // CADASTRO
  const cadastrar = async (dadosCliente) => {
    try {
      setLoading(true);

      // Verificar se CPF já existe (evitar duplicatas)
      const cpfLimpo = removerMascaraCPF(dadosCliente.cpf);
      const clientesPorCpf = await firebaseService.query('clientes', [
        { field: 'cpf', operator: '==', value: cpfLimpo }
      ]);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        toast.error('Este CPF já está cadastrado no sistema');
        return false;
      }

      // 1. Verificar se email já existe no Firebase Auth (tentando criar)
      let userCredential;
      try {
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

      // 2. Criar documento do cliente com o UID do Firebase Auth
      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      const novoCliente = {
        id: user.uid,
        nome: dadosCliente.nome,
        email: dadosCliente.email,
        telefone: dadosCliente.telefone,
        cpf: cpfLimpo,
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
        profissionalPreferido: dadosCliente.profissionalPreferido || null,
        servicosPreferidos: dadosCliente.servicosPreferidos || [],
        receberPromocoes: dadosCliente.receberPromocoes !== false,
        dataCadastro: hoje,
        ultimaVisita: null,
        totalGasto: 0,
        status: 'Regular',
        preferencias: {
          notificacoes: true,
          profissionalPreferido: dadosCliente.profissionalPreferido || '',
          servicosPreferidos: dadosCliente.servicosPreferidos || []
        },
        createdAt: agora,
        updatedAt: agora
      };

      // 3. Salvar no Firestore usando o UID como ID do documento
      await firebaseService.set('clientes', user.uid, novoCliente);
      
      toast.success('Cadastro realizado com sucesso! Faça o login.');
      return true;

    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao realizar cadastro');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout do Google:', error);
    } finally {
      setCliente(null);
      setIsAuthenticated(false);
      setPendingGoogleUser(null);
      localStorage.removeItem('cliente');
      toast.success('Logout realizado com sucesso!');
    }
  };

  const atualizarCliente = async (dadosAtualizados) => {
    try {
      if (!cliente?.id) return false;

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
      pendingGoogleUser, // 🔥 EXPOR PARA O COMPONENTE DE LOGIN
      login,
      loginComGoogle,
      completarCadastroGoogle, // 🔥 NOVA FUNÇÃO
      cadastrar,
      logout,
      atualizarCliente
    }}>
      {children}
    </AuthClienteContext.Provider>
  );
};
