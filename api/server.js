// api/server.js
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Verificar se o db.json existe
const dbPath = path.join(__dirname, '..', 'db.json');
console.log('📁 Caminho do db.json:', dbPath);
console.log('📁 Arquivo existe?', fs.existsSync(dbPath));

if (!fs.existsSync(dbPath)) {
  console.error('❌ ERRO: db.json não encontrado!');
  process.exit(1);
}

const router = jsonServer.router(dbPath);

// Configurar CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

server.use(middlewares);

// Adicionar prefixo /api para todas as rotas
server.use('/api', router);

// Rota de teste
server.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando!',
    dbPath: dbPath,
    dbExists: fs.existsSync(dbPath)
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server rodando em http://localhost:${PORT}`);
  console.log(`🔗 Teste: http://localhost:${PORT}/api/usuarios`);
  console.log(`🔗 Teste: http://localhost:${PORT}/api/test`);
});

module.exports = server;
