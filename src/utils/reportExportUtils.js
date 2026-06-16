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

const escapeHtml = (value) => safe(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

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

export const buildEmpresaHeaderHtml = (empresa = null) => {
  const empresaDados = getEmpresaImpressao(empresa);
  const contatos = [empresaDados.telefone, empresaDados.whatsapp, empresaDados.email].filter(Boolean).join(' • ');

  return `
    <section class="print-company-header">
      <div class="print-company-brand">
        ${empresaDados.logo
          ? `<img class="print-company-logo" src="${escapeHtml(empresaDados.logo)}" alt="Logo" />`
          : `<div class="print-company-logo-placeholder">LOGO</div>`}
        <div>
          <h1>${escapeHtml(empresaDados.nome)}</h1>
          ${empresaDados.razaoSocial ? `<p>${escapeHtml(empresaDados.razaoSocial)}</p>` : ''}
          ${empresaDados.cnpj ? `<p><strong>CNPJ:</strong> ${escapeHtml(empresaDados.cnpj)}</p>` : ''}
          ${empresaDados.endereco ? `<p>${escapeHtml(empresaDados.endereco)}</p>` : ''}
          ${contatos ? `<p>${escapeHtml(contatos)}</p>` : ''}
        </div>
      </div>
      <div class="print-company-meta">
        <strong>Gerado em</strong>
        <span>${new Date().toLocaleString('pt-BR')}</span>
      </div>
    </section>
  `;
};

export const professionalPrintStyles = `
  :root {
    --print-primary: #9c27b0;
    --print-primary-dark: #6a1b9a;
    --print-soft: #f8f5fb;
    --print-border: rgba(156, 39, 176, 0.18);
    --print-text: #2d2633;
  }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: var(--print-text);
    margin: 0;
    background: #fff;
  }
  .print-document {
    max-width: 1120px;
    margin: 0 auto;
    padding: 24px;
  }
  .print-company-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    padding: 18px;
    border: 1px solid var(--print-border);
    border-left: 8px solid var(--print-primary);
    border-radius: 14px;
    background: linear-gradient(135deg, #fff 0%, var(--print-soft) 100%);
    margin-bottom: 22px;
  }
  .print-company-brand { display: flex; gap: 14px; align-items: center; }
  .print-company-logo, .print-company-logo-placeholder {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    object-fit: contain;
    background: #fff;
    border: 1px solid var(--print-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--print-primary);
    font-size: 11px;
    font-weight: 800;
  }
  .print-company-header h1 {
    margin: 0 0 4px;
    color: var(--print-primary);
    font-size: 24px;
    line-height: 1.15;
  }
  .print-company-header p { margin: 2px 0; color: #5f5667; font-size: 12px; }
  .print-company-meta {
    min-width: 150px;
    text-align: right;
    color: #5f5667;
    font-size: 12px;
  }
  .print-company-meta span { display: block; margin-top: 4px; }
  .print-title {
    margin: 0 0 16px;
    padding: 14px 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--print-primary) 0%, var(--print-primary-dark) 100%);
    color: white;
  }
  .print-title h2 { margin: 0; font-size: 22px; }
  .print-title p { margin: 5px 0 0; opacity: 0.88; font-size: 13px; }
  .print-info-grid, .info-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 16px 0 22px;
  }
  .print-info-item, .info-item {
    padding: 12px;
    border: 1px solid var(--print-border);
    border-radius: 10px;
    background: var(--print-soft);
  }
  .print-info-item .label, .info-item .label {
    display: block;
    color: #6b6173;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    margin-bottom: 4px;
  }
  .print-info-item .value, .info-item .value {
    display: block;
    color: var(--print-text);
    font-size: 14px;
    font-weight: 800;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px;
    border: 1px solid var(--print-border);
  }
  th {
    background: var(--print-primary);
    color: white;
    padding: 9px;
    text-align: left;
    font-size: 12px;
  }
  td {
    padding: 8px 9px;
    border-bottom: 1px solid #eee5f3;
    font-size: 12px;
    vertical-align: top;
  }
  tbody tr:nth-child(even) td { background: #fcf8ff; }
  .print-total, .total {
    margin-left: auto;
    width: fit-content;
    min-width: 260px;
    padding: 13px 16px;
    border-radius: 12px;
    border: 1px solid #c8e6c9;
    background: #f1f8e9;
    color: #2e7d32;
    font-weight: 900;
    text-align: right;
  }
  .print-note, .observacoes {
    margin: 16px 0;
    padding: 12px 14px;
    border-radius: 10px;
    background: #fff8e1;
    border-left: 5px solid #ff9800;
    color: #5d4037;
  }
  .print-footer, .footer {
    margin-top: 28px;
    padding-top: 12px;
    border-top: 1px solid var(--print-border);
    text-align: center;
    color: #7b7280;
    font-size: 11px;
  }
  @media print {
    @page { margin: 12mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print, .MuiDrawer-root, .MuiAppBar-root, .MuiBottomNavigation-root, button { display: none !important; }
    .print-document { max-width: none; padding: 0; }
    .print-company-header, .print-title, th {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-info-grid, .info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

export const buildProfessionalPrintHtml = ({ title, subtitle, body, empresa = null }) => `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title || 'Documento')}</title>
      <style>${professionalPrintStyles}</style>
    </head>
    <body>
      <main class="print-document">
        ${buildEmpresaHeaderHtml(empresa)}
        <section class="print-title">
          <h2>${escapeHtml(title || 'Documento')}</h2>
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
        </section>
        ${body || ''}
        <footer class="print-footer">Documento gerado pelo sistema de gestão • ${new Date().toLocaleString('pt-BR')}</footer>
      </main>
      <script>window.onload = function() { window.print(); }</script>
    </body>
  </html>
`;

export const openProfessionalPrintWindow = ({ title, subtitle, body, empresa = null }) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.write(buildProfessionalPrintHtml({ title, subtitle, body, empresa }));
  printWindow.document.close();
  return true;
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
