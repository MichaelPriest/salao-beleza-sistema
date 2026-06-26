// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, getDoc, setDoc, db, setTenantContextFromUser, clearTenantContext } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService'; // 🔥 NOVO
import { caixaService } from '../services/caixaService';
import { safeSetUsuarioStorage } from '../utils/storageUtils';

const AuthContext = createContext({});

const ROTAS_SISTEMA_COM_CAIXA = [
  '/dashboard',
  '/clientes',
  '/servicos',
  '/profissionais',
  '/agendamentos',
  '/agenda',
  '/atendimentos',
  '/atendimento',
  '/financeiro',
  '/compras',
  '/relatorios',
  '/estoque',
  '/fornecedores',
  '/entradas',
  '/empresa',
  '/usuarios',
  '/historico',
  '/auditoria',
  '/perfil',
  '/notificacoes',
  '/selecionar-empresa',
  '/chamados',
  '/manual',
  '/configuracoes',
  '/minhas-comissoes',
  '/importar-servicos',
  '/anamnese',
  '/cupons',
  '/campanhas',
  '/analise-cupons',
  '/disponibilidade',
  '/categorias-produtos',
  '/analise-vendas',
  '/performance',
  '/backup',
  '/logs',
  '/fidelidade',
  '/meus-pontos',
  '/indicacoes'
];

const ROTAS_PUBLICAS_SEM_CAIXA = [
  '/',
  '/login',
  '/cliente',
  '/cadastro',
  '/promocoes',
  '/e',
  '/teste',
  '/403',
  '/500',
  '/manutencao',
  '/saas',
  '/termos-uso',
  '/politica-privacidade'
];

const rotaComecaCom = (pathname, rota) => pathname === rota || pathname.startsWith(`${rota}/`);

const isRotaSistemaComCaixa = (pathname = '/') => {
  const path = pathname || '/';

  if (ROTAS_PUBLICAS_SEM_CAIXA.some((rota) => rota === '/' ? path === '/' : rotaComecaCom(path, rota))) {
    return false;
  }

  return ROTAS_SISTEMA_COM_CAIXA.some((rota) => rotaComecaCom(path, rota));
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [caixaPerguntadoNestaSessao, setCaixaPerguntadoNestaSessao] = useState(false);
  const [pathnameAtual, setPathnameAtual] = useState(() => window.location.pathname);

  useEffect(() => {
    const atualizarPathname = () => setPathnameAtual(window.location.pathname);
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushStateComAtualizacao(...args) {
      const retorno = originalPushState.apply(this, args);
      atualizarPathname();
      return retorno;
    };

    window.history.replaceState = function replaceStateComAtualizacao(...args) {
      const retorno = originalReplaceState.apply(this, args);
      atualizarPathname();
      return retorno;
    };

    window.addEventListener('popstate', atualizarPathname);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', atualizarPathname);
    };
  }, []);

  useEffect(() => {
    // 🔥 CORREÇÃO CRÍTICA: Verificar se está na área do cliente
    const path = window.location.pathname;
    if (path.startsWith('/cliente')) {
      console.log('🚫 AuthContext ignorado na área do cliente');
      setLoading(false);
      return;
    }

    console.log('✅ AuthContext ativo na área administrativa');

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 🔥 CORREÇÃO: Se estiver na área do cliente, não fazer nada
      if (window.location.pathname.startsWith('/cliente')) {
        console.log('🚫 onAuthStateChanged ignorado na área do cliente');
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        try {
          console.log('🔍 AuthContext - Usuário Firebase:', firebaseUser.uid, firebaseUser.email);

          // Buscar dados do usuário no Firestore (coleção 'usuarios')
          const userRef = doc(db, 'usuarios', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('✅ AuthContext - Usuário encontrado:', userData);

            const usuarioCompleto = {
              id: firebaseUser.uid,
              ...userData,
              isCliente: false
            };

            setUser(usuarioCompleto);
            safeSetUsuarioStorage(usuarioCompleto);
            setTenantContextFromUser(usuarioCompleto);

          } else {
            console.log('⚠️ AuthContext - Usuário não encontrado no Firestore');

            // Tentar buscar por email como fallback
            const usuarios = await firebaseService.query('usuarios', [
              { field: 'email', operator: '==', value: firebaseUser.email }
            ]).catch(err => {
              console.log('Erro na query de usuarios:', err);
              return [];
            });

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
              safeSetUsuarioStorage(usuarioCompleto);
              setTenantContextFromUser(usuarioCompleto);
            } else {
              console.log('❌ AuthContext - Usuário não encontrado no sistema');
              // 🔥 IMPORTANTE: Não setar usuário, apenas logar
              toast.error('Usuário não encontrado no sistema');
            }
          }
        } catch (error) {
          console.error('❌ AuthContext - Erro ao buscar usuário:', error);
          // 🔥 IMPORTANTE: Não propagar erro, apenas logar
          await auditoriaService.registrarErro(error, {
            contexto: 'onAuthStateChanged',
            usuarioId: firebaseUser?.uid
          }).catch(() => {});
        }
      } else {
        console.log('👋 AuthContext - Usuário deslogado');
        setUser(null);
        setCaixaPerguntadoNestaSessao(false);
        localStorage.removeItem('usuario');
        clearTenantContext();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (loading || !user || user.isCliente || caixaPerguntadoNestaSessao || !isRotaSistemaComCaixa(pathnameAtual)) {
      return undefined;
    }

    const timer = setTimeout(() => {
      caixaService.perguntarAberturaAoEntrar().catch((error) => {
        console.warn('Não foi possível verificar abertura de caixa após entrada no sistema:', error);
      });
      setCaixaPerguntadoNestaSessao(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [loading, user, caixaPerguntadoNestaSessao, pathnameAtual]);

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

          if (usuarioData.status !== 'ativo') {
            await signOut(auth);
            throw new Error('Usuário inativo. Contate o administrador.');
          }

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
          safeSetUsuarioStorage(usuarioCompleto);
          setTenantContextFromUser(usuarioCompleto);

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
      safeSetUsuarioStorage(usuarioCompleto);
      setTenantContextFromUser(usuarioCompleto);

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

      const mensagem = String(error.message || '').toLowerCase();
      if (mensagem.includes('invalid login credentials')) {
        throw new Error('Email ou senha incorretos');
      }
      if (mensagem.includes('email not confirmed')) {
        throw new Error('Email ainda não confirmado. Verifique sua caixa de entrada.');
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
      await caixaService.perguntarFechamentoAoSair().catch((error) => {
        console.warn('Não foi possível verificar fechamento de caixa no logout:', error);
      });

      await signOut(auth);
      setUser(null);
      setCaixaPerguntadoNestaSessao(false);
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
