
import React from 'react';
import { SearchStrategy } from '../types';
import { Globe2, Users, GraduationCap, Database, Search, Rocket, Radar } from 'lucide-react';

interface StrategySelectorProps {
  selected: SearchStrategy;
  onSelect: (s: SearchStrategy) => void;
  disabled: boolean;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({ selected, onSelect, disabled }) => {
  
  const strategies = [
    { id: SearchStrategy.SURNAME_BASE, icon: Users, label: 'Surname Scan', desc: 'Check common San Marino surnames abroad.' },
    { id: SearchStrategy.GLOBAL_SCOUT, icon: Globe2, label: 'Global Scout', desc: 'World-wide search excluding San Marino.' },
    { id: SearchStrategy.ARGENTINA, icon: Radar, label: 'Argentina', desc: 'Deep dive into South American youth leagues.' },
    { id: SearchStrategy.USA_COLLEGE, icon: GraduationCap, label: 'USA College', desc: 'NCAA & NAIA roster analysis.' },
    { id: SearchStrategy.TRANSFERMARKT, icon: Database, label: 'Databases', desc: 'Query Citizenship fields on Transfermarkt.' },
    { id: SearchStrategy.FULL_SCAN, icon: Rocket, label: 'Full Mission', desc: 'Run ALL strategies in sequence.' },
  ];

  if (disabled) {
    const active = strategies.find(s => s.id === selected);
    return (
      <div className="bg-fsgc-blue/10 border border-fsgc-blue rounded-lg p-3 flex items-center gap-3">
         <div className="p-2 bg-fsgc-blue text-white rounded animate-pulse">
            {active && <active.icon size={18} />}
         </div>
         <div>
            <div className="text-xs text-fsgc-blue font-bold uppercase tracking-wider">Mission Active</div>
            <div className="text-sm font-bold text-white">{active?.label}</div>
         </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {strategies.map((strat) => (
        <button
          key={strat.id}
          onClick={() => onSelect(strat.id)}
          className={`
            relative flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-200
            ${selected === strat.id 
              ? 'bg-fsgc-blue text-white border-fsgc-blue shadow-[0_0_15px_rgba(0,158,227,0.3)] scale-[1.02]' 
              : 'bg-fsgc-darker/50 text-slate-400 border-white/10 hover:bg-fsgc-panel hover:border-white/20 hover:text-slate-200'
            }
          `}
        >
          <div className="mb-2">
            <strat.icon size={20} className={selected === strat.id ? 'text-white' : 'text-fsgc-blue'} />
          </div>
          <div className="text-xs font-bold uppercase tracking-wide mb-0.5">{strat.label}</div>
          <div className={`text-[10px] leading-tight ${selected === strat.id ? 'text-blue-100' : 'text-slate-500'}`}>
            {strat.desc}
          </div>
        </button>
      ))}
    </div>
  );
};
