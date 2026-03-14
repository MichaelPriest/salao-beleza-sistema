// src/contexts/AuthClienteContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// 🔥 Configuração do Firebase (use a mesma do seu projeto)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
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

  useEffect(() => {
    // Verificar se há um cliente logado no localStorage
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
  }, []);

  // 🔥 LOGIN COM EMAIL/SENHA
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

  // 🔥 NOVO: LOGIN COM GOOGLE
  const loginComGoogle = async () => {
    try {
      setLoading(true);
      
      // Abrir popup do Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Verificar se o cliente já existe no Firebase
      const clientes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: user.email }
      ]);

      let clienteData;

      if (clientes && clientes.length > 0) {
        // Cliente já existe - atualizar dados
        clienteData = clientes[0];
        
        // Atualizar foto se veio do Google
        if (user.photoURL && !clienteData.foto) {
          await firebaseService.update('clientes', clienteData.id, {
            foto: user.photoURL,
            updatedAt: new Date().toISOString()
          });
          clienteData.foto = user.photoURL;
        }
      } else {
        // Cliente novo - criar registro
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

      // Salvar no estado e localStorage
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

  // 🔥 NOVO: LOGIN COM GOOGLE (versão redirect - alternativa)
  const loginComGoogleRedirect = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
      // O resultado será processado quando a página recarregar
    } catch (error) {
      console.error('Erro no login com Google (redirect):', error);
      toast.error('Erro ao fazer login com Google');
    }
  };

  // 🔥 Processar resultado do redirect (chamar no useEffect)
  useEffect(() => {
    const processarRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Processar o resultado do login
          const user = result.user;
          await processarLoginGoogle(user);
        }
      } catch (error) {
        console.error('Erro ao processar redirect:', error);
      }
    };

    processarRedirect();
  }, []);

  // Função auxiliar para processar usuário do Google
  const processarLoginGoogle = async (user) => {
    try {
      const clientes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: user.email }
      ]);

      let clienteData;

      if (clientes && clientes.length > 0) {
        clienteData = clientes[0];
        
        if (user.photoURL && !clienteData.foto) {
          await firebaseService.update('clientes', clienteData.id, {
            foto: user.photoURL,
            updatedAt: new Date().toISOString()
          });
          clienteData.foto = user.photoURL;
        }
      } else {
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
      
    } catch (error) {
      console.error('Erro ao processar usuário Google:', error);
      toast.error('Erro ao processar login');
    }
  };

  const cadastrar = async (dadosCliente) => {
    try {
      setLoading(true);

      const clientesExistentes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: dadosCliente.email }
      ]);

      if (clientesExistentes && clientesExistentes.length > 0) {
        toast.error('Este email já está cadastrado');
        return false;
      }

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
      
      const { senha: _, ...clienteSemSenha } = { ...novoCliente, id: clienteId };
      
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
      // Fazer logout também do Firebase Auth
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
      login,
      loginComGoogle,
      loginComGoogleRedirect,
      cadastrar,
      logout,
      atualizarCliente
    }}>
      {children}
    </AuthClienteContext.Provider>
  );
};
