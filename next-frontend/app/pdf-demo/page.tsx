'use client';

import React, { useState } from 'react';

export default function PdfDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      // We are hitting the Laravel Backend URL (proxied or direct)
      // Since Next.js is on 3000 and Laravel on 8000, we use the direct URL for this demo.
      // In production, you'd use an env var.
      const response = await fetch('http://127.0.0.1:8000/app/pdf-demo?full_name=TestUser&email=test@example.com');
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">PDF Generation Demo</h1>
        <p className="mb-6 text-gray-600">
          Click below to generate a PDF with "Test User" mapped to specific coordinates.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-semibold text-white transition-colors 
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}
