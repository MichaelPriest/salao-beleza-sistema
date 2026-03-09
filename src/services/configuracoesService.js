import api from './api';

export const configuracoesService = {
  // Buscar configurações
  buscar: async () => {
    try {
      console.log('🔍 Buscando configurações...');
      
      // Tentar buscar pelo ID 1 (configurações principais)
      const response = await api.get('/configuracoes/1');
      console.log('✅ Configurações encontradas:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      
      // Se não encontrar (404), tentar buscar todas e pegar a primeira
      if (error.response?.status === 404) {
        try {
          console.log('🔄 Tentando buscar todas as configurações...');
          const allResponse = await api.get('/configuracoes');
          
          if (allResponse.data && allResponse.data.length > 0) {
            console.log('✅ Configurações encontradas na lista:', allResponse.data[0]);
            return allResponse.data[0];
          }
        } catch (listError) {
          console.error('❌ Erro ao listar configurações:', listError);
        }
      }
      
      // Se realmente não existir, retornar configurações padrão
      console.log('⚠️ Nenhuma configuração encontrada, retornando padrão');
      return {
        id: 1,
        salao: {
          nome: '',
          nomeFantasia: '',
          cnpj: '',
          ie: '',
          endereco: {
            logradouro: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
          },
          contato: {
            telefone: '',
            celular: '',
            email: '',
            site: '',
            instagram: '',
            facebook: '',
            whatsapp: ''
          }
        },
        horarioFuncionamento: {
          segunda: { aberto: true, abertura: '09:00', fechamento: '19:00' },
          terca: { aberto: true, abertura: '09:00', fechamento: '19:00' },
          quarta: { aberto: true, abertura: '09:00', fechamento: '19:00' },
          quinta: { aberto: true, abertura: '09:00', fechamento: '19:00' },
          sexta: { aberto: true, abertura: '09:00', fechamento: '19:00' },
          sabado: { aberto: true, abertura: '09:00', fechamento: '17:00' },
          domingo: { aberto: false, abertura: '00:00', fechamento: '00:00' }
        },
        notificacoes: {
          email: true,
          whatsapp: true,
          sms: false,
          lembreteAgendamento: 24,
          promocoes: true
        },
        tema: {
          corPrimaria: '#9c27b0',
          corSecundaria: '#ff4081',
          modoEscuro: false
        }
      };
    }
  },

  // Atualizar configurações
  atualizar: async (dados) => {
    try {
      console.log('🔄 Atualizando configurações:', dados);
      
      // Tentar atualizar pelo ID
      const response = await api.put(`/configuracoes/${dados.id}`, {
        ...dados,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Configurações atualizadas:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error);
      
      // Se falhar, tentar criar novas
      if (error.response?.status === 404) {
        try {
          console.log('🔄 Tentando criar novas configurações...');
          const createResponse = await api.post('/configuracoes', {
            ...dados,
            id: 1,
            updatedAt: new Date().toISOString()
          });
          
          console.log('✅ Configurações criadas:', createResponse.data);
          return createResponse.data;
          
        } catch (createError) {
          console.error('❌ Erro ao criar:', createError);
          throw createError;
        }
      }
      
      throw error;
    }
  },

  // Backup
  backup: async () => {
    try {
      console.log('💾 Gerando backup...');
      
      // Buscar todas as configurações
      const configResponse = await api.get('/configuracoes');
      const configuracoes = configResponse.data;
      
      // Buscar outros dados importantes
      const [usuarios, clientes, profissionais, servicos, agendamentos] = await Promise.all([
        api.get('/usuarios').catch(() => ({ data: [] })),
        api.get('/clientes').catch(() => ({ data: [] })),
        api.get('/profissionais').catch(() => ({ data: [] })),
        api.get('/servicos').catch(() => ({ data: [] })),
        api.get('/agendamentos').catch(() => ({ data: [] }))
      ]);
      
      const backupData = {
        dataBackup: new Date().toISOString(),
        versao: '2.0.0',
        configuracoes: configuracoes,
        usuarios: usuarios.data,
        clientes: clientes.data,
        profissionais: profissionais.data,
        servicos: servicos.data,
        agendamentos: agendamentos.data
      };
      
      console.log('✅ Backup gerado:', backupData);
      return backupData;
      
    } catch (error) {
      console.error('❌ Erro no backup:', error);
      throw error;
    }
  },

  // Restaurar backup
  restaurar: async (backupData) => {
    try {
      console.log('🔄 Restaurando backup:', backupData);
      
      // Restaurar configurações
      if (backupData.configuracoes) {
        const configuracoes = Array.isArray(backupData.configuracoes) 
          ? backupData.configuracoes[0] 
          : backupData.configuracoes;
          
        await api.put(`/configuracoes/${configuracoes.id}`, configuracoes);
      }
      
      // Restaurar outros dados
      const restauracaoPromises = [];
      
      if (backupData.usuarios) {
        backupData.usuarios.forEach(usuario => {
          restauracaoPromises.push(
            api.put(`/usuarios/${usuario.id}`, usuario).catch(() => 
              api.post('/usuarios', usuario)
            )
          );
        });
      }
      
      if (backupData.clientes) {
        backupData.clientes.forEach(cliente => {
          restauracaoPromises.push(
            api.put(`/clientes/${cliente.id}`, cliente).catch(() => 
              api.post('/clientes', cliente)
            )
          );
        });
      }
      
      if (backupData.profissionais) {
        backupData.profissionais.forEach(profissional => {
          restauracaoPromises.push(
            api.put(`/profissionais/${profissional.id}`, profissional).catch(() => 
              api.post('/profissionais', profissional)
            )
          );
        });
      }
      
      if (backupData.servicos) {
        backupData.servicos.forEach(servico => {
          restauracaoPromises.push(
            api.put(`/servicos/${servico.id}`, servico).catch(() => 
              api.post('/servicos', servico)
            )
          );
        });
      }
      
      if (backupData.agendamentos) {
        backupData.agendamentos.forEach(agendamento => {
          restauracaoPromises.push(
            api.put(`/agendamentos/${agendamento.id}`, agendamento).catch(() => 
              api.post('/agendamentos', agendamento)
            )
          );
        });
      }
      
      await Promise.all(restauracaoPromises);
      console.log('✅ Backup restaurado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao restaurar:', error);
      throw error;
    }
  }
};