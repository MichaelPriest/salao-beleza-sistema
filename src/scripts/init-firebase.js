// src/scripts/init-firebase.js
import { firebaseService } from '../services/firebase';

/**
 * Script para inicializar o Firebase com o primeiro usuário admin
 * Execute este script uma vez para criar o primeiro administrador
 */
export const initFirebase = async () => {
  try {
    console.log('🔧 Inicializando Firebase...');
    
    // Verificar se já existem usuários
    const usuarios = await firebaseService.getAll('usuarios');
    
    if (usuarios.length === 0) {
      console.log('📝 Nenhum usuário encontrado. Criando primeiro admin...');
      
      // Criar primeiro usuário admin
      const primeiroAdmin = {
        nome: 'Administrador',
        email: 'admin@beautypro.com',
        senha: 'admin123', // Será alterada no primeiro login
        cargo: 'admin',
        status: 'ativo',
        permissoes: [
          'admin',
          'gerenciar_usuarios',
          'gerenciar_clientes',
          'gerenciar_agendamentos',
          'gerenciar_servicos',
          'gerenciar_profissionais',
          'gerenciar_estoque',
          'visualizar_relatorios',
          'configurar_sistema',
          'visualizar_comissoes'
        ],
        dataCadastro: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const novoId = await firebaseService.add('usuarios', primeiroAdmin);
      console.log('✅ Primeiro admin criado com ID:', novoId);
      console.log('📧 Email: admin@beautypro.com');
      console.log('🔑 Senha: admin123');
    } else {
      console.log('✅ Usuários já existem. Pulando inicialização.');
    }
    
    // Criar configurações padrão se não existirem
    const configuracoes = await firebaseService.getAll('configuracoes');
    
    if (configuracoes.length === 0) {
      console.log('📝 Criando configurações padrão...');
      
      const configPadrao = {
        salao: {
          nome: 'Beauty Pro',
          nomeFantasia: 'Beauty Pro Salon',
          cnpj: '',
          endereco: {
            logradouro: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
          },
          contato: {
            telefone: '',
            email: '',
            instagram: '',
            facebook: ''
          }
        },
        tema: {
          corPrimaria: '#9c27b0',
          corSecundaria: '#ff4081',
          modoEscuro: false
        },
        updatedAt: new Date().toISOString()
      };
      
      await firebaseService.add('configuracoes', configPadrao);
      console.log('✅ Configurações padrão criadas');
    }
    
    console.log('🎉 Inicialização concluída!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
  }
};
