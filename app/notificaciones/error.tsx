'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ reset }: ErrorProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border-2 border-[#E8DED3] p-6 shadow-sm">
        <div className="bg-[#9B2C2C]/10 border-2 border-[#9B2C2C]/20 rounded-2xl p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[#9B2C2C] mx-auto" />
          <p className="text-[#9B2C2C] font-medium">
            No se pudo completar la operación. Intenta de nuevo
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#A93226] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    </main>
  );
}