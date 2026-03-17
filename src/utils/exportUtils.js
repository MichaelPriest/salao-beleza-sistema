// src/utils/exportUtils.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exporta dados para CSV
 * @param {Array} data - Array de objetos a serem exportados
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {Array} columns - Colunas a serem incluídas (opcional)
 */
export const exportToCSV = (data, filename, columns = null) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('Não há dados para exportar');
    }

    // Determinar colunas
    let headers = columns;
    if (!headers) {
      headers = Object.keys(data[0]).filter(key => 
        !key.startsWith('_') && 
        typeof data[0][key] !== 'object' &&
        !Array.isArray(data[0][key])
      );
    }

    // Criar linhas CSV
    const csvRows = [];
    
    // Adicionar cabeçalhos
    csvRows.push(headers.join(','));

    // Adicionar dados
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header] || '';
        // Escapar valores que contenham vírgulas ou aspas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);

    return true;
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw error;
  }
};

/**
 * Exporta dados para Excel (XLSX)
 * @param {Array} data - Array de objetos a serem exportados
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {string} sheetName - Nome da planilha
 * @param {Array} columns - Colunas a serem incluídas (opcional)
 */
export const exportToExcel = (data, filename, sheetName = 'Dados', columns = null) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('Não há dados para exportar');
    }

    // Determinar colunas
    let headers = columns;
    if (!headers) {
      headers = Object.keys(data[0]).filter(key => 
        !key.startsWith('_') && 
        typeof data[0][key] !== 'object' ||
        (typeof data[0][key] === 'object' && data[0][key] !== null && !Array.isArray(data[0][key]))
      );
    }

    // Preparar dados para Excel
    const excelData = data.map(item => {
      const row = {};
      headers.forEach(header => {
        let value = item[header];
        
        // Tratar objetos complexos
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (value.toDate) {
            // Timestamp do Firebase
            value = value.toDate().toLocaleString('pt-BR');
          } else if (value instanceof Date) {
            value = value.toLocaleString('pt-BR');
          } else {
            value = JSON.stringify(value);
          }
        } else if (Array.isArray(value)) {
          value = value.length;
        }
        
        row[header] = value || '';
      });
      return row;
    });

    // Criar worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData, { header: headers });

    // Ajustar largura das colunas
    const colWidths = headers.map(header => ({
      wch: Math.max(header.length, 15)
    }));
    ws['!cols'] = colWidths;

    // Adicionar ao workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Salvar arquivo
    XLSX.writeFile(wb, `${filename}.xlsx`);

    return true;
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    throw error;
  }
};

/**
 * Exporta dados para PDF
 * @param {Array} data - Array de objetos a serem exportados
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {string} title - Título do relatório
 * @param {Object} options - Opções adicionais
 */
export const exportToPDF = (data, filename, title = 'Relatório', options = {}) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('Não há dados para exportar');
    }

    // Criar documento PDF
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4'
    });

    // Configurar fonte
    doc.setFont('helvetica');

    // Título
    doc.setFontSize(18);
    doc.setTextColor(156, 39, 176); // Roxo
    doc.text(title, 14, 22);

    // Subtítulo com data
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    // Linha separadora
    doc.setDrawColor(156, 39, 176);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);

    // Determinar colunas
    const headers = options.columns || Object.keys(data[0]).filter(key => 
      !key.startsWith('_') && 
      typeof data[0][key] !== 'object' ||
      (typeof data[0][key] === 'object' && data[0][key] !== null && !Array.isArray(data[0][key]))
    );

    // Preparar dados para tabela
    const tableData = data.map(item => {
      return headers.map(header => {
        let value = item[header];
        if (value && typeof value === 'object') {
          if (value.toDate) {
            value = value.toDate().toLocaleDateString('pt-BR');
          } else if (value instanceof Date) {
            value = value.toLocaleDateString('pt-BR');
          } else {
            value = '';
          }
        }
        return value?.toString() || '';
      });
    });

    // Criar tabela
    doc.autoTable({
      head: [headers.map(h => h.toUpperCase())],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [156, 39, 176],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
      ...options.tableOptions,
    });

    // Adicionar rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10
      );
    }

    // Salvar PDF
    doc.save(`${filename}.pdf`);

    return true;
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw error;
  }
};

/**
 * Exporta dados para JSON
 * @param {Array} data - Array de objetos a serem exportados
 * @param {string} filename - Nome do arquivo (sem extensão)
 */
export const exportToJSON = (data, filename) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('Não há dados para exportar');
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `${filename}.json`);

    return true;
  } catch (error) {
    console.error('Erro ao exportar JSON:', error);
    throw error;
  }
};

/**
 * Exporta dados para HTML (para impressão)
 * @param {Array} data - Array de objetos a serem exportados
 * @param {string} title - Título do relatório
 * @param {Object} options - Opções adicionais
 * @returns {string} HTML gerado
 */
export const exportToHTML = (data, title = 'Relatório', options = {}) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('Não há dados para exportar');
    }

    // Determinar colunas
    const headers = options.columns || Object.keys(data[0]).filter(key => 
      !key.startsWith('_') && 
      typeof data[0][key] !== 'object' ||
      (typeof data[0][key] === 'object' && data[0][key] !== null && !Array.isArray(data[0][key]))
    );

    // Gerar HTML
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            background: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #9c27b0;
          }
          .title {
            color: #9c27b0;
            font-size: 24px;
            margin: 0;
          }
          .date {
            color: #666;
            font-size: 12px;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #9c27b0;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 13px;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; }
            .header { margin-bottom: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${title}</h1>
          <div class="date">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h.toUpperCase()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach(item => {
      html += '<tr>';
      headers.forEach(header => {
        let value = item[header];
        if (value && typeof value === 'object') {
          if (value.toDate) {
            value = value.toDate().toLocaleDateString('pt-BR');
          } else if (value instanceof Date) {
            value = value.toLocaleDateString('pt-BR');
          } else {
            value = '';
          }
        }
        html += `<td>${value || ''}</td>`;
      });
      html += '</tr>';
    });

    html += `
          </tbody>
        </table>
        
        <div class="footer">
          Total de registros: ${data.length} | Gerado por BeautyPro Sistema
        </div>
      </body>
      </html>
    `;

    return html;
  } catch (error) {
    console.error('Erro ao exportar HTML:', error);
    throw error;
  }
};

/**
 * Abre uma janela de impressão com os dados
 * @param {Array} data - Array de objetos a serem impressos
 * @param {string} title - Título do relatório
 * @param {Object} options - Opções adicionais
 */
export const printData = (data, title = 'Relatório', options = {}) => {
  try {
    const html = exportToHTML(data, title, options);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    console.error('Erro ao imprimir:', error);
    throw error;
  }
};
