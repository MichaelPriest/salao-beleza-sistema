import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const safe = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (value instanceof Date) return value.toLocaleString('pt-BR');
  if (typeof value === 'number') return Number.isInteger(value) ? value : Number(value).toFixed(2);
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.map(safe).join(', ');
  if (typeof value === 'object') return value.nome || value.name || value.label || JSON.stringify(value);
  return String(value);
};

export const normalizarLinhasExportacao = (rows = [], columns = null) => {
  const source = Array.isArray(rows) ? rows : [];
  const keys = columns || Array.from(new Set(source.flatMap((row) => Object.keys(row || {}))))
    .filter((key) => !['id', 'uid', 'createdAt', 'updatedAt'].includes(key));
  return {
    columns: keys,
    headers: keys.map((key) => key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()),
    body: source.map((row) => keys.map((key) => safe(row?.[key]))),
  };
};

export const exportRowsToPdf = ({ title, subtitle, rows, columns, filename, summary = [] }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const { headers, body } = normalizarLinhasExportacao(rows, columns);
  doc.setFillColor(156, 39, 176);
  doc.rect(0, 0, 210, 14, 'F');
  doc.setTextColor(156, 39, 176);
  doc.setFontSize(18);
  doc.text(title || 'Relatório', 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(subtitle || `Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 36);

  let startY = 44;
  if (summary.length) {
    doc.autoTable({
      startY,
      head: [['Indicador', 'Valor']],
      body: summary.map((item) => [item.label, safe(item.value)]),
      headStyles: { fillColor: [156, 39, 176] },
    });
    startY = doc.lastAutoTable.finalY + 8;
  }

  doc.autoTable({
    startY,
    head: [headers],
    body,
    headStyles: { fillColor: [156, 39, 176] },
    styles: { fontSize: 8 },
  });
  doc.save(filename || `relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportRowsToExcel = ({ title, subtitle, rows, columns, filename, summary = [] }) => {
  const { headers, body } = normalizarLinhasExportacao(rows, columns);
  const aoa = [
    [title || 'Relatório'],
    [subtitle || `Gerado em: ${new Date().toLocaleString('pt-BR')}`],
    [],
    ...summary.map((item) => [item.label, item.value]),
    ...(summary.length ? [[]] : []),
    headers,
    ...body,
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = headers.map(() => ({ wch: 24 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  XLSX.writeFile(wb, filename || `relatorio_${new Date().toISOString().split('T')[0]}.xlsx`);
};
