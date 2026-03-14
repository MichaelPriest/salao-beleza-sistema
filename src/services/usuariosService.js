// src/services/usuariosService.js
import { firebaseService } from './firebase';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

class UsuariosService {
  constructor() {
    this.usuario = null;
    this.auth = getAuth();
    this.init();
  }

  init() {
    // Ouvir mudanças na autenticação
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Usuário logado no Firebase Auth
        try {
          console.log('🔍 usuariosService - Usuário Firebase:', user.uid, user.email);
          
          // 🔥 VERIFICAR SE JÁ EXISTE USUÁRIO NO LOCALSTORAGE
          const usuarioExistente = localStorage.getItem('usuario');
          if (usuarioExistente) {
            try {
              const usuarioParsed = JSON.parse(usuarioExistente);
              if (usuarioParsed && usuarioParsed.id === user.uid) {
                console.log('✅ usuariosService - Usuário já existe no localStorage, mantendo:', usuarioParsed);
                this.usuario = usuarioParsed;
                
                // 🔥 PROTEÇÃO EXTRA: Verificar se é funcionário e NUNCA deslogar
                const cargosFuncionario = ['admin', 'gerente', 'atendente', 'profissional'];
                if (cargosFuncionario.includes(usuarioParsed.cargo)) {
                  console.log('🛡️ USUÁRIO É FUNCIONÁRIO - PROTEGIDO CONTRA LOGOUT');
                  
                  // Sobrescrever o método logout temporariamente
                  const originalSignOut = this.auth.signOut;
                  this.auth.signOut = function() {
                    console.warn('🚫 TENTATIVA DE LOGOUT BLOQUEADA - USUÁRIO FUNCIONÁRIO');
                    return Promise.resolve();
                  };
                  
                  // Restaurar após 5 segundos
                  setTimeout(() => {
                    this.auth.signOut = originalSignOut;
                  }, 5000);
                }
                
                return; // 🔥 IMPORTANTE: Não continuar a execução
              }
            } catch (e) {
              console.warn('⚠️ Erro ao parsear usuário do localStorage:', e);
            }
          }
          
          // Buscar dados no Firestore
          const userRef = doc(db, 'usuarios', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            this.usuario = { id: user.uid, ...userSnap.data() };
            console.log('✅ usuariosService - Usuário encontrado:', this.usuario);
            localStorage.setItem('usuario', JSON.stringify(this.usuario));
          } else {
            console.log('⚠️ usuariosService - Usuário não encontrado no Firestore, tentando buscar por email...');
            
            // Tentar buscar por email
            const usuarios = await firebaseService.query('usuarios', [
              { field: 'email', operator: '==', value: user.email }
            ]);
            
            if (usuarios && usuarios.length > 0) {
              const usuarioData = usuarios[0];
              console.log('✅ usuariosService - Usuário encontrado por email:', usuarioData);
              
              // Criar documento com o UID correto
              await setDoc(doc(db, 'usuarios', user.uid), {
                ...usuarioData,
                uid: user.uid,
                migrado: true,
                migradoEm: new Date().toISOString()
              });
              
              this.usuario = { id: user.uid, ...usuarioData };
              localStorage.setItem('usuario', JSON.stringify(this.usuario));
            } else {
              console.log('❌ usuariosService - Usuário não encontrado no sistema');
              
              // 🔥 NÃO FAZER LOGOUT! Apenas registrar
              console.log('⚠️ Mantendo usuário logado mesmo sem dados completos');
              
              // Verificar se o AuthContext já tem o usuário
              const authUser = localStorage.getItem('usuario');
              if (authUser) {
                console.log('✅ Mantendo usuário do AuthContext');
                this.usuario = JSON.parse(authUser);
              } else {
                // Criar usuário básico
                const novoUsuario = {
                  id: user.uid,
                  email: user.email,
                  nome: user.email.split('@')[0],
                  cargo: 'cliente',
                  status: 'ativo',
                  permissoes: [],
                  createdAt: new Date().toISOString()
                };
                
                console.log('✅ usuariosService - Criando usuário básico:', novoUsuario);
                this.usuario = novoUsuario;
                localStorage.setItem('usuario', JSON.stringify(novoUsuario));
              }
            }
          }
        } catch (error) {
          console.error('❌ usuariosService - Erro ao buscar usuário:', error);
        }
      } else {
        console.log('👋 usuariosService - Usuário deslogado');
        this.usuario = null;
        localStorage.removeItem('usuario');
      }
    });
  }

  // Login
  async login(email, senha) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, senha);
      const user = userCredential.user;
      
      console.log('✅ usuariosService - Login bem-sucedido:', user.uid);
      
      // Buscar dados do usuário no Firestore
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log('⚠️ usuariosService - Usuário não encontrado no Firestore, tentando buscar por email...');
        
        const usuarios = await firebaseService.query('usuarios', [
          { field: 'email', operator: '==', value: email }
        ]);
        
        if (usuarios && usuarios.length > 0) {
          const usuarioData = usuarios[0];
          
          // Criar documento com o UID correto
          await setDoc(doc(db, 'usuarios', user.uid), {
            ...usuarioData,
            uid: user.uid,
            migrado: true,
            migradoEm: new Date().toISOString()
          });
          
          this.usuario = { id: user.uid, ...usuarioData };
          localStorage.setItem('usuario', JSON.stringify(this.usuario));
          
          return this.usuario;
        } else {
          // Criar um documento básico para o usuário
          const novoUsuario = {
            email: user.email,
            nome: user.email.split('@')[0],
            cargo: 'cliente',
            status: 'ativo',
            createdAt: new Date().toISOString(),
            permissoes: []
          };
          
          console.log('✅ usuariosService - Criando novo usuário:', novoUsuario);
          
          await setDoc(doc(db, 'usuarios', user.uid), novoUsuario);
          
          this.usuario = { id: user.uid, ...novoUsuario };
          localStorage.setItem('usuario', JSON.stringify(this.usuario));
          
          return this.usuario;
        }
      }

      const usuarioData = userSnap.data();
      console.log('✅ usuariosService - Dados do usuário carregados:', usuarioData);
      
      // Verificar se está ativo
      if (usuarioData.status !== 'ativo') {
        await this.logout();
        throw new Error('Usuário inativo. Contate o administrador.');
      }

      this.usuario = { id: user.uid, ...usuarioData };
      localStorage.setItem('usuario', JSON.stringify(this.usuario));
      
      return this.usuario;
    } catch (error) {
      console.error('❌ usuariosService - Erro no login:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      // 🔥 PROTEÇÃO: Verificar se é funcionário antes de deslogar
      const usuario = this.getUsuarioAtual();
      const cargosFuncionario = ['admin', 'gerente', 'atendente', 'profissional'];
      
      if (usuario && cargosFuncionario.includes(usuario.cargo)) {
        console.warn('🚫 TENTATIVA DE LOGOUT BLOQUEADA - USUÁRIO FUNCIONÁRIO');
        return; // Não faz logout
      }
      
      await signOut(this.auth);
      this.usuario = null;
      localStorage.removeItem('usuario');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Obter usuário atual
  getUsuarioAtual() {
    // Tentar pegar do localStorage primeiro
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      try {
        return JSON.parse(usuarioSalvo);
      } catch {
        return null;
      }
    }
    return this.usuario;
  }

  // Verificar se está logado
  isLoggedIn() {
    return !!this.getUsuarioAtual();
  }

  // Verificar permissão
  temPermissao(permissao) {
    const usuario = this.getUsuarioAtual();
    if (!usuario) return false;
    if (usuario.cargo === 'admin') return true;
    return usuario.permissoes?.includes(permissao) || false;
  }

  // 🔥 NOVOS MÉTODOS PARA IDENTIFICAÇÃO POR CARGO
  isAdmin() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'admin';
  }

  isGerente() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'gerente';
  }

  isAtendente() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'atendente';
  }

  isProfissional() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'profissional';
  }

  isCliente() {
    const usuario = this.getUsuarioAtual();
    return usuario?.cargo === 'cliente';
  }

  isFuncionario() {
    const usuario = this.getUsuarioAtual();
    return ['admin', 'gerente', 'atendente', 'profissional'].includes(usuario?.cargo);
  }
}

export const usuariosService = new UsuariosService();
