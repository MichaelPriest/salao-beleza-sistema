// src/services/configuracoesService.js
import { firebaseService } from './firebase';

const COLLECTION = 'configuracoes';

export const configuracoesService = {
  // Buscar configurações
  getConfiguracoes: async () => {
    try {
      // Como é um documento único, podemos pegar o primeiro
      const configs = await firebaseService.getAll(COLLECTION);
      return configs[0] || null;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return null;
    }
  },

  // Salvar configurações
  salvarConfiguracoes: async (dados) => {
    try {
      const configs = await firebaseService.getAll(COLLECTION);
      if (configs.length > 0) {
        // Atualizar existente
        return await firebaseService.update(COLLECTION, configs[0].id, dados);
      } else {
        // Criar novo
        return await firebaseService.add(COLLECTION, dados);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }
};

export default configuracoesService;
