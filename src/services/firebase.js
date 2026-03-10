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
  Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Suas configurações do Firebase (substitua com os dados do seu projeto)
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

  // Adicionar um documento
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
        // Validar que nenhum valor é undefined
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

export default firebaseService;
