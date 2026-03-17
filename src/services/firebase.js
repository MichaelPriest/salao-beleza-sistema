// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Suas configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7z7IjeHAa1BZayqyb4-ExmYz8xOYd5dA",
  authDomain: "fluted-sentry-305001.firebaseapp.com",
  projectId: "fluted-sentry-305001",
  storageBucket: "fluted-sentry-305001.firebasestorage.app",
  messagingSenderId: "386333037191",
  appId: "1:386333037191:web:3b944b250bf676e1901e22"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Funções genéricas CRUD
export const firebaseService = {
  // Buscar todos os documentos de uma coleção
  getAll: async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName}:`, error);
      throw error;
    }
  },

  // Buscar um documento por ID
  getById: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName} por ID:`, error);
      throw error;
    }
  },

  // Adicionar um documento (ID automático)
  add: async (collectionName, data) => {
    try {
      const dataWithTimestamps = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, collectionName), dataWithTimestamps);
      return { id: docRef.id, ...dataWithTimestamps };
    } catch (error) {
      console.error(`Erro ao adicionar em ${collectionName}:`, error);
      throw error;
    }
  },

  // Adicionar/atualizar documento com ID específico
  set: async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      const dataWithTimestamps = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      if (!data.createdAt) {
        dataWithTimestamps.createdAt = Timestamp.now();
      }
      
      await setDoc(docRef, dataWithTimestamps, { merge: true });
      console.log(`✅ Documento ${collectionName}/${id} salvo com sucesso`);
      return { id, ...dataWithTimestamps };
    } catch (error) {
      console.error(`❌ Erro ao salvar em ${collectionName}:`, error);
      throw error;
    }
  },

  // Atualizar um documento
  update: async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      const dataWithTimestamp = {
        ...data,
        updatedAt: Timestamp.now()
      };
      await updateDoc(docRef, dataWithTimestamp);
      return { id, ...dataWithTimestamp };
    } catch (error) {
      console.error(`Erro ao atualizar ${collectionName}:`, error);
      throw error;
    }
  },

  // Excluir um documento
  delete: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error(`Erro ao excluir de ${collectionName}:`, error);
      throw error;
    }
  },

  // Buscar com filtros
  query: async (collectionName, conditions = [], orderByField = null) => {
    try {
      let q = collection(db, collectionName);
      
      if (conditions.length > 0) {
        const constraints = conditions
          .filter(({ value }) => value !== undefined && value !== null)
          .map(({ field, operator, value }) => where(field, operator, value));
        
        if (constraints.length > 0) {
          q = query(q, ...constraints);
        }
      }
      
      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Erro na query de ${collectionName}:`, error);
      throw error;
    }
  },

  // Gerar ID único
  generateId: (collectionName) => {
    return doc(collection(db, collectionName)).id;
  },

  // 🔥 NOVA FUNÇÃO: Registrar log técnico
  log: async (nivel, mensagem, dados = {}) => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      let usuario = null;
      try {
        usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      } catch (e) {
        // Ignora erro de parsing
      }

      const logData = {
        nivel, // 'info', 'warning', 'error', 'success', 'debug'
        mensagem,
        ...dados,
        usuarioId: usuario?.id || null,
        usuarioNome: usuario?.nome || 'Sistema',
        timestamp: new Date().toISOString(),
        data: Timestamp.now()
      };
      
      // Salvar no Firestore (opcional - pode desativar se quiser só console)
      await firebaseService.add('logs', logData).catch(err => {
        console.warn('Erro ao salvar log no Firestore:', err);
      });
      
      // Também mostrar no console
      const cor = {
        info: '#2196f3',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        debug: '#9c27b0'
      }[nivel] || '#666';
      
      console.log(`%c[${nivel.toUpperCase()}] ${mensagem}`, `color: ${cor}; font-weight: bold;`, dados);
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar log:', error);
      return false;
    }
  },

  // 🔥 Função helper para log de info
  info: (mensagem, dados = {}) => {
    return firebaseService.log('info', mensagem, dados);
  },

  // 🔥 Função helper para log de sucesso
  success: (mensagem, dados = {}) => {
    return firebaseService.log('success', mensagem, dados);
  },

  // 🔥 Função helper para log de warning
  warning: (mensagem, dados = {}) => {
    return firebaseService.log('warning', mensagem, dados);
  },

  // 🔥 Função helper para log de erro
  error: (mensagem, dados = {}) => {
    return firebaseService.log('error', mensagem, dados);
  },

  // 🔥 Função helper para log de debug
  debug: (mensagem, dados = {}) => {
    return firebaseService.log('debug', mensagem, dados);
  }
};

export default firebaseService;
