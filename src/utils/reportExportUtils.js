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
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(156, 39, 176);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setFillColor(248, 245, 251);
  doc.roundedRect(12, 22, pageWidth - 24, 22, 3, 3, 'F');
  doc.setTextColor(156, 39, 176);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title || 'Relatório', 16, 31);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text(subtitle || `Gerado em: ${new Date().toLocaleString('pt-BR')}`, 16, 38);

  let startY = 52;
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
    theme: 'striped',
    headStyles: { fillColor: [156, 39, 176] },
    styles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [252, 248, 255] },
    margin: { left: 12, right: 12 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.line(12, pageHeight - 14, pageWidth - 12, pageHeight - 14);
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 12, pageHeight - 8);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - 32, pageHeight - 8);
  }

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
