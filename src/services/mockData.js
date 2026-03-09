// src/services/mockData.js
export const MOCK_USUARIO = {
  id: 1,
  nome: "Michael Rodrigo Raimundo",
  email: "ana@salao.com",
  cargo: "admin",
  avatar: null,
  permissoes: ["admin", "gerenciar_usuarios", "gerenciar_clientes", "gerenciar_agendamentos"],
  telefone: "(11) 99999-0001"
};

export const MOCK_NOTIFICACOES = [
  {
    id: 1,
    usuarioId: 1,
    tipo: "agendamento",
    titulo: "Novo agendamento",
    mensagem: "Maria Silva agendou para hoje às 14h",
    lida: false,
    data: new Date().toISOString(),
    link: "/agendamentos/1"
  },
  {
    id: 2,
    usuarioId: 1,
    tipo: "cliente",
    titulo: "Novo cliente",
    mensagem: "João Santos se cadastrou no sistema",
    lida: false,
    data: new Date().toISOString(),
    link: "/clientes/2"
  }
];
