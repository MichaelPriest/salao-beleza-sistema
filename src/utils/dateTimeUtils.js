export const getLocalDateInputValue = (date = new Date()) => {
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().slice(0, 10);
};

export const getLocalDateTime = () => ({
  data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  diaSemana: new Date().toLocaleDateString('pt-BR', { weekday: 'short' }),
});

export const parseLocalDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  return new Date(value);
};

export const formatLocalDate = (value, options = {}) => {
  if (!value) return '-';
  const date = parseLocalDateValue(value);
  if (!date || Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('pt-BR', options);
};

export const formatLocalDateTime = (value) => {
  if (!value) return '-';
  const date = parseLocalDateValue(value);
  if (!date || Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-BR');
};
