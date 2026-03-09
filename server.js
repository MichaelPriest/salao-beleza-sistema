const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

// Middleware para adicionar timestamps
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = new Date().toISOString()
    req.body.updatedAt = new Date().toISOString()
  }
  if (req.method === 'PUT' || req.method === 'PATCH') {
    req.body.updatedAt = new Date().toISOString()
  }
  next()
})

// Rotas personalizadas
server.post('/agendamentos/:id/finalizar', (req, res) => {
  const db = router.db
  const agendamento = db.get('agendamentos').find({ id: parseInt(req.params.id) }).value()
  
  if (!agendamento) {
    return res.status(404).json({ error: 'Agendamento não encontrado' })
  }

  // Criar atendimento
  const atendimento = {
    id: Date.now(),
    agendamentoId: agendamento.id,
    clienteId: agendamento.clienteId,
    profissionalId: agendamento.profissionalId,
    data: new Date().toISOString().split('T')[0],
    horaInicio: agendamento.horario,
    horaFim: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    status: 'finalizado',
    observacoes: req.body.observacoes || ''
  }

  db.get('atendimentos').push(atendimento).write()

  // Atualizar status do agendamento
  db.get('agendamentos')
    .find({ id: agendamento.id })
    .assign({ status: 'finalizado' })
    .write()

  res.json(atendimento)
})

server.post('/atendimentos/:id/pagamento', (req, res) => {
  const db = router.db
  const atendimento = db.get('atendimentos').find({ id: parseInt(req.params.id) }).value()
  
  if (!atendimento) {
    return res.status(404).json({ error: 'Atendimento não encontrado' })
  }

  const servico = db.get('servicos').find({ id: atendimento.servicoId }).value()
  
  // Criar pagamento
  const pagamento = {
    id: Date.now(),
    atendimentoId: atendimento.id,
    clienteId: atendimento.clienteId,
    valor: servico.preco,
    formaPagamento: req.body.formaPagamento,
    status: 'pago',
    data: new Date().toISOString(),
    observacoes: req.body.observacoes || ''
  }

  db.get('pagamentos').push(pagamento).write()

  // Atualizar caixa
  const caixa = db.get('caixa').value()[0]
  caixa.saldoAtual += servico.preco
  caixa.movimentacoes.push({
    tipo: 'entrada',
    valor: servico.preco,
    descricao: `Pagamento do atendimento ${atendimento.id}`,
    data: new Date().toISOString()
  })
  db.get('caixa').write()

  res.json(pagamento)
})

server.use(router)

const port = 3001
server.listen(port, () => {
  console.log(`JSON Server está rodando na porta ${port}`)
})