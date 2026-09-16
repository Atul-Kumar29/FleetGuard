import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Downloads data as a CSV file.
 * Automatically escapes cells with quotes/commas (PapaParse equivalent).
 * 
 * @param {Array<string>} headers Column headers
 * @param {Array<Array<any>>} rows Data rows
 * @param {string} filename Output file name
 */
export function exportCSV(headers, rows, filename) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a tabular PDF report using jsPDF.
 * 
 * @param {string} title Report title header
 * @param {Array<string>} headers Column headers
 * @param {Array<Array<any>>} rows Data rows
 * @param {string} filename Output file name
 */
export function exportPDF(title, headers, rows, filename) {
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Set generation timestamp
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  
  // Render table
  autoTable(doc, {
    startY: 32,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59] }, // Slate-800 color
    styles: { fontSize: 9, cellPadding: 3.5 },
    margin: { top: 30 }
  });
  
  doc.save(filename);
}
