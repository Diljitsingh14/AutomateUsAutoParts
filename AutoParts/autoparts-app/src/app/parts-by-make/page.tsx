'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PartsByMakeResult, ServiceLineData } from '@/lib/types/api';

const vehicleMakes = [
  'Honda', 'Toyota', 'Ford', 'Chevrolet', 'Nissan', 'Kia', 
  'Hyundai', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Mazda', 'Subaru'
];

export default function PartsByMakePage() {
  const [selectedMake, setSelectedMake] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PartsByMakeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMake) {
      setError('Please select a vehicle make');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/parts-by-make?make=${encodeURIComponent(selectedMake)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch parts');
      }

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result || !result.data) return;

    // Create CSV content
    const headers = Object.keys(result.data[0]).join(',');
    const rows = result.data.map((item: ServiceLineData) => 
      Object.values(item).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    const csv = [headers, ...rows].join('\\n');

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parts_${selectedMake}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
              Auto Parts Manager
            </Link>
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Parts by Make</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vehicle Make
              </label>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a Make --</option>
                {vehicleMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedMake}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Fetching Parts...' : 'Get Parts'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Results Found!</h3>
                  <p className="text-green-800">
                    Total parts for <strong>{selectedMake}</strong>: {result.count}
                  </p>
                </div>
                {result.count > 0 && (
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Download CSV
                  </button>
                )}
              </div>
              
              {result.data && result.data.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-green-900 mb-2">Preview:</h4>
                  <div className="overflow-x-auto">
                    <pre className="text-xs bg-white p-4 rounded border border-green-300 overflow-auto max-h-96">
                      {JSON.stringify(result.data.slice(0, 5), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
