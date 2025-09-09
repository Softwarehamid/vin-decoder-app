import React, { useState, useEffect, useRef } from 'react';
import { Car, AlertCircle } from 'lucide-react';
import { VinInput } from './components/VinInput';
import { VinResult } from './components/VinResult';
import { VinHistory } from './components/VinHistory';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { validateVin } from './utils/vinValidator';
import { decodeVin } from './services/vinService';
import { saveLookup, getAllLookups, clearAllLookups, importLookups } from './utils/indexedDB';
import { exportToCsv } from './utils/csvUtils';
import { VinLookup, VinDecodeResult } from './types/vin';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<{ vin: string; result: VinDecodeResult } | null>(null);
  const [lookups, setLookups] = useState<VinLookup[]>([]);
  const vinInputRef = useRef<HTMLInputElement>(null);

  // Load lookup history on component mount
  useEffect(() => {
    loadLookups();
  }, []);

  const loadLookups = async () => {
    try {
      const savedLookups = await getAllLookups();
      setLookups(savedLookups);
    } catch (error) {
      console.error('Failed to load lookup history:', error);
    }
  };

  const handleDecode = async (vin: string) => {
    setLoading(true);
    setError('');
    setCurrentResult(null);

    // Validate VIN
    const validation = validateVin(vin);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid VIN');
      setLoading(false);
      return;
    }

    const cleanVin = vin.replace(/\s/g, '').toUpperCase();
    const lookup: VinLookup = {
      id: crypto.randomUUID(),
      vin: cleanVin,
      timestamp: Date.now(),
      result: null
    };

    try {
      // Try to decode VIN
      const result = await decodeVin(cleanVin);
      lookup.result = result;
      setCurrentResult({ vin: cleanVin, result });
      
      // Save successful lookup
      await saveLookup(lookup);
      setLookups(prev => [lookup, ...prev]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decode VIN';
      setError(errorMessage);
      lookup.error = errorMessage;
      
      // Save failed lookup too
      await saveLookup(lookup);
      setLookups(prev => [lookup, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLookup = (lookup: VinLookup) => {
    if (lookup.result) {
      setCurrentResult({ vin: lookup.vin, result: lookup.result });
      setError('');
    } else {
      setCurrentResult(null);
      setError(lookup.error || 'This lookup failed');
    }
  };

  const handleImportLookups = async (importedLookups: VinLookup[]) => {
    try {
      await importLookups(importedLookups);
      await loadLookups();
      alert(`Successfully imported ${importedLookups.length} lookups`);
    } catch (error) {
      alert('Failed to import lookups');
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all lookup history? This cannot be undone.')) {
      try {
        await clearAllLookups();
        setLookups([]);
        setCurrentResult(null);
        setError('');
      } catch (error) {
        alert('Failed to clear history');
      }
    }
  };

  const handleExportHistory = () => {
    if (lookups.length === 0) return;
    
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

  const focusVinInput = () => {
    const input = document.getElementById('vin-input') as HTMLInputElement;
    input?.focus();
  };

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onFocusInput: focusVinInput,
    onExport: handleExportHistory,
    onClear: handleClearHistory
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <OfflineIndicator />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Car size={40} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">VIN Decoder</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Decode Vehicle Identification Numbers using the NHTSA database. 
            Get detailed information about make, model, year, engine, and manufacturing details.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <VinInput 
              onDecode={handleDecode}
              loading={loading}
              error={error}
            />
            
            {currentResult && (
              <VinResult 
                result={currentResult.result}
                vin={currentResult.vin}
              />
            )}
            
            {error && !currentResult && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">Decode Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            <VinHistory
              lookups={lookups}
              onImport={handleImportLookups}
              onClear={handleClearHistory}
              onSelectLookup={handleSelectLookup}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="max-w-6xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">/</kbd>
              <span className="text-gray-600">Focus VIN input</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">E</kbd>
              <span className="text-gray-600">Export history</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Shift</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Del</kbd>
              <span className="text-gray-600">Clear all</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;