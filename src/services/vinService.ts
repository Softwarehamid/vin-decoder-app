import { VinDecodeResult, NhtsaApiResponse } from '../types/vin';

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Decodes a VIN using the NHTSA API
 * @param vin - The VIN to decode
 * @returns Promise with decoded VIN data
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  const cleanVin = vin.replace(/\s/g, '').toUpperCase();
  const url = `${NHTSA_API_BASE}/DecodeVin/${cleanVin}?format=json`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: NhtsaApiResponse = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      throw new Error('No data returned from NHTSA API');
    }
    
    // Extract relevant fields from the API response
    const resultMap = new Map<string, string>();
    data.Results.forEach(item => {
      if (item.Value && item.Value.trim() !== '') {
        resultMap.set(item.Variable, item.Value);
      }
    });
    
    const result: VinDecodeResult = {
      Make: resultMap.get('Make') || 'Unknown',
      Model: resultMap.get('Model') || 'Unknown',
      ModelYear: resultMap.get('Model Year') || 'Unknown',
      EngineModel: resultMap.get('Engine Model') || resultMap.get('Engine Configuration') || 'Unknown',
      Trim: resultMap.get('Trim') || resultMap.get('Series') || 'Unknown',
      PlantCountry: resultMap.get('Plant Country') || 'Unknown',
      PlantCompanyName: resultMap.get('Plant Company Name') || 'Unknown',
      PlantCity: resultMap.get('Plant City') || 'Unknown',
      PlantState: resultMap.get('Plant State') || 'Unknown'
    };
    
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to decode VIN: ${error.message}`);
    }
    throw new Error('Failed to decode VIN: Unknown error');
  }
}