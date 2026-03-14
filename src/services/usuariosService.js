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
              
              // 🔥 NÃO FAZER LOGOUT! Criar usuário básico
              const novoUsuario = {
                id: user.uid,
                email: user.email,
                nome: user.email.split('@')[0],
                cargo: 'cliente', // Cargo padrão
                status: 'ativo',
                permissoes: [],
                createdAt: new Date().toISOString()
              };
              
              console.log('✅ usuariosService - Criando usuário básico:', novoUsuario);
              this.usuario = novoUsuario;
              localStorage.setItem('usuario', JSON.stringify(novoUsuario));
              
              // Tentar salvar no Firestore (não crítico)
              setDoc(doc(db, 'usuarios', user.uid), novoUsuario).catch(err => {
                console.warn('⚠️ Não foi possível salvar usuário no Firestore:', err);
              });
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

  // 🔥 MÉTODO PARA FORÇAR A MANUTENÇÃO DO USUÁRIO
  manterUsuario() {
    const usuario = this.getUsuarioAtual();
    if (usuario) {
      console.log('✅ Mantendo usuário logado:', usuario.email);
      return true;
    }
    return false;
  }
}

export const usuariosService = new UsuariosService();
