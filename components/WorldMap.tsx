
import React, { useState } from 'react';
import { Player } from '../types';
import { COUNTRY_COORDINATES } from '../constants';
import { X } from 'lucide-react';

interface WorldMapProps {
  players: Player[];
  lowFx: boolean;
}

export const WorldMap: React.FC<WorldMapProps> = ({ players, lowFx }) => {
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  
  const getCoordinates = (countryName: string) => {
    const normalized = countryName.trim();
    return COUNTRY_COORDINATES[normalized] || COUNTRY_COORDINATES['Unknown'];
  };

  const playersByCountry = players.reduce((acc, player) => {
    const c = player.country.trim();
    if (!acc[c]) acc[c] = [];
    acc[c].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  const handlePinClick = (e: React.MouseEvent, country: string) => {
    e.stopPropagation();
    if (activeCountry === country) {
      setActiveCountry(null);
    } else {
      setActiveCountry(country);
    }
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-[#0B1221] rounded-xl border border-fsgc-blue/20 relative flex flex-col overflow-hidden group" onClick={() => setActiveCountry(null)}>
      
      {/* Mobile Swipe Hint - Hide on Low FX to save paint */}
      <div className="absolute top-4 right-4 z-20 lg:hidden pointer-events-none opacity-50">
        <span className="text-[10px] bg-fsgc-darker/80 text-slate-400 px-2 py-1 rounded border border-white/10">
          ↔ Swipe / Tap Pins
        </span>
      </div>

      {/* Scrollable Container for Mobile */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative no-scrollbar touch-pan-x">
        {/* Inner constrained width container */}
        <div className="min-w-[800px] h-full relative">
            
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20" 
                style={{backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
            </div>

            {/* Aesthetic CSS World Shapes - DISABLED IN LOW FX */}
            {!lowFx && (
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <div className="absolute top-[15%] left-[10%] w-[25%] h-[35%] bg-slate-600 rounded-full blur-3xl"></div>
                    <div className="absolute top-[55%] left-[25%] w-[15%] h-[35%] bg-slate-600 rounded-full blur-3xl"></div>
                    <div className="absolute top-[20%] left-[45%] w-[20%] h-[50%] bg-slate-600 rounded-full blur-3xl"></div>
                    <div className="absolute top-[15%] left-[65%] w-[30%] h-[40%] bg-slate-600 rounded-full blur-3xl"></div>
                    <div className="absolute top-[65%] left-[80%] w-[15%] h-[20%] bg-slate-600 rounded-full blur-3xl"></div>
                </div>
            )}
            
            {/* Radar Sweep Effect - DISABLED IN LOW FX */}
            {!lowFx && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="w-[600px] h-[600px] rounded-full border border-fsgc-blue/5 animate-[ping_4s_linear_infinite]"></div>
                </div>
            )}

            {/* Pins */}
            {(Object.entries(playersByCountry) as [string, Player[]][]).map(([country, countryPlayers]) => {
                const coords = getCoordinates(country);
                const isActive = activeCountry === country;

                return (
                <div 
                    key={country}
                    className={`absolute transition-all duration-300 cursor-pointer ${isActive ? 'z-50 scale-110' : 'z-10 hover:z-40 hover:scale-110'}`}
                    style={{ top: `${coords.y}%`, left: `${coords.x}%` }}
                    onClick={(e) => handlePinClick(e, country)}
                >
                    {/* Ripple - Remove animations in Low FX */}
                    <div className={`absolute -top-2 -left-2 w-8 h-8 bg-fsgc-blue/30 rounded-full ${!lowFx && (isActive ? 'animate-pulse' : 'animate-ping')}`}></div>
                    
                    {/* Pin Point */}
                    <div className={`relative w-4 h-4 border-2 rounded-full ${lowFx ? '' : 'shadow-[0_0_10px_#009EE3]'} flex items-center justify-center transition-colors ${isActive ? 'bg-white border-fsgc-blue' : 'bg-fsgc-blue border-white'}`}>
                        <span className={`text-[8px] font-bold ${isActive ? 'text-fsgc-blue' : 'text-fsgc-darker'}`}>{countryPlayers.length}</span>
                    </div>

                    {/* Tooltip */}
                    <div className={`
                        absolute top-6 left-1/2 -translate-x-1/2 w-56 
                        bg-fsgc-darker/95 border border-fsgc-blue/40 
                        p-3 rounded-lg 
                        transition-all duration-200 origin-top
                        ${!lowFx ? 'backdrop-blur-md shadow-2xl' : ''}
                        ${isActive ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible lg:group-hover:opacity-100 lg:group-hover:scale-100 lg:group-hover:visible'}
                    `}>
                        <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                            <span className="text-xs font-bold text-fsgc-blue uppercase tracking-wider">{country}</span>
                            {isActive && (
                                <button onClick={(e) => { e.stopPropagation(); setActiveCountry(null); }} className="text-slate-500 hover:text-white">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/20">
                            {countryPlayers.map((p, i) => (
                                <div key={i} className="text-xs group/item">
                                    <div className="font-bold text-slate-200 truncate">{p.name}</div>
                                    <div className="text-[10px] text-slate-400 flex justify-between items-center">
                                        <span>{p.club}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                );
            })}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 text-[10px] font-mono text-fsgc-blue/60 pointer-events-none">
        GPS TRACKING // ACTIVE // {Object.keys(playersByCountry).length} REGIONS
      </div>
    </div>
  );
};
