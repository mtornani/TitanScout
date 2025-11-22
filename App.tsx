
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Console } from './components/Console';
import { PlayerCard } from './components/PlayerCard';
import { WorldMap } from './components/WorldMap';
import { StrategySelector } from './components/StrategySelector';
import { OnomasticRadar } from './components/OnomasticRadar';
import { fetchIntelligence } from './services/geminiService';
import { Player, LogMessage, DataSource } from './types';
import { Play, AlertOctagon, List, Map as MapIcon, RefreshCcw, Activity } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<DataSource>(DataSource.WIKIDATA_LIVE);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const addLog = (text: string, type: LogMessage['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      type,
      text
    }]);
  };

  const handleLiveQuery = async () => {
    setLoading(true);
    setPlayers([]);
    setLogs([]);
    addLog("Initiating HYBRID OSINT Protocol (Graph + Text)...", "system");
    
    const result = await fetchIntelligence();
    
    result.log.forEach(l => {
        const type = l.includes("ERROR") ? "error" : l.includes("Valid") || l.includes("Complete") ? "success" : "info";
        addLog(l, type);
    });

    if (result.players.length > 0) {
        setPlayers(result.players);
        addLog(`Intelligence Sync Complete. ${result.players.length} records loaded.`, "success");
    } else {
        addLog("No records found matching strict criteria.", "error");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setPlayers([]);
    setLogs([]);
    setLoading(false);
    addLog("Dashboard successfully reset. Ready for new operation.", "system");
  };

  return (
    <div className="min-h-[100dvh] bg-fsgc-darker flex flex-col font-sans text-slate-200 overflow-x-hidden">
      <Header />

      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1800px] mx-auto w-full">
        
        {/* LEFT PANEL: COMMAND CENTER */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-auto lg:h-[calc(100vh-100px)] lg:sticky lg:top-[80px]">
          
          <div className="flex items-center gap-2 mb-2 px-1">
             <Activity size={16} className="text-fsgc-blue animate-pulse" />
             <h3 className="text-fsgc-blue font-mono text-xs font-bold uppercase tracking-widest">Command Center</h3>
          </div>

          {/* Mode Selector */}
          <div className="bg-fsgc-panel border border-fsgc-blue/20 shadow-lg rounded-xl p-5 shrink-0">
            <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm text-slate-400">Operation Mode</h2>
            <StrategySelector selected={mode} onSelect={setMode} disabled={loading} />
          </div>

          {/* Active Operation Panel */}
          <div className="bg-fsgc-panel border border-fsgc-blue/20 shadow-lg rounded-xl p-5 shrink-0 flex-1 flex flex-col min-h-[400px]">
             {mode === DataSource.WIKIDATA_LIVE ? (
                 <div className="flex flex-col h-full">
                     <div className="mb-4">
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <List size={18} className="text-fsgc-blue" />
                            Hybrid Intelligence Query
                        </h2>
                        <p className="text-xs text-slate-400 mt-2">
                            Executes a dual-pipeline scan: 
                            <br/>1. <strong>Graph Scan (Wikidata)</strong> for verified data.
                            <br/>2. <strong>Text Scan (Wikipedia)</strong> for hidden ancestry keywords.
                        </p>
                     </div>
                     <button 
                        onClick={handleLiveQuery} 
                        disabled={loading}
                        className="w-full mt-auto flex items-center justify-center gap-2 font-bold py-4 rounded bg-fsgc-blue hover:bg-blue-500 text-white transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(0,158,227,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {loading ? "SCANNING..." : "EXECUTE HYBRID SCAN"} <Play size={16} fill="currentColor" />
                     </button>
                 </div>
             ) : (
                 <OnomasticRadar />
             )}
          </div>

          {/* Console */}
          <div className="h-48 lg:flex-1 lg:min-h-0 overflow-hidden flex flex-col">
            <Console logs={logs} />
          </div>
        </div>

        {/* RIGHT PANEL: INTELLIGENCE GRID */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 pb-20 lg:pb-0">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-800 pb-4 shrink-0 gap-4 sm:gap-0">
             <div>
               <h2 className="text-2xl font-bold text-white tracking-tight">Veritas Database</h2>
               <p className="text-sm text-slate-400 font-mono mt-1">
                   {players.length > 0 ? `Loaded ${players.length} verified profiles.` : 'Waiting for query execution...'}
               </p>
             </div>
             
             <div className="flex gap-2">
                <button 
                  onClick={handleReset}
                  className="bg-fsgc-panel hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-fsgc-blue/20 rounded-lg p-2 transition-all"
                  title="Reset Dashboard"
                >
                  <RefreshCcw size={16} />
                </button>
                <div className="bg-fsgc-panel rounded-lg p-1 border border-fsgc-blue/20 flex shrink-0">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-fsgc-blue text-white' : 'text-slate-400 hover:text-white'}`}><List size={16} /></button>
                    <button onClick={() => setViewMode('map')} className={`p-2 rounded ${viewMode === 'map' ? 'bg-fsgc-blue text-white' : 'text-slate-400 hover:text-white'}`}><MapIcon size={16} /></button>
                </div>
             </div>
           </div>

           <div className="flex-1 min-h-[300px] lg:overflow-y-auto lg:pr-2 lg:pb-10 scrollbar-thin scrollbar-thumb-fsgc-blue/20 scrollbar-track-transparent relative">
             {players.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800/50 rounded-xl bg-slate-900/20 py-20 lg:py-0">
                 <AlertOctagon size={40} className="text-slate-700 mb-6" />
                 <p className="font-mono text-sm text-slate-500">NO DATA LOADED</p>
                 <p className="text-xs text-slate-600 mt-2">Select 'Hybrid Scan' or 'Manual Recon' to begin intelligence operations.</p>
               </div>
             ) : (
                <>
                    {viewMode === 'list' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {players.map((player, idx) => (
                            <PlayerCard key={`${player.id}-${idx}`} player={player} />
                        ))}
                        </div>
                    ) : (
                        <WorldMap players={players} lowFx={false} />
                    )}
                </>
             )}
           </div>
        </div>
      </main>
      
      {/* Footer Status Bar */}
      <div className="fixed bottom-0 w-full bg-fsgc-darker border-t border-white/5 p-1 px-4 text-[10px] font-mono text-slate-500 flex justify-between z-50">
        <span>FSGC TITAN SYSTEM // VERITAS OSINT</span>
        <span className="text-green-500">STATUS: ONLINE</span>
      </div>
    </div>
  );
}
