// api/server.js
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Caminho absoluto para o db.json
const dbPath = path.join(__dirname, '..', 'db.json');
console.log('📁 Caminho do db.json:', dbPath);
console.log('📁 Arquivo existe?', fs.existsSync(dbPath));

// Verificar se o db.json existe
if (!fs.existsSync(dbPath)) {
  console.error('❌ ERRO: db.json não encontrado!');
  process.exit(1);
}

// Ler e parsear o db.json para garantir que é válido
try {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  JSON.parse(dbContent); // Apenas para validar
  console.log('✅ db.json válido');
} catch (e) {
  console.error('❌ ERRO: db.json inválido:', e.message);
  process.exit(1);
}

const router = jsonServer.router(dbPath);

// Configurar CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Responder preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware para log
server.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

server.use(middlewares);
server.use('/api', router);

// Rota de teste da API
server.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando!',
    timestamp: new Date().toISOString(),
    dbPath: dbPath,
    dbExists: fs.existsSync(dbPath)
  });
});

// Rota para listar todas as rotas disponíveis
server.get('/api/routes', (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const routes = Object.keys(db);
  res.json({
    rotas: routes,
    endpoints: routes.map(r => `/api/${r}`)
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server rodando em http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Rotas: http://localhost:${PORT}/api/routes`);
  console.log(`🔗 Usuários: http://localhost:${PORT}/api/usuarios`);
});

module.exports = server;
