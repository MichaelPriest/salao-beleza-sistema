// src/contexts/AuthClienteContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';

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

  const login = async (email, senha) => {
    try {
      setLoading(true);
      
      // Buscar cliente pelo email
      const clientes = await firebaseService.query('clientes', [
        { field: 'email', operator: '==', value: email }
      ]);

      if (!clientes || clientes.length === 0) {
        toast.error('Email não encontrado');
        return false;
      }

      const clienteEncontrado = clientes[0];
      
      // Verificar senha (simples - em produção use hash)
      if (clienteEncontrado.senha !== senha) {
        toast.error('Senha incorreta');
        return false;
      }

      // Remover senha antes de salvar no estado
      const { senha: _, ...clienteSemSenha } = clienteEncontrado;
      
      setCliente(clienteSemSenha);
      setIsAuthenticated(true);
      
      // Salvar no localStorage
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

      // Preparar dados do cliente
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

      // Salvar no Firebase
      const clienteId = await firebaseService.add('clientes', novoCliente);
      
      // Remover senha antes de retornar
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

  const logout = () => {
    setCliente(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cliente');
    toast.success('Logout realizado com sucesso!');
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
      cadastrar,
      logout,
      atualizarCliente
    }}>
      {children}
    </AuthClienteContext.Provider>
  );
};
