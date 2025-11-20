import React from 'react';
import { Player } from '../types';
import { User, Calendar, MapPin, ExternalLink, Briefcase } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <div className="bg-fsgc-panel/80 backdrop-blur border border-fsgc-blue/20 rounded-xl p-5 hover:border-fsgc-blue/60 hover:bg-fsgc-panel transition-all duration-300 group relative overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(0,158,227,0.15)]">
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-fsgc-blue/10 to-transparent rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:from-fsgc-blue/20" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-fsgc-panel to-fsgc-darker border border-fsgc-blue/30 flex items-center justify-center text-fsgc-blue shadow-inner">
            <User size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight tracking-tight">{player.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Briefcase size={10} className="text-slate-500" />
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">{player.club}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 bg-fsgc-darker/60 p-2 rounded border border-white/5">
          <Calendar size={14} className="text-fsgc-blue shrink-0" />
          <span className="text-xs text-slate-300 font-mono">Born: {player.year_born}</span>
        </div>
        <div className="flex items-center gap-2 bg-fsgc-darker/60 p-2 rounded border border-white/5">
          <MapPin size={14} className="text-fsgc-blue shrink-0" />
          <span className="text-xs text-slate-300 font-mono truncate" title={player.country}>{player.country}</span>
        </div>
      </div>

      <div className="mb-4 relative">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-fsgc-blue/40 rounded-full"></div>
        <div className="pl-3">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Scout Analysis</div>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
            {player.reasoning}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
           SRC: {player.found_via.split('_').map(s => s[0]).join('')}
        </span>

        {player.source_url && player.source_url !== 'N/A' ? (
          <a 
            href={player.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-fsgc-blue hover:text-white transition-colors group-hover:underline decoration-fsgc-blue/50 underline-offset-4"
          >
            Verify Source <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-xs text-slate-600 italic">Source Unavailable</span>
        )}
      </div>
    </div>
  );
};