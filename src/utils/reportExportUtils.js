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

const parseStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setEmpresaImpressaoCache = (config) => {
  try {
    if (config) {
      localStorage.setItem('configuracaoAtual', JSON.stringify(config));
    }
  } catch {
    // Cache local é apenas uma otimização para impressões/exportações.
  }
};

export const getEmpresaImpressao = (empresaInformada = null) => {
  const stored = empresaInformada
    || parseStorage('configuracaoAtual')
    || parseStorage('configuracoes')?.[0]
    || parseStorage('configuracao')
    || parseStorage('empresa')
    || parseStorage('tenant')?.empresa
    || {};

  const salao = stored.salao || stored.configuracoes?.salao || stored;
  const endereco = salao.endereco || {};
  const contato = salao.contato || {};
  const enderecoCompleto = [
    endereco.logradouro || salao.logradouro,
    endereco.numero || salao.numero,
    endereco.bairro || salao.bairro,
    endereco.cidade || salao.cidade,
    endereco.estado || salao.estado,
    endereco.cep || salao.cep,
  ].filter(Boolean).join(', ');

  return {
    nome: salao.nomeFantasia || salao.nome || salao.razaoSocial || 'Beauty Pro',
    razaoSocial: salao.razaoSocial || salao.nome || '',
    cnpj: salao.cnpj || '',
    logo: salao.logo || salao.logoBase64 || salao.logoUrl || stored.logo || '',
    endereco: enderecoCompleto,
    telefone: contato.telefone || salao.telefone || '',
    whatsapp: contato.whatsapp || salao.whatsapp || '',
    email: contato.email || salao.email || '',
  };
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

export const exportRowsToPdf = ({ title, subtitle, rows, columns, filename, summary = [], empresa = null }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const { headers, body } = normalizarLinhasExportacao(rows, columns);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const empresaDados = getEmpresaImpressao(empresa);

  doc.setFillColor(156, 39, 176);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setFillColor(248, 245, 251);
  doc.roundedRect(12, 22, pageWidth - 24, 38, 3, 3, 'F');
  if (empresaDados.logo) {
    try {
      doc.addImage(empresaDados.logo, 'JPEG', 16, 26, 18, 18);
    } catch {
      try {
        doc.addImage(empresaDados.logo, 'PNG', 16, 26, 18, 18);
      } catch {
        doc.setFillColor(156, 39, 176);
        doc.circle(25, 35, 9, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('LOGO', 25, 36, { align: 'center' });
      }
    }
  } else {
    doc.setFillColor(156, 39, 176);
    doc.circle(25, 35, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('LOGO', 25, 36, { align: 'center' });
  }
  doc.setTextColor(156, 39, 176);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text(empresaDados.nome, 40, 30);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text([
    empresaDados.cnpj ? `CNPJ: ${empresaDados.cnpj}` : '',
    empresaDados.endereco,
    [empresaDados.telefone, empresaDados.whatsapp, empresaDados.email].filter(Boolean).join(' • '),
  ].filter(Boolean), 40, 36);
  doc.setTextColor(156, 39, 176);
  doc.setFontSize(15);
  doc.setFont(undefined, 'bold');
  doc.text(title || 'Relatório', 12, 72);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text(subtitle || `Gerado em: ${new Date().toLocaleString('pt-BR')}`, 12, 78);

  let startY = 86;
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
    doc.text(`${empresaDados.nome} • Gerado em ${new Date().toLocaleString('pt-BR')}`, 12, pageHeight - 8);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - 32, pageHeight - 8);
  }

  doc.save(filename || `relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportRowsToExcel = ({ title, subtitle, rows, columns, filename, summary = [], empresa = null }) => {
  const { headers, body } = normalizarLinhasExportacao(rows, columns);
  const empresaDados = getEmpresaImpressao(empresa);
  const aoa = [
    [empresaDados.nome],
    [empresaDados.razaoSocial || ''],
    [empresaDados.cnpj ? `CNPJ: ${empresaDados.cnpj}` : ''],
    [empresaDados.endereco || ''],
    [[empresaDados.telefone, empresaDados.whatsapp, empresaDados.email].filter(Boolean).join(' • ')],
    [],
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
