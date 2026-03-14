// src/services/backupService.js
import { firebaseService } from './firebase';
import { toast } from 'react-hot-toast';

export const backupService = {
  // Listar histórico de backups
  listarBackups: async () => {
    try {
      const backups = await firebaseService.getAll('backups');
      // Verificar se backups é um array antes de ordenar
      if (Array.isArray(backups)) {
        return backups.sort((a, b) => new Date(b.dataBackup) - new Date(a.dataBackup));
      }
      return [];
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  },

  // Criar backup completo
  criarBackup: async () => {
    try {
      // Lista de todas as coleções (incluindo as de fidelidade)
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
        'logs',
        // 🔥 NOVAS COLEÇÕES DE FIDELIDADE
        'recompensas',
        'pontuacao',
        'resgates_fidelidade',
        'config_fidelidade'
      ];

      const backupData = {
        dataBackup: new Date().toISOString(),
        versao: '2.0',
        dados: {}
      };

      let totalRegistros = 0;

      // Buscar dados de cada coleção
      for (const collection of collections) {
        try {
          const dados = await firebaseService.getAll(collection).catch(() => []);
          backupData.dados[collection] = Array.isArray(dados) ? dados : [];
          console.log(`✅ Backup da coleção ${collection}: ${backupData.dados[collection].length} registros`);
          totalRegistros += backupData.dados[collection].length;
        } catch (error) {
          console.warn(`⚠️ Erro ao fazer backup da coleção ${collection}:`, error);
          backupData.dados[collection] = [];
        }
      }

      // Adicionar metadados
      backupData.totalRegistros = totalRegistros;
      backupData.criadoPor = JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema';

      // Salvar backup no Firebase
      const backupId = await firebaseService.add('backups', backupData);
      
      // Download do backup
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      // Limpar URL
      setTimeout(() => URL.revokeObjectURL(url), 100);

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
          
          // Validações do arquivo
          if (!backupData.dados || typeof backupData.dados !== 'object') {
            throw new Error('Arquivo de backup inválido: dados não encontrados');
          }

          if (!backupData.versao) {
            throw new Error('Arquivo de backup inválido: versão não identificada');
          }

          // Confirmar restauração
          const totalRegistros = Object.values(backupData.dados).reduce(
            (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0
          );

          const confirmar = window.confirm(
            `Este backup contém ${totalRegistros} registros.\n` +
            `Data: ${new Date(backupData.dataBackup).toLocaleString('pt-BR')}\n\n` +
            `A restauração ADICIONARÁ esses dados aos existentes.\n` +
            `Deseja continuar?`
          );

          if (!confirmar) {
            resolve(false);
            return;
          }

          toast.loading('Restaurando backup...', { id: 'restore' });

          let restaurados = 0;
          let erros = 0;

          // Restaurar cada coleção
          for (const [collection, dados] of Object.entries(backupData.dados)) {
            if (!Array.isArray(dados) || dados.length === 0) continue;

            try {
              for (const item of dados) {
                try {
                  // Verificar se o item tem ID, se não, criar um
                  const itemParaSalvar = { ...item };
                  if (!itemParaSalvar.id) {
                    itemParaSalvar.id = firebaseService.generateId(collection);
                  }
                  
                  await firebaseService.add(collection, itemParaSalvar);
                  restaurados++;
                } catch (itemError) {
                  console.warn(`⚠️ Erro ao restaurar item em ${collection}:`, itemError);
                  erros++;
                }
              }
              console.log(`✅ Restaurada coleção ${collection}: ${dados.length} registros`);
            } catch (error) {
              console.warn(`⚠️ Erro ao restaurar coleção ${collection}:`, error);
              erros += dados.length;
            }
          }

          if (erros === 0) {
            toast.success(`Backup restaurado com sucesso! ${restaurados} registros adicionados.`, { id: 'restore' });
          } else {
            toast.success(`Backup parcialmente restaurado: ${restaurados} registros adicionados, ${erros} erros.`, { id: 'restore' });
          }
          
          resolve(true);
          
        } catch (error) {
          console.error('❌ Erro ao restaurar backup:', error);
          toast.error(`Erro ao restaurar backup: ${error.message}`, { id: 'restore' });
          reject(error);
        }
      };
      
      reader.onerror = () => {
        toast.error('Erro ao ler arquivo de backup', { id: 'restore' });
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsText(arquivoBackup);
    });
  },

  // Buscar último backup
  buscarUltimoBackup: async () => {
    try {
      const backups = await backupService.listarBackups();
      if (backups && backups.length > 0) {
        return backups[0];
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar último backup:', error);
      return null;
    }
  },

  // Excluir backup antigo (opcional)
  excluirBackup: async (backupId) => {
    try {
      await firebaseService.delete('backups', backupId);
      return true;
    } catch (error) {
      console.error('Erro ao excluir backup:', error);
      return false;
    }
  },

  // Limpar backups antigos (manter apenas os últimos 10)
  limparBackupsAntigos: async () => {
    try {
      const backups = await backupService.listarBackups();
      if (backups.length > 10) {
        const paraExcluir = backups.slice(10);
        for (const backup of paraExcluir) {
          await backupService.excluirBackup(backup.id);
        }
        console.log(`✅ ${paraExcluir.length} backups antigos removidos`);
      }
    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
    }
  }
};
