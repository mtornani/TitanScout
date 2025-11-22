
import React, { useState } from 'react';
import { SAMMARINESE_SURNAMES } from '../constants';
import { generateIntelligenceLinks } from '../services/geminiService';
import { ExternalLink, Radar } from 'lucide-react';

export const OnomasticRadar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSurnames = SAMMARINESE_SURNAMES.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAllIntelTabs = (surname: string) => {
    const links = generateIntelligenceLinks(surname);
    window.open(links.italy, '_blank');
    window.open(links.argentina, '_blank');
    window.open(links.usa, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-wide">
          <Radar size={18} className="text-emerald-400" />
          Pipeline D: Onomastic Radar
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          Deep web manual reconnaissance based on genealogical patterns.
          Click a surname to launch multi-vector probes (Italy, Argentina, USA).
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Filter surname (e.g. Selva)..." 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-mono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto pr-1 custom-scrollbar pb-4 flex-1 min-h-0">
        {filteredSurnames.map((surname) => (
          <button
            key={surname}
            onClick={() => openAllIntelTabs(surname)}
            className="group relative flex items-center justify-between px-3 py-2.5 bg-slate-800/50 hover:bg-emerald-900/20 border border-slate-700 hover:border-emerald-500/50 rounded transition-all duration-200 text-left"
          >
            <span className="font-mono text-xs text-slate-300 group-hover:text-emerald-300 font-medium truncate">
              {surname}
            </span>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
          </button>
        ))}
      </div>
      
      <div className="mt-auto pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
        Database loaded: {SAMMARINESE_SURNAMES.length} historical families.
        <br/>
        <span className="text-emerald-500/60">Enable pop-ups for massive attack mode.</span>
      </div>
    </div>
  );
};
