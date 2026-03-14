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
          // Buscar dados do usuário no Firestore
          const userRef = doc(db, 'usuarios', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUser({ id: firebaseUser.uid, ...userData });
            localStorage.setItem('usuario', JSON.stringify({ id: firebaseUser.uid, ...userData }));
          } else {
            // Tentar buscar por email
            const usuarios = await firebaseService.query('usuarios', [
              { field: 'email', operator: '==', value: firebaseUser.email }
            ]);
            
            if (usuarios && usuarios.length > 0) {
              const usuarioData = usuarios[0];
              // Criar documento com o UID correto
              await setDoc(doc(db, 'usuarios', firebaseUser.uid), {
                ...usuarioData,
                uid: firebaseUser.uid,
                migrado: true
              });
              setUser({ id: firebaseUser.uid, ...usuarioData });
              localStorage.setItem('usuario', JSON.stringify({ id: firebaseUser.uid, ...usuarioData }));
            } else {
              console.log('Usuário não encontrado no Firestore');
              await signOut(auth);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
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
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const firebaseUser = userCredential.user;
      
      // Buscar dados do usuário
      const userRef = doc(db, 'usuarios', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await signOut(auth);
        throw new Error('Usuário não encontrado no sistema');
      }

      const userData = userSnap.data();
      
      if (userData.status !== 'ativo') {
        await signOut(auth);
        throw new Error('Usuário inativo. Contate o administrador.');
      }

      const usuarioCompleto = { id: firebaseUser.uid, ...userData };
      setUser(usuarioCompleto);
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      
      return usuarioCompleto;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('usuario');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
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
