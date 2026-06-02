// src/scripts/criar-admin-supabase.js
// Cria o primeiro usuário administrativo no Supabase Auth e na tabela `usuarios`.
// Uso:
// SUPABASE_SERVICE_ROLE_KEY=... ADMIN_EMAIL=admin@site.com ADMIN_PASSWORD='SenhaForte123!' npm run criar-admin

const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || 'https://kvjrerxqwtrxttiiqkgf.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DOCUMENTS_TABLE = process.env.REACT_APP_SUPABASE_DOCUMENTS_TABLE || process.env.SUPABASE_DOCUMENTS_TABLE || 'registros';
const USE_COLLECTION_TABLES = process.env.REACT_APP_SUPABASE_USE_COLLECTION_TABLES !== 'false' && process.env.SUPABASE_USE_COLLECTION_TABLES !== 'false';

const ADMIN_PERMISSOES = [
  'admin',
  'gerenciar_usuarios',
  'gerenciar_clientes',
  'gerenciar_agendamentos',
  'gerenciar_servicos',
  'gerenciar_profissionais',
  'gerenciar_estoque',
  'visualizar_relatorios',
  'configurar_sistema',
  'visualizar_comissoes',
  'gerenciar_backup',
  'gerenciar_fidelidade',
  'visualizar_todos_pontos'
];

const requiredEnv = ['SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ Variáveis obrigatórias ausentes: ${missingEnv.join(', ')}`);
  console.error('Exemplo: SUPABASE_SERVICE_ROLE_KEY=... ADMIN_EMAIL=admin@site.com ADMIN_PASSWORD="SenhaForte123!" npm run criar-admin');
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
    const message = data?.message || data?.msg || data?.error_description || data?.error || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
};

const findAuthUserByEmail = async (email) => {
  const result = await supabaseFetch(`/auth/v1/admin/users?page=1&per_page=1000`, { method: 'GET' });
  const users = Array.isArray(result?.users) ? result.users : [];
  return users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
};

const createOrUpdateAuthUser = async ({ email, password, nome }) => {
  const existingUser = await findAuthUserByEmail(email);

  if (existingUser) {
    await supabaseFetch(`/auth/v1/admin/users/${existingUser.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: {
          ...(existingUser.user_metadata || {}),
          nome,
          cargo: 'admin'
        }
      })
    });

    return { ...existingUser, updated: true };
  }

  const createdUser = await supabaseFetch('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        cargo: 'admin'
      }
    })
  });

  return { ...createdUser, created: true };
};

const upsertUsuarioAdmin = async ({ userId, email, nome }) => {
  const agora = new Date().toISOString();
  const usuario = {
    id: userId,
    uid: userId,
    nome,
    email,
    cargo: 'admin',
    status: 'ativo',
    permissoes: ADMIN_PERMISSOES,
    isCliente: false,
    criadoViaScript: true,
    dataCadastro: agora,
    createdAt: agora,
    updatedAt: agora
  };

  const tableName = USE_COLLECTION_TABLES ? 'usuarios' : DOCUMENTS_TABLE;
  const conflict = USE_COLLECTION_TABLES ? 'document_id' : 'collection,document_id';
  const payload = USE_COLLECTION_TABLES
    ? { document_id: userId, data: usuario }
    : { collection: 'usuarios', document_id: userId, data: usuario };

  const rows = await supabaseFetch(`/rest/v1/${tableName}?on_conflict=${conflict}`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(payload)
  });

  return rows?.[0]?.data || usuario;
};

const criarAdmin = async () => {
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const nome = process.env.ADMIN_NAME || 'Administrador';

  if (password.length < 6) {
    throw new Error('ADMIN_PASSWORD precisa ter pelo menos 6 caracteres.');
  }

  console.log('🚀 Criando/atualizando administrador no Supabase...');
  console.log(`📧 Email: ${email}`);

  const authUser = await createOrUpdateAuthUser({ email, password, nome });
  const usuario = await upsertUsuarioAdmin({ userId: authUser.id, email, nome });

  console.log(authUser.created ? '✅ Usuário Auth criado' : '✅ Usuário Auth atualizado');
  console.log(`✅ Documento usuarios/${usuario.id} salvo`);
  console.log('');
  console.log('Acesse a área admin com:');
  console.log(`Email: ${email}`);
  console.log('Senha: valor informado em ADMIN_PASSWORD');
};

criarAdmin().catch((error) => {
  console.error('❌ Erro ao criar administrador:', error.message);
  if (error.details) console.error(error.details);
  process.exit(1);
});
