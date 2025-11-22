
import React from 'react';
import { Player } from '../types';
import { User, Calendar, MapPin, ExternalLink, CheckCircle2, Flag, Shield, FileText, Network } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  lowFx?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, lowFx = false }) => {
  const isGraph = player.discovery_method === 'GRAPH';

  return (
    <div className={`rounded-xl p-5 border bg-fsgc-panel hover:border-fsgc-blue/60 transition-all duration-300 group relative overflow-hidden shadow-lg h-full flex flex-col ${
        isGraph ? 'border-fsgc-blue/20' : 'border-yellow-500/20'
    }`}>
      
      {/* Background Glow */}
      {isGraph && <div className="absolute top-0 right-0 w-32 h-32 bg-fsgc-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>}
      {!isGraph && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>}

      {player.image_url && (
          <div className="absolute top-0 right-0 w-24 h-24 opacity-20 group-hover:opacity-40 transition-opacity">
            <img src={player.image_url} alt="Player" className="w-full h-full object-cover rounded-bl-3xl" />
          </div>
      )}

      {/* Discovery Method Badge */}
      <div className="absolute top-3 right-3 z-20">
          {isGraph ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[9px] font-mono text-green-400 uppercase tracking-wider">
                  <Network size={10} />
                  VERIFIED
              </div>
          ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-mono text-yellow-400 uppercase tracking-wider">
                  <FileText size={10} />
                  TEXT HIT
              </div>
          )}
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10 mt-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border overflow-hidden ${
              isGraph ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-500'
          }`}>
             {player.image_url ? (
                 <img src={player.image_url} className="w-full h-full object-cover" />
             ) : (
                 <User size={24} />
             )}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight tracking-tight flex items-center gap-2 pr-8">
                {player.name}
            </h3>
            <p className="text-xs text-fsgc-blue font-mono uppercase tracking-wide mt-1">{player.club}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 bg-fsgc-darker/60 p-2 rounded border border-white/5">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <div className="flex flex-col overflow-hidden">
             <span className="text-[9px] text-slate-500 uppercase tracking-wider leading-none mb-0.5">Born</span>
             <span className="text-xs text-slate-300 font-mono truncate">{player.year_born}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-fsgc-darker/60 p-2 rounded border border-white/5">
          <Shield size={14} className="text-slate-400 shrink-0" />
           <div className="flex flex-col overflow-hidden">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider leading-none mb-0.5">Position</span>
            <span className="text-xs text-slate-300 font-mono truncate" title={player.position}>{player.position || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-fsgc-darker/60 p-2 rounded border border-white/5">
          <Flag size={14} className="text-slate-400 shrink-0" />
           <div className="flex flex-col overflow-hidden">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider leading-none mb-0.5">Citizenship</span>
            <span className="text-xs text-slate-300 font-mono truncate" title={player.citizenship}>{player.citizenship || 'San Marino'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-fsgc-darker/60 p-2 rounded border border-white/5">
          <MapPin size={14} className="text-slate-400 shrink-0" />
           <div className="flex flex-col overflow-hidden">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider leading-none mb-0.5">Status</span>
            <span className="text-xs text-slate-300 font-mono truncate">{player.country}</span>
          </div>
        </div>
      </div>

      <div className={`mb-4 p-2 rounded border text-xs leading-relaxed flex-1 ${
          isGraph ? 'bg-slate-900/50 border-white/5 text-slate-400' : 'bg-yellow-900/10 border-yellow-500/10 text-yellow-200/80'
      }`}>
        {player.reasoning}
      </div>

      <div className="flex items-center justify-end border-t border-white/5 pt-3 mt-auto">
          <a 
            href={player.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-fsgc-blue hover:text-white transition-colors uppercase tracking-wider"
          >
            {isGraph ? 'Wikidata Record' : 'Wikipedia Biography'} <ExternalLink size={12} />
          </a>
      </div>
    </div>
  );
};
