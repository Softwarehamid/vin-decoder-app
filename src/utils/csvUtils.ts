import { VinLookup } from '../types/vin';

/**
 * Exports VIN lookup history to CSV format
 * @param lookups - Array of VIN lookups to export
 * @returns CSV string
 */
export function exportToCsv(lookups: VinLookup[]): string {
  const headers = [
    'VIN',
    'Timestamp',
    'Date',
    'Make',
    'Model',
    'Year',
    'Engine',
    'Trim',
    'Plant Country',
    'Plant Company',
    'Plant City',
    'Plant State',
    'Error'
  ];

  const csvRows = [headers.join(',')];

  lookups.forEach(lookup => {
    const date = new Date(lookup.timestamp).toISOString();
    const row = [
      `"${lookup.vin}"`,
      lookup.timestamp.toString(),
      `"${date}"`,
      `"${lookup.result?.Make || ''}"`,
      `"${lookup.result?.Model || ''}"`,
      `"${lookup.result?.ModelYear || ''}"`,
      `"${lookup.result?.EngineModel || ''}"`,
      `"${lookup.result?.Trim || ''}"`,
      `"${lookup.result?.PlantCountry || ''}"`,
      `"${lookup.result?.PlantCompanyName || ''}"`,
      `"${lookup.result?.PlantCity || ''}"`,
      `"${lookup.result?.PlantState || ''}"`,
      `"${lookup.error || ''}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Parses CSV content and returns VIN lookup objects
 * @param csvContent - CSV string content
 * @returns Array of VIN lookup objects
 */
export function importFromCsv(csvContent: string): VinLookup[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const lookups: VinLookup[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    
    if (values.length >= 13) {
      const lookup: VinLookup = {
        id: crypto.randomUUID(),
        vin: values[0],
        timestamp: parseInt(values[1]) || Date.now(),
        result: values[3] ? {
          Make: values[3],
          Model: values[4],
          ModelYear: values[5],
          EngineModel: values[6],
          Trim: values[7],
          PlantCountry: values[8],
          PlantCompanyName: values[9],
          PlantCity: values[10],
          PlantState: values[11]
        } : null,
        error: values[12] || undefined
      };
      lookups.push(lookup);
    }
  }

  return lookups;
}

/**
 * Parses a single CSV line handling quoted values
 * @param line - CSV line to parse
 * @returns Array of values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}