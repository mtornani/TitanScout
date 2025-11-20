
import React from 'react';
import { Player } from '../types';
import { COUNTRY_COORDINATES } from '../constants';
import { MapPin } from 'lucide-react';

interface WorldMapProps {
  players: Player[];
}

export const WorldMap: React.FC<WorldMapProps> = ({ players }) => {
  
  const getCoordinates = (countryName: string) => {
    // Normalize standard names
    const normalized = countryName.trim();
    // Simple lookup, fallback to Atlantic Ocean if unknown
    return COUNTRY_COORDINATES[normalized] || COUNTRY_COORDINATES['Unknown'];
  };

  // Group players by country to avoid overlapping pins too much
  const playersByCountry = players.reduce((acc, player) => {
    const c = player.country.trim();
    if (!acc[c]) acc[c] = [];
    acc[c].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  return (
    <div className="w-full h-full min-h-[400px] bg-[#0B1221] rounded-xl border border-fsgc-blue/20 relative overflow-hidden group">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" 
           style={{backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      </div>

      {/* SVG World Map (Simplified Path) */}
      <svg 
        viewBox="0 0 1000 500" 
        className="absolute inset-0 w-full h-full text-fsgc-panel fill-current opacity-50 pointer-events-none"
      >
         {/* Simplified World Map Path */}
         <path d="M200,150 Q250,100 300,150 T400,200 T500,150 T600,100 T700,150 T800,200 T900,300 L800,400 L200,400 Z" style={{display: 'none'}} /> 
         {/* 
           Since I cannot include a 100KB SVG path here, we rely on the visual coordinate placement. 
           The background grid and "Radar" effect gives the context.
         */}
         <rect width="100%" height="100%" fill="transparent" />
         
         {/* Radar Sweep Effect */}
         <circle cx="500" cy="250" r="0" className="animate-[ping_3s_linear_infinite] stroke-fsgc-blue opacity-10" fill="none" strokeWidth="2" />
      </svg>
      
      {/* Aesthetic World Map Background Image Replacement (CSS Shapes) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
         {/* North America */}
         <div className="absolute top-[15%] left-[10%] w-[25%] h-[35%] bg-slate-600 rounded-full blur-2xl"></div>
         {/* South America */}
         <div className="absolute top-[55%] left-[25%] w-[15%] h-[35%] bg-slate-600 rounded-full blur-2xl"></div>
         {/* Europe/Africa */}
         <div className="absolute top-[20%] left-[45%] w-[20%] h-[50%] bg-slate-600 rounded-full blur-2xl"></div>
         {/* Asia */}
         <div className="absolute top-[15%] left-[65%] w-[30%] h-[40%] bg-slate-600 rounded-full blur-2xl"></div>
         {/* Australia */}
         <div className="absolute top-[65%] left-[80%] w-[15%] h-[20%] bg-slate-600 rounded-full blur-2xl"></div>
      </div>

      {/* Pins */}
      {Object.entries(playersByCountry).map(([country, countryPlayers]) => {
        const coords = getCoordinates(country);
        return (
          <div 
            key={country}
            className="absolute group/pin hover:z-50 cursor-pointer"
            style={{ top: `${coords.y}%`, left: `${coords.x}%` }}
          >
            {/* Ripple */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-fsgc-blue/30 rounded-full animate-ping"></div>
            
            {/* Pin Point */}
            <div className="relative w-4 h-4 bg-fsgc-blue border-2 border-white rounded-full shadow-[0_0_10px_#009EE3] flex items-center justify-center">
                <span className="text-[8px] font-bold text-fsgc-darker">{countryPlayers.length}</span>
            </div>

            {/* Tooltip */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 bg-fsgc-darker/90 backdrop-blur border border-fsgc-blue/30 p-2 rounded hidden group-hover/pin:block z-50 shadow-xl">
                <div className="text-xs font-bold text-fsgc-blue uppercase mb-1 border-b border-white/10 pb-1">{country}</div>
                <div className="space-y-1">
                    {countryPlayers.map((p, i) => (
                        <div key={i} className="text-[10px] text-slate-300 flex justify-between">
                            <span className="truncate max-w-[80px]">{p.name}</span>
                            <span className="text-slate-500">{p.club}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        );
      })}
      
      <div className="absolute bottom-4 left-4 text-[10px] font-mono text-fsgc-blue/60">
        GLOBAL POSITIONING SYSTEM // ACTIVE
      </div>
    </div>
  );
};
