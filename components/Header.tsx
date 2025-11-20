import React from 'react';
import { ShieldCheck, Radar } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-fsgc-panel border-b border-fsgc-blue/20 p-4 flex items-center justify-between shadow-lg relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-fsgc-blue/10 flex items-center justify-center border border-fsgc-blue text-fsgc-blue">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">FSGC TITAN <span className="text-fsgc-blue">V7</span></h1>
          <p className="text-xs text-slate-400 font-mono">AI-POWERED SCOUTING SYSTEM</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-fsgc-blue/60 text-xs font-mono">
         <Radar className="animate-pulse" size={16} />
         <span>SYSTEM ONLINE</span>
      </div>
    </header>
  );
};