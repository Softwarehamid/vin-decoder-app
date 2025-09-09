import { describe, it, expect } from 'vitest';
import { exportToCsv, importFromCsv } from '../csvUtils';
import { VinLookup } from '../../types/vin';

describe('csvUtils', () => {
  const mockLookups: VinLookup[] = [
    {
      id: '1',
      vin: '1HGBH41JXMN109186',
      timestamp: 1640995200000, // 2022-01-01
      result: {
        Make: 'Honda',
        Model: 'Civic',
        ModelYear: '2021',
        EngineModel: '1.5L',
        Trim: 'EX',
        PlantCountry: 'USA',
        PlantCompanyName: 'Honda Manufacturing',
        PlantCity: 'Marysville',
        PlantState: 'Ohio'
      }
    },
    {
      id: '2',
      vin: '1FTFW1ET5DFC12345',
      timestamp: 1641081600000, // 2022-01-02
      result: null,
      error: 'Invalid VIN'
    }
  ];

  describe('exportToCsv', () => {
    it('should export lookups to CSV format', () => {
      const csv = exportToCsv(mockLookups);
      const lines = csv.split('\n');
      
      expect(lines[0]).toContain('VIN,Timestamp,Date,Make,Model');
      expect(lines[1]).toContain('"1HGBH41JXMN109186"');
      expect(lines[1]).toContain('"Honda"');
      expect(lines[1]).toContain('"Civic"');
      expect(lines[2]).toContain('"1FTFW1ET5DFC12345"');
      expect(lines[2]).toContain('"Invalid VIN"');
    });

    it('should handle empty lookups array', () => {
      const csv = exportToCsv([]);
      const lines = csv.split('\n');
      
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain('VIN,Timestamp,Date,Make,Model');
    });
  });

  describe('importFromCsv', () => {
    it('should import CSV data to lookups', () => {
      const csv = `VIN,Timestamp,Date,Make,Model,Year,Engine,Trim,Plant Country,Plant Company,Plant City,Plant State,Error
"1HGBH41JXMN109186",1640995200000,"2022-01-01T00:00:00.000Z","Honda","Civic","2021","1.5L","EX","USA","Honda Manufacturing","Marysville","Ohio",""
"1FTFW1ET5DFC12345",1641081600000,"2022-01-02T00:00:00.000Z","","","","","","","","","","Invalid VIN"`;
      
      const lookups = importFromCsv(csv);
      
      expect(lookups).toHaveLength(2);
      expect(lookups[0].vin).toBe('1HGBH41JXMN109186');
      expect(lookups[0].result?.Make).toBe('Honda');
      expect(lookups[1].vin).toBe('1FTFW1ET5DFC12345');
      expect(lookups[1].error).toBe('Invalid VIN');
    });

    it('should handle empty CSV', () => {
      const lookups = importFromCsv('');
      expect(lookups).toHaveLength(0);
    });

    it('should handle CSV with only headers', () => {
      const csv = 'VIN,Timestamp,Date,Make,Model,Year,Engine,Trim,Plant Country,Plant Company,Plant City,Plant State,Error';
      const lookups = importFromCsv(csv);
      expect(lookups).toHaveLength(0);
    });
  });
});