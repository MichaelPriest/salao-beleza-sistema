// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { supabaseAuthService } from '../services/supabaseAuth';
import { auditoriaService } from '../services/auditoriaService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const montarUsuario = async (authUser) => {
    if (!authUser?.id) return null;

    const porId = await firebaseService.getById('usuarios', authUser.id).catch(() => null);
    if (porId) return { id: authUser.id, ...porId, isCliente: false };

    const porEmail = await firebaseService.query('usuarios', [
      { field: 'email', operator: '==', value: authUser.email }
    ]).catch(() => []);

    if (porEmail?.length > 0) {
      const usuarioData = porEmail[0];
      await firebaseService.set('usuarios', authUser.id, {
        ...usuarioData,
        uid: authUser.id,
        migrado: true,
        migradoEm: new Date().toISOString()
      });
      return { id: authUser.id, ...usuarioData, isCliente: false };
    }

    return null;
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/cliente')) {
      setLoading(false);
      return;
    }

    supabaseAuthService.handleOAuthCallbackFromUrl().catch((error) => {
      console.warn('OAuth callback com erro:', error.message);
    });

    const unsubscribe = supabaseAuthService.onAuthStateChanged(async ({ user: authUser }) => {
      if (window.location.pathname.startsWith('/cliente')) {
        setLoading(false);
        return;
      }

      if (authUser) {
        try {
          const usuarioCompleto = await montarUsuario(authUser);

          if (usuarioCompleto) {
            setUser(usuarioCompleto);
            localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
          } else {
            toast.error('Usuário não encontrado no sistema');
          }
        } catch (error) {
          console.error('❌ AuthContext - Erro ao buscar usuário:', error);
          await auditoriaService.registrarErro(error, {
            contexto: 'onAuthStateChanged',
            usuarioId: authUser?.id
          }).catch(() => {});
        }
      } else {
        setUser(null);
        localStorage.removeItem('usuario');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, senha) => {
    try {
      const result = await supabaseAuthService.signInWithPassword(email, senha);
      const authUser = result?.user;

      const usuarioCompleto = await montarUsuario(authUser);
      if (!usuarioCompleto) {
        throw new Error('Usuário não encontrado no sistema');
      }

      if (usuarioCompleto.status !== 'ativo') {
        await auditoriaService.registrarAlerta(
          `Tentativa de login de usuário inativo: ${email}`,
          'alto',
          { usuarioId: authUser.id, email }
        );

        await supabaseAuthService.signOut();
        throw new Error('Usuário inativo. Contate o administrador.');
      }

      setUser(usuarioCompleto);
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      await auditoriaService.registrarLogin(usuarioCompleto);

      return usuarioCompleto;
    } catch (error) {
      await auditoriaService.registrarErro(error, { acao: 'login', email }).catch(() => {});
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user) await auditoriaService.registrarLogout(user);
      await supabaseAuthService.signOut();
      setUser(null);
      localStorage.removeItem('usuario');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      await auditoriaService.registrarErro(error, { acao: 'logout', usuarioId: user?.id }).catch(() => {});
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
