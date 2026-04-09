// src/contexts/AuthClienteContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { supabaseAuthService } from '../services/supabaseAuth';

const AuthClienteContext = createContext({});

export const useAuthCliente = () => useContext(AuthClienteContext);

export const AuthClienteProvider = ({ children }) => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  useEffect(() => {
    // 🔥 VERIFICAÇÃO CRÍTICA: Só ativar se estiver na área do cliente
    const path = window.location.pathname;
    if (!path.startsWith('/cliente')) {
      console.log('🚫 AuthClienteProvider - Ignorando inicialização fora da área do cliente');
      setLoading(false);
      return;
    }

    console.log('✅ AuthClienteProvider - Inicializando na área do cliente');
    
    supabaseAuthService.handleOAuthCallbackFromUrl().catch((error) => {
      console.warn('OAuth callback com erro:', error.message);
    });

    const unsubscribe = supabaseAuthService.onAuthStateChanged(async ({ user }) => {
      console.log('📢 AuthClienteProvider - onAuthStateChanged:', user?.id);
      setFirebaseUser(user);
      
      if (user) {
        // Usuário está logado no Supabase Auth
        await carregarClientePorUid(user.id, user.email);
      } else {
        // Usuário não está logado no Firebase Auth
        console.log('👤 AuthClienteProvider - Nenhum usuário no Firebase Auth');
        
        // 🔥 TENTAR CARREGAR DO LOCALSTORAGE
        const clienteSalvo = localStorage.getItem('cliente');
        if (clienteSalvo) {
          try {
            const clienteData = JSON.parse(clienteSalvo);
            console.log('✅ AuthClienteProvider - Cliente carregado do localStorage:', clienteData);
            setCliente(clienteData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Erro ao carregar cliente do localStorage:', error);
            localStorage.removeItem('cliente');
          }
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 FUNÇÃO CORRIGIDA PARA BUSCAR CLIENTE POR MÚLTIPLOS CRITÉRIOS
  const carregarClientePorUid = async (uid, email) => {
    try {
      console.log('🔍 AuthClienteProvider - Buscando cliente para UID:', uid);
      
      // 🔥 PRIMEIRA TENTATIVA: Buscar cliente pelo UID (ID do documento)
      let clienteData = await firebaseService.getById('clientes', uid);

      // 🔥 SEGUNDA TENTATIVA: Se não encontrar, buscar por googleUid
      if (!clienteData) {
        console.log('🔍 AuthClienteProvider - Cliente não encontrado por UID, buscando por googleUid...');
        
        const clientesPorGoogleUid = await firebaseService.query('clientes', [
          { field: 'googleUid', operator: '==', value: uid }
        ]);
        
        if (clientesPorGoogleUid && clientesPorGoogleUid.length > 0) {
          clienteData = clientesPorGoogleUid[0];
          console.log('✅ AuthClienteProvider - Cliente encontrado por googleUid:', clienteData);
        }
      }

      // 🔥 TERCEIRA TENTATIVA: Buscar por email (fallback)
      if (!clienteData && email) {
        console.log('🔍 AuthClienteProvider - Buscando cliente por email:', email);
        
        const clientesPorEmail = await firebaseService.query('clientes', [
          { field: 'email', operator: '==', value: email }
        ]);
        
        if (clientesPorEmail && clientesPorEmail.length > 0) {
          clienteData = clientesPorEmail[0];
          console.log('✅ AuthClienteProvider - Cliente encontrado por email:', clienteData);
          
          // Se encontrou por email, atualizar com o googleUid para próximos logins
          if (!clienteData.googleUid) {
            await firebaseService.update('clientes', clienteData.id, {
              googleUid: uid,
              updatedAt: new Date().toISOString()
            });
            console.log('✅ AuthClienteProvider - Cliente atualizado com googleUid');
          }
        }
      }

      if (clienteData) {
        console.log('✅ AuthClienteProvider - Cliente encontrado:', clienteData);
        setCliente(clienteData);
        setIsAuthenticated(true);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
      } else {
        console.log('❌ AuthClienteProvider - Cliente não encontrado para o UID:', uid);
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

  // LOGIN COM EMAIL/SENHA
  const login = async (email, senha) => {
    try {
      setLoading(true);
      
      console.log('🔐 AuthClienteProvider - Tentando login com email:', email);
      
      // 1. Autenticar no Supabase Auth
      const result = await supabaseAuthService.signInWithPassword(email, senha);
      const user = result.user;
      console.log('✅ AuthClienteProvider - Usuário autenticado:', user.id);
      
      // 2. Buscar dados do cliente usando o UID
      const clienteData = await firebaseService.getById('clientes', user.id);
      
      if (!clienteData) {
        console.error('❌ AuthClienteProvider - Dados do cliente não encontrados para UID:', user.id);
        toast.error('Dados do cliente não encontrados');
        await supabaseAuthService.signOut();
        return false;
      }

      console.log('✅ AuthClienteProvider - Dados do cliente carregados:', clienteData);

      // 3. Salvar no estado e localStorage
      setCliente(clienteData);
      setIsAuthenticated(true);
      localStorage.setItem('cliente', JSON.stringify(clienteData));
      
      toast.success(`Bem-vindo(a), ${clienteData.nome}!`);
      return { success: true, data: clienteData };
      
    } catch (error) {
      console.error('❌ AuthClienteProvider - Erro no login:', error);
      
      if (error.message?.toLowerCase().includes('invalid login credentials')) {
        toast.error('Email ou senha inválidos');
      } else {
        toast.error('Erro ao fazer login');
      }
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // LOGIN COM GOOGLE
  const loginComGoogle = async () => {
    try {
      setLoading(true);
      await supabaseAuthService.signInWithGoogle('/cliente/login');
      return { success: true };
    } catch (error) {
      console.error('❌ AuthClienteProvider - Erro no login com Google:', error);
      toast.error('Erro ao fazer login com Google');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 🔥 COMPLETAR CADASTRO APÓS LOGIN GOOGLE - CORRIGIDO PARA SALVAR CPF COM MÁSCARA
  const completarCadastroGoogle = async (dadosComplementares) => {
    try {
      setLoading(true);
      
      if (!pendingGoogleUser) {
        console.error('❌ AuthClienteProvider - Nenhum usuário pendente');
        toast.error('Nenhum usuário pendente para completar cadastro');
        return { success: false };
      }

      console.log('📝 AuthClienteProvider - Completando cadastro para:', pendingGoogleUser.email);

      // 🔥 IMPORTANTE: Manter o CPF com a máscara (já vem formatado do input)
      const cpfFormatado = dadosComplementares.cpf; // Ex: "331.200.588-40"
      
      // Para busca, usamos o CPF com máscara para consistência
      const clientesPorCpf = await firebaseService.query('clientes', [
        { field: 'cpf', operator: '==', value: cpfFormatado }
      ]);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        console.log('🔄 AuthClienteProvider - CPF já cadastrado, vinculando conta Google');
        
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
        
        console.log('✅ AuthClienteProvider - Cliente atualizado com Google UID:', clienteCompleto);
        
        setCliente(clienteCompleto);
        setIsAuthenticated(true);
        localStorage.setItem('cliente', JSON.stringify(clienteCompleto));
        setPendingGoogleUser(null);
        
        toast.success(`Bem-vindo(a) de volta, ${clienteCompleto.nome}!`);
        return { success: true, data: clienteCompleto };
      }

      // Se não encontrou CPF, criar novo cliente com todos os dados
      console.log('🆕 AuthClienteProvider - Criando novo cliente');
      
      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      // 🔥 CRIAR CLIENTE COM CPF NO FORMATO COM MÁSCARA E GOOGLEUID
      const novoCliente = {
        id: pendingGoogleUser.uid, // ID do documento = UID do Google
        nome: pendingGoogleUser.nome,
        email: pendingGoogleUser.email,
        foto: pendingGoogleUser.foto,
        cpf: cpfFormatado, // Salva com máscara (ex: "331.200.588-40")
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
        googleUid: pendingGoogleUser.uid, // 🔥 IMPORTANTE: Salvar o googleUid
        dataCadastro: hoje,
        ultimaVisita: new Date().toISOString(),
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

      // 🔥 USAR set EM VEZ DE add PARA GARANTIR O ID CORRETO
      await firebaseService.set('clientes', pendingGoogleUser.uid, novoCliente);
      
      console.log('✅ AuthClienteProvider - Novo cliente criado:', novoCliente);
      
      setCliente(novoCliente);
      setIsAuthenticated(true);
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

  // CADASTRO NORMAL (sem Google)
  const cadastrar = async (dadosCliente) => {
    try {
      setLoading(true);

      console.log('📝 AuthClienteProvider - Cadastrando novo cliente:', dadosCliente.email);

      // 🔥 IMPORTANTE: CPF já deve vir formatado do formulário
      const cpfFormatado = dadosCliente.cpf; // Ex: "331.200.588-40"
      
      // Para busca, usamos o CPF formatado para consistência
      const clientesPorCpf = await firebaseService.query('clientes', [
        { field: 'cpf', operator: '==', value: cpfFormatado }
      ]);

      if (clientesPorCpf && clientesPorCpf.length > 0) {
        toast.error('Este CPF já está cadastrado no sistema');
        return false;
      }

      // 1. Criar usuário no Supabase Auth
      let user;
      try {
        const signUpResult = await supabaseAuthService.signUp(dadosCliente.email, dadosCliente.senha, { nome: dadosCliente.nome });
        user = signUpResult.user;
      } catch (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          toast.error('Este email já está em uso');
        } else {
          toast.error('Erro ao criar conta');
        }
        return false;
      }

      console.log('✅ AuthClienteProvider - Usuário criado no Supabase Auth:', user.id);

      // 2. Criar documento do cliente com o UID do Auth
      const agora = new Date().toISOString();
      const hoje = new Date().toISOString().split('T')[0];

      // 🔥 CRIAR CLIENTE COM CPF NO FORMATO COM MÁSCARA
      const novoCliente = {
        id: user.id,
        nome: dadosCliente.nome,
        email: dadosCliente.email,
        telefone: dadosCliente.telefone,
        cpf: cpfFormatado, // Salva com máscara (ex: "331.200.588-40")
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

      // 3. Salvar no base de dados usando o UID como ID do documento
      await firebaseService.set('clientes', user.id, novoCliente);
      
      console.log('✅ AuthClienteProvider - Cliente salvo no base de dados com CPF:', cpfFormatado);
      
      toast.success('Cadastro realizado com sucesso! Faça o login.');
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
      await supabaseAuthService.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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
