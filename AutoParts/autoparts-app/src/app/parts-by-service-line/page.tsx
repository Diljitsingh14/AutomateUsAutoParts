'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PartsByServiceLineResult } from '@/lib/types/api';

export default function PartsByServiceLinePage() {
  const [serviceLineId, setServiceLineId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PartsByServiceLineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceLineId) {
      setError('Please enter a service line ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/parts-by-service-line?serviceLineId=${encodeURIComponent(serviceLineId)}`);
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

    // Create JSON file
    const json = JSON.stringify(result.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serviceline_${serviceLineId}_${new Date().toISOString().split('T')[0]}.json`;
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Parts by Service Line</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Line ID
              </label>
              <input
                type="text"
                value={serviceLineId}
                onChange={(e) => setServiceLineId(e.target.value)}
                placeholder="Enter service line ID (e.g., 911897)"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the service line ID to fetch all associated parts
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !serviceLineId}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
            <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Service Line Found!</h3>
                  <p className="text-purple-800">
                    Service Line ID: <strong>{result.data.serviceLineId}</strong>
                  </p>
                  <p className="text-purple-800">
                    Make: <strong>{result.data.make}</strong> | 
                    Model: <strong>{result.data.model}</strong> | 
                    Year: <strong>{result.data.year}</strong>
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Download JSON
                </button>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold text-purple-900 mb-2">Details:</h4>
                <div className="overflow-x-auto">
                  <pre className="text-xs bg-white p-4 rounded border border-purple-300 overflow-auto max-h-96">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
