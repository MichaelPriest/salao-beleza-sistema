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
        console.log('🚫 AuthClienteProvider - Usuário não é cliente, mantendo logout');
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
      return true;
      
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
      return false;
    } finally {
      setLoading(false);
    }
  };

  // LOGIN COM GOOGLE
  const loginComGoogle = async () => {
    try {
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Verificar se o cliente já existe no Firestore (pelo UID)
      let clienteData = await firebaseService.getById('clientes', user.uid);

      if (!clienteData) {
        // Cliente não existe - criar novo
        const agora = new Date().toISOString();
        const hoje = new Date().toISOString().split('T')[0];

        const novoCliente = {
          id: user.uid,
          nome: user.displayName || 'Cliente Google',
          email: user.email,
          foto: user.photoURL || null,
          dataCadastro: hoje,
          ultimaVisita: null,
          totalGasto: 0,
          status: 'Novo',
          loginGoogle: true,
          googleUid: user.uid,
          preferencias: {
            notificacoes: true,
            profissionalPreferido: '',
            servicosPreferidos: []
          },
          createdAt: agora,
          updatedAt: agora
        };

        await firebaseService.set('clientes', user.uid, novoCliente);
        clienteData = novoCliente;
      }

      setCliente(clienteData);
      setIsAuthenticated(true);
      localStorage.setItem('cliente', JSON.stringify(clienteData));
      
      toast.success(`Bem-vindo(a), ${clienteData.nome}!`);
      return true;
      
    } catch (error) {
      console.error('Erro no login com Google:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelado');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado. Permita popups para este site.');
      } else {
        toast.error('Erro ao fazer login com Google');
      }
      return false;
      
    } finally {
      setLoading(false);
    }
  };

  // CADASTRO
  const cadastrar = async (dadosCliente) => {
    try {
      setLoading(true);

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
        cpf: dadosCliente.cpf || null,
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
        status: 'Novo',
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
      login,
      loginComGoogle,
      cadastrar,
      logout,
      atualizarCliente
    }}>
      {children}
    </AuthClienteContext.Provider>
  );
};
