export interface VinDecodeResult {
  Make: string;
  Model: string;
  ModelYear: string;
  EngineModel: string;
  Trim: string;
  PlantCountry: string;
  PlantCompanyName: string;
  PlantCity: string;
  PlantState: string;
}

export interface VinLookup {
  id: string;
  vin: string;
  timestamp: number;
  result: VinDecodeResult | null;
  error?: string;
}

export interface NhtsaApiResponse {
  Results: Array<{
    Variable: string;
    Value: string;
  }>;
  Message: string;
  SearchCriteria: string;
}