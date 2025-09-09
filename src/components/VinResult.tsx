import React from 'react';
import { Car, Calendar, Wrench, Award, MapPin, Building } from 'lucide-react';
import { VinDecodeResult } from '../types/vin';

interface VinResultProps {
  result: VinDecodeResult;
  vin: string;
}

export function VinResult({ result, vin }: VinResultProps) {
  const resultItems = [
    { icon: Building, label: 'Make', value: result.Make },
    { icon: Car, label: 'Model', value: result.Model },
    { icon: Calendar, label: 'Year', value: result.ModelYear },
    { icon: Wrench, label: 'Engine', value: result.EngineModel },
    { icon: Award, label: 'Trim', value: result.Trim },
    { icon: MapPin, label: 'Plant Country', value: result.PlantCountry },
    { icon: Building, label: 'Plant Company', value: result.PlantCompanyName },
    { icon: MapPin, label: 'Plant City', value: result.PlantCity },
    { icon: MapPin, label: 'Plant State', value: result.PlantState }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Decode Results</h2>
        <p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-2 rounded">
          VIN: {vin}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resultItems.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Icon size={20} className="text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-gray-900 truncate" title={value}>
                {value === 'Unknown' ? (
                  <span className="text-gray-400 italic">Not available</span>
                ) : (
                  value
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}