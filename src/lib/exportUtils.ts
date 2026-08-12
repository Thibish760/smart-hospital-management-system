// ─────────────────────────────────────────────────────────────────────────────
// MediFlow — Excel / CSV Export Utility
// Exports data arrays into Excel-compatible CSV files with UTF-8 BOM.
// ─────────────────────────────────────────────────────────────────────────────

export function exportToExcel(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  // Extract keys for header row
  const headers = Object.keys(rows[0]);

  // Construct CSV lines
  const csvLines = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          let value = row[header];
          if (value === null || value === undefined) value = '';
          if (Array.isArray(value)) value = value.join('; ');
          if (typeof value === 'object') value = JSON.stringify(value);
          const str = String(value).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ];

  const csvContent = csvLines.join('\r\n');

  // \uFEFF Byte Order Mark forces Excel to parse file with UTF-8 encoding
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
