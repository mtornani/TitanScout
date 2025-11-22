
import React from 'react';
import { Database, Search } from 'lucide-react';
import { DataSource } from '../types';

interface StrategySelectorProps {
  selected: DataSource;
  onSelect: (s: DataSource) => void;
  disabled: boolean;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelect(DataSource.WIKIDATA_LIVE)}
          disabled={disabled}
          className={`
            relative flex flex-col items-start p-4 rounded-lg border text-left transition-all duration-200
            ${selected === DataSource.WIKIDATA_LIVE
              ? 'bg-fsgc-blue text-white border-fsgc-blue shadow-[0_0_15px_rgba(0,158,227,0.3)]' 
              : 'bg-fsgc-darker/50 text-slate-400 border-white/10 hover:bg-fsgc-panel hover:border-white/20'
            }
          `}
        >
          <Database size={24} className="mb-2" />
          <div className="text-sm font-bold uppercase tracking-wide">Live Database</div>
          <div className="text-[10px] opacity-70">Query Wikidata Graph for verified citizens abroad.</div>
        </button>

        <button
          onClick={() => onSelect(DataSource.MANUAL_DORK)}
          className={`
            relative flex flex-col items-start p-4 rounded-lg border text-left transition-all duration-200
            ${selected === DataSource.MANUAL_DORK
              ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
              : 'bg-fsgc-darker/50 text-slate-400 border-white/10 hover:bg-fsgc-panel hover:border-white/20'
            }
          `}
        >
          <Search size={24} className="mb-2" />
          <div className="text-sm font-bold uppercase tracking-wide">Manual Recon</div>
          <div className="text-[10px] opacity-70">Generate Search Dorks for specific surname investigation.</div>
        </button>
    </div>
  );
};
