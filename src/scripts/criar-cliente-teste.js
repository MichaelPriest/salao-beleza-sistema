// criar-cliente-teste.js
// Script utilitário migrado para Supabase.

const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || 'https://kvjrerxqwtrxttiiqkgf.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const DOCUMENTS_TABLE = process.env.REACT_APP_SUPABASE_DOCUMENTS_TABLE || process.env.SUPABASE_DOCUMENTS_TABLE || 'registros';

if (!SUPABASE_KEY) {
  console.error('❌ Configure SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY antes de executar este script.');
  process.exit(1);
}

const supabaseFetch = async (path, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error_description || data?.error || response.statusText);
  }

  return data;
};

const addDocument = async (collection, document) => {
  const documentId = document.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const data = {
    ...document,
    id: documentId,
    createdAt: document.createdAt || now,
    updatedAt: now
  };

  const rows = await supabaseFetch(`/rest/v1/${DOCUMENTS_TABLE}`, {
    method: 'POST',
    body: JSON.stringify({ collection, document_id: documentId, data })
  });

  return { id: documentId, ...(rows?.[0]?.data || data) };
};

const signUp = async ({ email, password, metadata }) => {
  const result = await supabaseFetch('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, data: metadata }),
    headers: { Authorization: `Bearer ${SUPABASE_KEY}` }
  });

  return result.user;
};

async function criarClienteTeste() {
  console.log('🚀 Iniciando criação do cliente teste no Supabase...');

  try {
    const now = new Date().toISOString();
    const clienteData = {
      nome: 'Cliente Teste Fidelidade',
      email: 'cliente.teste@email.com',
      telefone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      dataNascimento: '1990-01-01',
      status: 'ativo',
      observacoes: 'Cliente criado para testar o sistema de fidelidade',
      createdAt: now,
      updatedAt: now
    };

    const pontuacoesData = [
      { quantidade: 100, tipo: 'credito', motivo: 'Cadastro inicial', data: now, createdAt: now },
      { quantidade: 50, tipo: 'credito', motivo: 'Aniversário', data: now, createdAt: now },
      { quantidade: 30, tipo: 'credito', motivo: 'Indicação', data: now, createdAt: now },
      { quantidade: 200, tipo: 'credito', motivo: 'Compra de serviço', data: now, createdAt: now }
    ];

    const resgateData = {
      recompensaId: 'desc_10',
      recompensaNome: '10% de desconto',
      pontosGastos: 100,
      data: now,
      status: 'resgatado',
      utilizado: false,
      codigo: 'FID2025' + Math.floor(Math.random() * 10000),
      createdAt: now
    };

    console.log('\n📌 Criando usuário no Supabase Auth...');
    const authUser = await signUp({
      email: clienteData.email,
      password: '123456',
      metadata: { nome: clienteData.nome, perfil: 'cliente' }
    });
    console.log('✅ Usuário criado no Auth com ID:', authUser.id);

    console.log('\n📌 Criando cliente...');
    const cliente = await addDocument('clientes', { ...clienteData, id: authUser.id, uid: authUser.id });
    const clienteId = cliente.id;
    console.log('✅ Cliente criado com ID:', clienteId);

    console.log('\n📌 Criando documento do usuário...');
    await addDocument('usuarios', {
      id: authUser.id,
      uid: authUser.id,
      nome: clienteData.nome,
      email: clienteData.email,
      cargo: 'cliente',
      status: 'ativo',
      clienteId,
      permissoes: ['visualizar_fidelidade', 'visualizar_meus_pontos'],
      createdAt: now,
      updatedAt: now
    });
    console.log('✅ Documento do usuário criado');

    console.log('\n📌 Criando pontuações...');
    for (const pontuacao of pontuacoesData) {
      const pontuacaoDoc = await addDocument('pontuacao', {
        ...pontuacao,
        clienteId,
        clienteNome: clienteData.nome
      });
      console.log(`   ✅ Pontuação criada: ${pontuacao.motivo} - ${pontuacao.quantidade} pontos (ID: ${pontuacaoDoc.id})`);
    }

    console.log('\n📌 Criando resgate de teste...');
    const resgate = await addDocument('resgates_fidelidade', {
      ...resgateData,
      clienteId,
      clienteNome: clienteData.nome
    });
    console.log('✅ Resgate criado com ID:', resgate.id);

    const saldoTotal = pontuacoesData.reduce((acc, p) => acc + p.quantidade, 0) - resgateData.pontosGastos;
    let nivel = 'bronze';
    if (saldoTotal >= 5000) nivel = 'platina';
    else if (saldoTotal >= 2000) nivel = 'ouro';
    else if (saldoTotal >= 500) nivel = 'prata';

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CLIENTE CRIADO COM SUCESSO NO SUPABASE!');
    console.log('='.repeat(60));
    console.log(`   Nome: ${clienteData.nome}`);
    console.log(`   Email: ${clienteData.email}`);
    console.log(`   Cliente ID: ${clienteId}`);
    console.log(`   UID Auth: ${authUser.id}`);
    console.log(`   Saldo total: ${saldoTotal} pontos`);
    console.log(`   Nível: ${nivel.toUpperCase()}`);
    console.log('   Senha provisória: 123456');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exitCode = 1;
  }
}

criarClienteTeste();
