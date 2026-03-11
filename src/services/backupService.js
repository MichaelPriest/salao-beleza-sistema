// src/services/backupService.js
import { firebaseService } from './firebase';
import { toast } from 'react-hot-toast';

export const backupService = {
  // Buscar histórico de backups
  listarBackups: async () => {
    try {
      const backups = await firebaseService.getAll('backups');
      return backups.sort((a, b) => new Date(b.dataBackup) - new Date(a.dataBackup));
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  },

  // Criar backup completo
  criarBackup: async () => {
    try {
      // Lista de todas as coleções
      const collections = [
        'clientes',
        'profissionais',
        'servicos',
        'agendamentos',
        'atendimentos',
        'comissoes',
        'pagamentos',
        'produtos',
        'entradas',
        'fornecedores',
        'compras',
        'usuarios',
        'configuracoes',
        'notificacoes',
        'auditoria',
        'logs'
      ];

      const backupData = {
        dataBackup: new Date().toISOString(),
        versao: '2.0',
        dados: {}
      };

      // Buscar dados de cada coleção
      for (const collection of collections) {
        try {
          const dados = await firebaseService.getAll(collection).catch(() => []);
          backupData.dados[collection] = dados;
          console.log(`✅ Backup da coleção ${collection}: ${dados.length} registros`);
        } catch (error) {
          console.warn(`⚠️ Erro ao fazer backup da coleção ${collection}:`, error);
          backupData.dados[collection] = [];
        }
      }

      // Salvar backup no Firebase
      const backupId = await firebaseService.add('backups', backupData);
      
      // Download do backup
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      return { ...backupData, id: backupId };
    } catch (error) {
      console.error('❌ Erro no backup:', error);
      throw error;
    }
  },

  // Restaurar backup
  restaurarBackup: async (arquivoBackup) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          if (!backupData.dados) {
            throw new Error('Arquivo de backup inválido');
          }

          toast.loading('Restaurando backup...', { id: 'restore' });

          // Restaurar cada coleção
          for (const [collection, dados] of Object.entries(backupData.dados)) {
            try {
              // Primeiro, limpar a coleção atual (opcional)
              // await firebaseService.deleteCollection(collection);
              
              // Depois, inserir os dados do backup
              for (const item of dados) {
                await firebaseService.add(collection, item);
              }
              console.log(`✅ Restaurada coleção ${collection}: ${dados.length} registros`);
            } catch (error) {
              console.warn(`⚠️ Erro ao restaurar coleção ${collection}:`, error);
            }
          }

          toast.success('Backup restaurado com sucesso!', { id: 'restore' });
          resolve(true);
          
        } catch (error) {
          console.error('❌ Erro ao restaurar backup:', error);
          toast.error('Erro ao restaurar backup', { id: 'restore' });
          reject(error);
        }
      };
      
      reader.readAsText(arquivoBackup);
    });
  },

  // Buscar último backup
  buscarUltimoBackup: async () => {
    try {
      const backups = await backupService.listarBackups();
      return backups[0] || null;
    } catch (error) {
      console.error('Erro ao buscar último backup:', error);
      return null;
    }
  }
};
