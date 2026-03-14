// src/contexts/AuthClienteContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged 
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Usuário está logado no Firebase Auth
        await carregarClientePorEmail(user.email);
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

  const carregarClientePorEmail = async (email) => {
    try {
      const clientes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: email }
      ]);

      if (clientes && clientes.length > 0) {
        const clienteData = clientes[0];
        setCliente(clienteData);
        setIsAuthenticated(true);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
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
      
      const clientes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: email }
      ]);

      if (!clientes || clientes.length === 0) {
        toast.error('Email não encontrado');
        return false;
      }

      const clienteEncontrado = clientes[0];
      
      // 🔥 NOTA: Em produção, use hash de senha!
      if (clienteEncontrado.senha !== senha) {
        toast.error('Senha incorreta');
        return false;
      }

      const { senha: _, ...clienteSemSenha } = clienteEncontrado;
      
      setCliente(clienteSemSenha);
      setIsAuthenticated(true);
      localStorage.setItem('cliente', JSON.stringify(clienteSemSenha));
      
      toast.success(`Bem-vindo(a), ${clienteSemSenha.nome}!`);
      return true;
      
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login');
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
      
      // Verificar se o cliente já existe
      const clientes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: user.email }
      ]);

      let clienteData;

      if (clientes && clientes.length > 0) {
        // Cliente já existe
        clienteData = clientes[0];
        
        // Atualizar foto se necessário
        if (user.photoURL && !clienteData.foto) {
          await firebaseService.update('clientes', clienteData.id, {
            foto: user.photoURL,
            updatedAt: new Date().toISOString()
          });
          clienteData.foto = user.photoURL;
        }
      } else {
        // Criar novo cliente
        const agora = new Date().toISOString();
        const hoje = new Date().toISOString().split('T')[0];

        const novoCliente = {
          nome: user.displayName || 'Cliente Google',
          email: user.email,
          foto: user.photoURL || null,
          dataCadastro: hoje,
          ultimaVisita: null,
          totalGasto: 0,
          status: 'Novo',
          preferencias: {
            notificacoes: true,
            profissionalPreferido: '',
            servicosPreferidos: []
          },
          loginGoogle: true,
          googleUid: user.uid,
          createdAt: agora,
          updatedAt: agora
        };

        const clienteId = await firebaseService.add('clientes', novoCliente);
        clienteData = { ...novoCliente, id: clienteId };
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

  const cadastrar = async (dadosCliente) => {
    try {
      setLoading(true);

      // Verificar se email já existe
      const clientesExistentes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: dadosCliente.email }
      ]);

      if (clientesExistentes && clientesExistentes.length > 0) {
        toast.error('Este email já está cadastrado');
        return false;
      }

      // Verificar se CPF já existe
      if (dadosCliente.cpf) {
        const cpfExistentes = await firebaseService.query('clientes', [
          { field: 'cpf', operator: '==', value: dadosCliente.cpf }
        ]);

        if (cpfExistentes && cpfExistentes.length > 0) {
          toast.error('Este CPF já está cadastrado');
          return false;
        }
      }

      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      const novoCliente = {
        ...dadosCliente,
        dataCadastro: hoje,
        ultimaVisita: null,
        totalGasto: 0,
        status: 'Novo',
        preferencias: {
          notificacoes: true,
          profissionalPreferido: '',
          servicosPreferidos: []
        },
        createdAt: agora,
        updatedAt: agora
      };

      const clienteId = await firebaseService.add('clientes', novoCliente);
      
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
