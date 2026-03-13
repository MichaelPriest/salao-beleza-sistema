// criar-cliente-teste.js
const admin = require('firebase-admin');

// 🔥 INICIALIZAR O FIREBASE ADMIN SDK
// Você precisa baixar a chave privada do Firebase Console:
// Configurações do Projeto > Contas de serviço > Gerar nova chave privada
const serviceAccount = require('./caminho-para-sua-chave.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'salao-beleza-sistema'
});

const db = admin.firestore();
const auth = admin.auth();

async function criarClienteTeste() {
  console.log('🚀 Iniciando criação do cliente teste...');

  try {
    // Dados do cliente
    const clienteData = {
      nome: 'Cliente Teste Fidelidade',
      email: 'cliente.teste@email.com',
      telefone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      dataNascimento: '1990-01-01',
      status: 'ativo',
      observacoes: 'Cliente criado para testar o sistema de fidelidade',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Dados de pontuação
    const pontuacoesData = [
      {
        quantidade: 100,
        tipo: 'credito',
        motivo: 'Cadastro inicial',
        data: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        quantidade: 50,
        tipo: 'credito',
        motivo: 'Aniversário',
        data: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        quantidade: 30,
        tipo: 'credito',
        motivo: 'Indicação',
        data: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        quantidade: 200,
        tipo: 'credito',
        motivo: 'Compra de serviço',
        data: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Dados de resgate
    const resgateData = {
      recompensaId: 'desc_10',
      recompensaNome: '10% de desconto',
      pontosGastos: 100,
      data: admin.firestore.FieldValue.serverTimestamp(),
      status: 'resgatado',
      utilizado: false,
      codigo: 'FID2025' + Math.floor(Math.random() * 10000),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 1. Criar o cliente no Firestore
    console.log('\n📌 Criando cliente...');
    const clienteRef = await db.collection('clientes').add(clienteData);
    const clienteId = clienteRef.id;
    console.log('✅ Cliente criado com ID:', clienteId);

    // 2. Criar o usuário no Firebase Auth
    console.log('\n📌 Criando usuário no Authentication...');
    const userRecord = await auth.createUser({
      uid: clienteId, // Usar o mesmo ID do Firestore
      email: clienteData.email,
      emailVerified: false,
      password: '123456', // 🔥 SENHA PROVISÓRIA - mude depois
      displayName: clienteData.nome,
      disabled: false
    });
    console.log('✅ Usuário criado no Auth com UID:', userRecord.uid);

    // 3. Criar o documento do usuário no Firestore
    console.log('\n📌 Criando documento do usuário...');
    const usuarioData = {
      uid: userRecord.uid,
      nome: clienteData.nome,
      email: clienteData.email,
      cargo: 'cliente',
      status: 'ativo',
      clienteId: clienteId,
      permissoes: ['visualizar_fidelidade', 'visualizar_meus_pontos'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('usuarios').doc(userRecord.uid).set(usuarioData);
    console.log('✅ Documento do usuário criado');

    // 4. Criar as pontuações
    console.log('\n📌 Criando pontuações...');
    for (const pontuacao of pontuacoesData) {
      pontuacao.clienteId = clienteId;
      pontuacao.clienteNome = clienteData.nome;
      const pontuacaoRef = await db.collection('pontuacao').add(pontuacao);
      console.log(`   ✅ Pontuação criada: ${pontuacao.motivo} - ${pontuacao.quantidade} pontos (ID: ${pontuacaoRef.id})`);
    }

    // 5. Criar o resgate
    console.log('\n📌 Criando resgate de teste...');
    resgateData.clienteId = clienteId;
    resgateData.clienteNome = clienteData.nome;
    const resgateRef = await db.collection('resgates_fidelidade').add(resgateData);
    console.log('✅ Resgate criado com ID:', resgateRef.id);

    // 6. Calcular saldo total
    const saldoTotal = pontuacoesData.reduce((acc, p) => acc + p.quantidade, 0) - resgateData.pontosGastos;
    
    // Determinar nível
    let nivel = 'bronze';
    if (saldoTotal >= 5000) nivel = 'platina';
    else if (saldoTotal >= 2000) nivel = 'ouro';
    else if (saldoTotal >= 500) nivel = 'prata';

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CLIENTE CRIADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('📋 DADOS DO CLIENTE:');
    console.log(`   Nome: ${clienteData.nome}`);
    console.log(`   Email: ${clienteData.email}`);
    console.log(`   Cliente ID: ${clienteId}`);
    console.log(`   UID Auth: ${userRecord.uid}`);
    console.log('\n💰 PONTUAÇÃO:');
    console.log(`   Saldo total: ${saldoTotal} pontos`);
    console.log(`   Nível: ${nivel.toUpperCase()}`);
    console.log('\n📊 DETALHAMENTO:');
    pontuacoesData.forEach(p => {
      console.log(`   - ${p.motivo}: ${p.quantidade} pontos`);
    });
    console.log(`   - Resgate (10% desconto): -${resgateData.pontosGastos} pontos`);
    console.log('\n🔑 DADOS DE ACESSO:');
    console.log(`   Email: ${clienteData.email}`);
    console.log(`   Senha: 123456 (altere após o primeiro login)`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit();
  }
}

criarClienteTeste();
