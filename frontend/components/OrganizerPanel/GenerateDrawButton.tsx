'use client';
import { useState } from 'react';

interface GenerateDrawButtonProps {
  tournamentId: string;
  tournamentName: string;
  onDrawGenerated?: () => void;
}

export default function GenerateDrawButton({
  tournamentId,
  tournamentName,
  onDrawGenerated
}: GenerateDrawButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerateDraw = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/generate-draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tournament_id: tournamentId,
          seeding_mode: 'random',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage('Draw generated successfully!');
        if (onDrawGenerated) {
          onDrawGenerated();
        }
      }
    } catch (error: any) {
      console.error('Error al generar draw:', error);
      setMessage('❌ Error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleGenerateDraw}
        disabled={loading}
        className="bg-tennis-green-600 text-white hover:bg-tennis-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg text-sm py-2 px-4 flex items-center gap-2 shadow-sm transition-all duration-200 border border-transparent"
        title="Generate tournament bracket"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Generate Draw</span>
          </>
        )}
      </button>

      {message && (
        <div className={`absolute top-full mt-2 left-0 z-50 w-64 text-xs p-2 rounded-md shadow-lg ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {message}
        </div>
      )}
    </div>
  );
}