
import React from 'react';
import { ShieldCheck, Database, Radio, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-fsgc-panel border-b border-fsgc-blue/20 p-4 flex flex-col md:flex-row md:items-center justify-between shadow-lg relative z-10 gap-4 md:gap-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-fsgc-blue/10 flex items-center justify-center border border-fsgc-blue text-fsgc-blue shadow-[0_0_10px_rgba(0,158,227,0.2)]">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            FSGC TITAN <span className="text-fsgc-blue px-2 py-0.5 bg-fsgc-blue/10 rounded text-sm border border-fsgc-blue/20">VERITAS</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Open Source Intelligence Grid // v14.0</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
         <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
             <Globe size={14} />
             <span>NODE: EUROPE-WEST</span>
         </div>
         <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-500/10 border border-green-500/30 text-green-400">
             <Database size={14} />
             <span>WIKIDATA: LINKED</span>
         </div>
         <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse">
             <Radio size={14} />
             <span>LIVE</span>
         </div>
      </div>
    </header>
  );
};
