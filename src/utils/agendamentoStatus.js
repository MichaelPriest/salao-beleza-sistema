export const STATUS_AGENDAMENTO = {
  pendente: { label: 'Pendente', curto: 'Pend.', color: 'warning', hex: '#ff9800', bg: '#fff3e0' },
  confirmado: { label: 'Confirmado', curto: 'Conf.', color: 'success', hex: '#4caf50', bg: '#e8f5e9' },
  cancelado: { label: 'Cancelado', curto: 'Canc.', color: 'error', hex: '#f44336', bg: '#ffebee' },
  finalizado: { label: 'Finalizado', curto: 'Final.', color: 'info', hex: '#2196f3', bg: '#e3f2fd' },
  concluido: { label: 'Concluído', curto: 'Conc.', color: 'info', hex: '#2196f3', bg: '#e3f2fd' },
  realizado: { label: 'Realizado', curto: 'Real.', color: 'info', hex: '#2196f3', bg: '#e3f2fd' },
  em_andamento: { label: 'Em andamento', curto: 'Andam.', color: 'secondary', hex: '#9c27b0', bg: '#f3e5f5' },
};

export const getAgendamentoStatusInfo = (status) => {
  const key = String(status || 'pendente').toLowerCase();
  return STATUS_AGENDAMENTO[key] || { label: status || 'Pendente', curto: status || 'Pend.', color: 'default', hex: '#9e9e9e', bg: '#f5f5f5' };
};
