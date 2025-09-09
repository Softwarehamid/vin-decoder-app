import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface VinInputProps {
  onDecode: (vin: string) => void;
  loading: boolean;
  error?: string;
}

export function VinInput({ onDecode, loading, error }: VinInputProps) {
  const [vin, setVin] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!vin.trim()) {
      setLocalError('Please enter a VIN');
      return;
    }
    
    onDecode(vin.trim());
  };

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setVin(value);
    setLocalError('');
  };

  const displayError = error || localError;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Decode VIN</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="vin-input" className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Identification Number (VIN)
          </label>
          <div className="relative">
            <input
              id="vin-input"
              type="text"
              value={vin}
              onChange={handleVinChange}
              placeholder="Enter 17-character VIN"
              maxLength={17}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                displayError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={loading}
            />
            <div className="absolute right-3 top-3 text-sm text-gray-400">
              {vin.length}/17
            </div>
          </div>
          {displayError && (
            <p className="mt-2 text-sm text-red-600">{displayError}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || vin.length !== 17}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Decoding...
            </>
          ) : (
            <>
              <Search size={10} />
              Decode VIN
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Press Ctrl+/ to focus the VIN input field</p>
        <p>VIN must be 17 characters (letters I, O, Q not allowed)</p>
      </div>
    </div>
  );
}