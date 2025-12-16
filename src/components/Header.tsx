import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          <h1 className="text-lg font-bold tracking-tight">ForensicTrack</h1>
        </div>
      </div>
    </header>
  );
};
