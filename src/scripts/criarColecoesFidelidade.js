// src/scripts/criarColecoesFidelidade.js
import { firebaseService } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';

/**
 * Este script deve ser executado UMA VEZ para criar as coleções necessárias
 * para o sistema de fidelidade e configurar os dados iniciais.
 * 
 * Para executar: node src/scripts/criarColecoesFidelidade.js
 */

const criarColecoesFidelidade = async () => {
  try {
    console.log('🚀 Iniciando criação das coleções de fidelidade...');

    // 1. Criar configurações iniciais
    console.log('📝 Criando configurações iniciais...');
    const configInicial = {
      pontosPorReal: 1,
      pontosAniversario: 50,
      pontosIndicacao: 100,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      await firebaseService.add('config_fidelidade', configInicial);
      console.log('✅ Configurações criadas com sucesso!');
    } catch (error) {
      console.log('ℹ️ Configurações já existem ou não foi possível criar:', error.message);
    }

    // 2. Criar uma pontuação de exemplo (opcional)
    console.log('📝 Criando pontuação de exemplo...');
    const pontuacaoExemplo = {
      clienteId: 'exemplo',
      clienteNome: 'Cliente Exemplo',
      quantidade: 100,
      tipo: 'credito',
      motivo: 'Pontuação inicial',
      data: new Date().toISOString(),
      usuarioId: 'sistema',
      usuarioNome: 'Sistema',
      createdAt: Timestamp.now(),
    };

    try {
      await firebaseService.add('pontuacao', pontuacaoExemplo);
      console.log('✅ Pontuação exemplo criada com sucesso!');
    } catch (error) {
      console.log('ℹ️ Não foi possível criar pontuação exemplo:', error.message);
    }

    // 3. Criar um resgate de exemplo (opcional)
    console.log('📝 Criando resgate de exemplo...');
    const resgateExemplo = {
      clienteId: 'exemplo',
      clienteNome: 'Cliente Exemplo',
      recompensaId: 'desc_10',
      recompensaNome: '10% de desconto',
      pontosGastos: 100,
      data: new Date().toISOString(),
      status: 'resgatado',
      utilizado: false,
      usuarioId: 'sistema',
      usuarioNome: 'Sistema',
      createdAt: Timestamp.now(),
    };

    try {
      await firebaseService.add('resgates_fidelidade', resgateExemplo);
      console.log('✅ Resgate exemplo criado com sucesso!');
    } catch (error) {
      console.log('ℹ️ Não foi possível criar resgate exemplo:', error.message);
    }

    console.log('🎉 Processo concluído!');
    console.log('');
    console.log('📌 PRÓXIMOS PASSOS:');
    console.log('1. Verifique no Firebase Console se as coleções foram criadas');
    console.log('2. Atualize as regras de segurança no Firebase Console');
    console.log('3. Teste o sistema de fidelidade');

  } catch (error) {
    console.error('❌ Erro ao criar coleções:', error);
  }
};

// Executar a função
criarColecoesFidelidade();
