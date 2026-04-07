// src/services/backupService.js
import { firebaseService } from './firebase';
import { toast } from 'react-hot-toast';

export const backupService = {
  // Listar histórico de backups
  listarBackups: async () => {
    try {
      const backups = await firebaseService.getAll('backups');
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
        'recompensas',
        'pontuacao',
        'resgates_fidelidade',
        'config_fidelidade',
        'categorias_produtos',
        'contas_pagar',
        'contas_receber',
        'movimentacoes_estoque',
        'notificacoes_cliente',
        'transacoes',
        'indicacoes',
        'caixa'
      ];

      const backupData = {
        dataBackup: new Date().toISOString(),
        versao: '2.0',
        dados: {}
      };

      let totalRegistros = 0;

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

      backupData.totalRegistros = totalRegistros;
      backupData.criadoPor = JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema';

      const backupId = await firebaseService.add('backups', backupData);
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 100);

      return { ...backupData, id: backupId };
    } catch (error) {
      console.error('❌ Erro no backup:', error);
      throw error;
    }
  },

  // 🔥 FUNÇÃO CORRIGIDA: Restaurar backup PRESERVANDO IDs (sem campos extras)
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
            `⚠️ IMPORTANTE: A restauração SUBSTITUIRÁ os dados existentes mantendo os IDs originais.\n` +
            `A coleção "usuários" preservará apenas o usuário administrador.\n\n` +
            `Deseja continuar?`
          );

          if (!confirmar) {
            resolve(false);
            return;
          }

          toast.loading('Restaurando backup e preservando IDs originais...', { id: 'restore' });

          // Usuário a ser preservado
          const USUARIO_PRESERVADO = 'michael.rodrigoraimundo@gmail.com';
          
          let restaurados = 0;
          let erros = 0;
          

          // Restaurar cada coleção
          for (const [collection, dados] of Object.entries(backupData.dados)) {
            if (!Array.isArray(dados) || dados.length === 0) continue;

            console.log(`🔄 Restaurando coleção ${collection}: ${dados.length} registros`);

            try {
              for (const item of dados) {
                try {
                  // Verificar se o item tem ID
                  if (!item.id) {
                    console.warn(`⚠️ Item sem ID em ${collection}, ignorando:`, item);
                    erros++;
                    continue;
                  }

                  let deveRestaurar = true;
                  
                  // 🔥 IMPORTANTE: Não adicionar campos extras, usar apenas os dados originais
                  const itemParaSalvar = { ...item };
                  
                  // Remover campos que podem causar problemas (opcional)
                  delete itemParaSalvar.restauradoEm;
                  delete itemParaSalvar.restauradoDe;
                  
                  // Regra especial para usuários
                  if (collection === 'usuarios') {
                    const email = itemParaSalvar.email?.toLowerCase();
                    if (email !== USUARIO_PRESERVADO.toLowerCase()) {
                      console.log(`⏭️ Ignorando usuário ${item.id} (${email}) - não é o usuário preservado`);
                      deveRestaurar = false;
                    } else {
                      console.log(`✅ Restaurando usuário preservado: ${item.id} (${email})`);
                    }
                  }

                  if (deveRestaurar) {
                    // Preserva o ID original usando upsert no Supabase
                    await firebaseService.set(collection, item.id, itemParaSalvar);
                    restaurados++;

                    console.log(`✅ Restaurado ${collection}/${item.id} com ID original preservado`);
                  }
                  
                } catch (itemError) {
                  console.warn(`⚠️ Erro ao restaurar item ${collection}/${item.id}:`, itemError);
                  erros++;
                }
              }
              
              console.log(`✅ Processada coleção ${collection}: ${dados.length} registros`);
              
            } catch (error) {
              console.warn(`⚠️ Erro ao processar coleção ${collection}:`, error);
              erros += dados.length;
            }
          }

          if (erros === 0) {
            toast.success(
              `Backup restaurado com sucesso!\n${restaurados} registros restaurados com IDs originais.`, 
              { id: 'restore', duration: 5000 }
            );
          } else {
            toast.error(
              `Backup parcialmente restaurado: ${restaurados} registros OK, ${erros} erros. Verifique o console para detalhes.`, 
              { id: 'restore', duration: 5000 }
            );
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

  // Excluir backup antigo
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
