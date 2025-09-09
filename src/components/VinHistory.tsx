import React, { useState, useMemo } from 'react';
import { Search, Download, Upload, Trash2, Calendar, AlertCircle, Car } from 'lucide-react';
import { VinLookup } from '../types/vin';
import { exportToCsv, importFromCsv } from '../utils/csvUtils';

interface VinHistoryProps {
  lookups: VinLookup[];
  onImport: (lookups: VinLookup[]) => void;
  onClear: () => void;
  onSelectLookup: (lookup: VinLookup) => void;
}

export function VinHistory({ lookups, onImport, onClear, onSelectLookup }: VinHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'vin'>('timestamp');

  const filteredAndSortedLookups = useMemo(() => {
    let filtered = lookups;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = lookups.filter(lookup =>
        lookup.vin.toLowerCase().includes(query) ||
        lookup.result?.Make?.toLowerCase().includes(query) ||
        lookup.result?.Model?.toLowerCase().includes(query) ||
        lookup.result?.ModelYear?.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return b.timestamp - a.timestamp;
      } else {
        return a.vin.localeCompare(b.vin);
      }
    });
  }, [lookups, searchQuery, sortBy]);

  const handleExport = () => {
    const csv = exportToCsv(lookups);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vin-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      try {
        const importedLookups = importFromCsv(csv);
        onImport(importedLookups);
      } catch (error) {
        alert('Error importing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Lookup History ({lookups.length})
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={lookups.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <Download size={16} />
            Export CSV
          </button>
          
          <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer">
            <Upload size={16} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <button
            onClick={onClear}
            disabled={lookups.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>
      </div>

      {lookups.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by VIN, make, model, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'vin')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="timestamp">Sort by Date</option>
            <option value="vin">Sort by VIN</option>
          </select>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAndSortedLookups.length === 0 ? (
          <div className="text-center py-8">
            {lookups.length === 0 ? (
              <>
                <Car size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No VIN lookups yet</p>
                <p className="text-gray-400 text-sm mt-2">Decode your first VIN to see it here</p>
              </>
            ) : (
              <>
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No results found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search query</p>
              </>
            )}
          </div>
        ) : (
          filteredAndSortedLookups.map((lookup) => (
            <div
              key={lookup.id}
              onClick={() => onSelectLookup(lookup)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {lookup.vin}
                    </code>
                    {lookup.error && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                  </div>
                  
                  {lookup.result ? (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        {lookup.result.ModelYear} {lookup.result.Make} {lookup.result.Model}
                      </span>
                      {lookup.result.Trim !== 'Unknown' && (
                        <span className="ml-2">• {lookup.result.Trim}</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      {lookup.error || 'Decode failed'}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  {new Date(lookup.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}