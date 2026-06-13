// src/services/agendaDisponibilidadeService.js
// Regras compartilhadas entre agenda administrativa e portal do cliente.

export const TIME_SLOTS_PADRAO = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export const horarioParaMinutos = (horario) => {
  if (!horario || typeof horario !== 'string') return null;
  const [hora, minuto] = horario.split(':').map(Number);
  if (!Number.isFinite(hora) || !Number.isFinite(minuto)) return null;
  return hora * 60 + minuto;
};

export const adicionarMinutosHorario = (horario, minutos = 60) => {
  const inicio = horarioParaMinutos(horario);
  if (inicio === null) return '';
  const total = inicio + Number(minutos || 60);
  const hora = Math.floor(total / 60) % 24;
  const minuto = total % 60;
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
};

const obterInicioAgendamento = (agendamento) => agendamento?.horaInicio || agendamento?.horario;
const obterFimAgendamento = (agendamento) => agendamento?.horaFim || adicionarMinutosHorario(obterInicioAgendamento(agendamento), agendamento?.duracao || 60);

const intervalosSobrepoem = (inicioA, fimA, inicioB, fimB) => {
  const aInicio = horarioParaMinutos(inicioA);
  const aFim = horarioParaMinutos(fimA);
  const bInicio = horarioParaMinutos(inicioB);
  const bFim = horarioParaMinutos(fimB);
  if ([aInicio, aFim, bInicio, bFim].some((valor) => valor === null)) return false;
  return aInicio < bFim && aFim > bInicio;
};

const normalizarDiaSemana = (valor) => {
  if (typeof valor === 'number') return valor;
  if (valor === undefined || valor === null) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

export const agendaDisponibilidadeService = {
  calcularHorarioFim: adicionarMinutosHorario,

  verificarDisponibilidade({
    profissionalId,
    data,
    horario,
    duracaoMinutos = 60,
    disponibilidades = [],
    ausencias = [],
    agendamentos = [],
    ignorarAgendamentoId = null,
  }) {
    return agendaDisponibilidadeService.obterMotivoIndisponibilidade({
      profissionalId,
      data,
      horario,
      duracaoMinutos,
      disponibilidades,
      ausencias,
      agendamentos,
      ignorarAgendamentoId,
    }) === null;
  },

  obterMotivoIndisponibilidade({
    profissionalId,
    data,
    horario,
    duracaoMinutos = 60,
    disponibilidades = [],
    ausencias = [],
    agendamentos = [],
    ignorarAgendamentoId = null,
  }) {
    if (!profissionalId || !data || !horario) return 'Selecione profissional, data e horário';

    const fimHorario = adicionarMinutosHorario(horario, duracaoMinutos);
    const dataObj = new Date(`${data}T12:00:00`);
    const diaSemana = dataObj.getDay();

    const disponibilidade = (disponibilidades || []).find((item) => (
      String(item.profissionalId) === String(profissionalId) &&
      normalizarDiaSemana(item.diaSemana) === diaSemana &&
      item.ativo !== false
    ));

    if (!disponibilidade) return 'Profissional não trabalha neste dia da semana';

    if (!intervalosSobrepoem(horario, fimHorario, disponibilidade.horarioInicio, disponibilidade.horarioFim) ||
        horarioParaMinutos(horario) < horarioParaMinutos(disponibilidade.horarioInicio) ||
        horarioParaMinutos(fimHorario) > horarioParaMinutos(disponibilidade.horarioFim)) {
      return 'Fora do horário de atendimento do profissional';
    }

    if (disponibilidade.intervaloInicio && disponibilidade.intervaloFim &&
        intervalosSobrepoem(horario, fimHorario, disponibilidade.intervaloInicio, disponibilidade.intervaloFim)) {
      return 'Horário de intervalo';
    }

    const ausencia = (ausencias || []).find((item) => (
      String(item.profissionalId) === String(profissionalId) &&
      data >= item.dataInicio &&
      data <= item.dataFim &&
      (
        (item.horarioInicio === '00:00' && item.horarioFim === '23:59') ||
        intervalosSobrepoem(horario, fimHorario, item.horarioInicio, item.horarioFim)
      )
    ));

    if (ausencia) {
      const tipos = {
        folga: 'Profissional está de folga',
        ferias: 'Profissional está de férias',
        licenca: 'Profissional está de licença',
        falta: 'Profissional ausente',
        treinamento: 'Profissional em treinamento',
        evento: 'Profissional em evento',
      };
      return tipos[ausencia.tipo] || 'Profissional ausente';
    }

    const conflito = (agendamentos || []).some((agendamento) => (
      String(agendamento.profissionalId) === String(profissionalId) &&
      agendamento.data === data &&
      String(agendamento.id) !== String(ignorarAgendamentoId || '') &&
      agendamento.status !== 'cancelado' &&
      intervalosSobrepoem(horario, fimHorario, obterInicioAgendamento(agendamento), obterFimAgendamento(agendamento))
    ));

    if (conflito) return 'Horário já ocupado';
    return null;
  },
};

export default agendaDisponibilidadeService;
