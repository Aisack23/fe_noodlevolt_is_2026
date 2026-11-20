import React from 'react';

export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border-2 border-[#E8DED3] p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-8 bg-[#F7EBD9] rounded-xl w-48 mb-6" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-[#F7EBD9]/50 rounded-xl w-full" />
        ))}
      </div>
    </main>
  );
}