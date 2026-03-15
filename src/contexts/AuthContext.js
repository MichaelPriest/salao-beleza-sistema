// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService'; // 🔥 NOVO

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log('🔍 AuthContext - Usuário Firebase:', firebaseUser.uid, firebaseUser.email);
          
          // Buscar dados do usuário no Firestore (coleção 'usuarios')
          const userRef = doc(db, 'usuarios', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('✅ AuthContext - Usuário encontrado:', userData);
            
            // IMPORTANTE: Não verificar cliente aqui!
            const usuarioCompleto = { 
              id: firebaseUser.uid, 
              ...userData,
              isCliente: false // Marcar explicitamente que não é cliente
            };
            
            setUser(usuarioCompleto);
            localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
            
          } else {
            console.log('⚠️ AuthContext - Usuário não encontrado no Firestore');
            
            // Tentar buscar por email como fallback
            const usuarios = await firebaseService.query('usuarios', [
              { field: 'email', operator: '==', value: firebaseUser.email }
            ]);
            
            if (usuarios && usuarios.length > 0) {
              const usuarioData = usuarios[0];
              console.log('✅ AuthContext - Usuário encontrado por email:', usuarioData);
              
              // Criar documento com o UID correto
              await setDoc(doc(db, 'usuarios', firebaseUser.uid), {
                ...usuarioData,
                uid: firebaseUser.uid,
                migrado: true,
                migradoEm: new Date().toISOString()
              });
              
              const usuarioCompleto = { 
                id: firebaseUser.uid, 
                ...usuarioData,
                isCliente: false 
              };
              
              setUser(usuarioCompleto);
              localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
            } else {
              console.log('❌ AuthContext - Usuário não encontrado no sistema');
              toast.error('Usuário não encontrado no sistema');
            }
          }
        } catch (error) {
          console.error('❌ AuthContext - Erro ao buscar usuário:', error);
          await auditoriaService.registrarErro(error, { 
            contexto: 'onAuthStateChanged',
            usuarioId: firebaseUser?.uid 
          });
        }
      } else {
        console.log('👋 AuthContext - Usuário deslogado');
        setUser(null);
        localStorage.removeItem('usuario');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 FUNÇÃO PARA OBTER IP DO USUÁRIO
  const obterIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Não foi possível obter IP:', error);
      return '127.0.0.1';
    }
  };

  const login = async (email, senha) => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Login bem-sucedido no Firebase Auth:', firebaseUser.uid);
      
      // Buscar dados do usuário
      const userRef = doc(db, 'usuarios', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log('⚠️ Usuário não encontrado no Firestore, tentando buscar por email...');
        
        const usuarios = await firebaseService.query('usuarios', [
          { field: 'email', operator: '==', value: email }
        ]);
        
        if (usuarios && usuarios.length > 0) {
          const usuarioData = usuarios[0];
          
          // Criar documento com o UID correto
          await setDoc(doc(db, 'usuarios', firebaseUser.uid), {
            ...usuarioData,
            uid: firebaseUser.uid,
            migrado: true,
            migradoEm: new Date().toISOString()
          });
          
          const usuarioCompleto = { 
            id: firebaseUser.uid, 
            ...usuarioData,
            isCliente: false 
          };
          
          setUser(usuarioCompleto);
          localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
          
          // 🔥 REGISTRAR LOGIN NA AUDITORIA
          await auditoriaService.registrarLogin(usuarioCompleto);
          
          return usuarioCompleto;
        } else {
          throw new Error('Usuário não encontrado no sistema');
        }
      }

      const userData = userSnap.data();
      console.log('✅ Dados do usuário carregados:', userData);
      
      // Verificar se está ativo
      if (userData.status !== 'ativo') {
        // 🔥 REGISTRAR TENTATIVA DE LOGIN DE USUÁRIO INATIVO
        await auditoriaService.registrarAlerta(
          `Tentativa de login de usuário inativo: ${email}`,
          'alto',
          { usuarioId: firebaseUser.uid, email }
        );
        
        await signOut(auth);
        throw new Error('Usuário inativo. Contate o administrador.');
      }

      const usuarioCompleto = { 
        id: firebaseUser.uid, 
        ...userData,
        isCliente: false 
      };
      
      setUser(usuarioCompleto);
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      
      // 🔥 REGISTRAR LOGIN NA AUDITORIA
      await auditoriaService.registrarLogin(usuarioCompleto);
      
      return usuarioCompleto;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // 🔥 REGISTRAR ERRO DE LOGIN NA AUDITORIA
      await auditoriaService.registrarErro(error, { 
        acao: 'login',
        email 
      });
      
      // Mapear erros comuns
      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuário não encontrado');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas. Tente novamente mais tarde');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Erro de conexão. Verifique sua internet');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      const auth = getAuth();
      
      // 🔥 REGISTRAR LOGOUT NA AUDITORIA (antes de deslogar)
      if (user) {
        await auditoriaService.registrarLogout(user);
      }
      
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('usuario');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      
      // 🔥 REGISTRAR ERRO DE LOGOUT
      await auditoriaService.registrarErro(error, { 
        acao: 'logout',
        usuarioId: user?.id 
      });
      
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
