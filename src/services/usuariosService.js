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
          // Buscar dados no Firestore
          const userRef = doc(db, 'usuarios', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            this.usuario = { id: user.uid, ...userSnap.data() };
            localStorage.setItem('usuario', JSON.stringify(this.usuario));
          } else {
            // Tentar buscar por email
            const usuarios = await firebaseService.query('usuarios', [
              { field: 'email', operator: '==', value: user.email }
            ]);
            
            if (usuarios && usuarios.length > 0) {
              const usuarioData = usuarios[0];
              // Corrigir: criar documento com o UID correto
              await setDoc(doc(db, 'usuarios', user.uid), {
                ...usuarioData,
                uid: user.uid,
                migrado: true,
                migradoEm: new Date().toISOString()
              });
              
              this.usuario = { id: user.uid, ...usuarioData };
              localStorage.setItem('usuario', JSON.stringify(this.usuario));
            } else {
              console.log('❌ Usuário não encontrado no Firestore');
              this.logout();
            }
          }
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
        }
      } else {
        // Usuário não logado
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
      
      // Buscar dados do usuário no Firestore
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuário não encontrado no sistema');
      }

      const usuarioData = userSnap.data();
      
      // Verificar se está ativo
      if (usuarioData.status !== 'ativo') {
        await this.logout();
        throw new Error('Usuário inativo. Contate o administrador.');
      }

      this.usuario = { id: user.uid, ...usuarioData };
      localStorage.setItem('usuario', JSON.stringify(this.usuario));
      
      return this.usuario;
    } catch (error) {
      console.error('Erro no login:', error);
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
}

export const usuariosService = new UsuariosService();
