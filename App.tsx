
import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Console } from './components/Console';
import { PlayerCard } from './components/PlayerCard';
import { ChatWidget } from './components/ChatWidget';
import { WorldMap } from './components/WorldMap';
import { StrategySelector } from './components/StrategySelector';
import { TARGET_SURNAMES, DISCOVERY_QUERIES, STRATEGY_LABELS } from './constants';
import { SearchStrategy, Player, LogMessage } from './types';
import { scoutSurname } from './services/geminiService';
import { Play, Download, Activity, Square, Trash2, FileText, Map, List } from 'lucide-react';

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [strategy, setStrategy] = useState<SearchStrategy>(SearchStrategy.SURNAME_BASE);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Ref to track scanning state immediately inside loops without closure staleness
  const scanningRef = useRef(false);

  const addLog = useCallback((text: string, type: LogMessage['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      type,
      text
    }]);
  }, []);

  const stopScan = () => {
    scanningRef.current = false;
    setIsScanning(false);
    addLog('Scan aborted by user.', 'error');
  };

  const clearData = () => {
    setPlayers([]);
    setLogs([]);
    setProgress(0);
  };

  const handleScan = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    scanningRef.current = true;
    
    if (progress === 100 || progress === 0) {
      setPlayers([]);
      setLogs([]);
    }
    
    setProgress(0);
    addLog(`Initializing FSGC Titan V7...`, 'system');
    addLog(`Strategy Selected: ${STRATEGY_LABELS[strategy]}`, 'system');

    // Determine which queue to use
    let queue: string[] = [];
    if (strategy === SearchStrategy.DISCOVERY || strategy === SearchStrategy.GLOBAL_SCOUT) {
        queue = [...DISCOVERY_QUERIES];
        // For Global Scout, add generic country based queries
        if (strategy === SearchStrategy.GLOBAL_SCOUT) {
           queue.push("calciatore italiano doppia cittadinanza san marino");
           queue.push("swiss footballer san marino roots");
        }
        addLog(`Discovery Mode: ${queue.length} search vectors loaded.`, 'info');
    } else if (strategy === SearchStrategy.FULL_SCAN) {
        // In Full Scan, we do surnames + discovery
        queue = [...TARGET_SURNAMES, ...DISCOVERY_QUERIES];
        addLog(`Full Scan Mode: ${queue.length} items loaded.`, 'info');
    } else {
        queue = [...TARGET_SURNAMES];
        addLog(`Target List: ${queue.length} surnames loaded.`, 'info');
    }

    const total = queue.length;
    let processed = 0;

    // Determine strategies to run per item
    const strategiesToRun: SearchStrategy[] = [];
    if (strategy === SearchStrategy.FULL_SCAN) {
        strategiesToRun.push(SearchStrategy.SURNAME_BASE, SearchStrategy.GLOBAL_SCOUT, SearchStrategy.ARGENTINA, SearchStrategy.USA_COLLEGE);
    } else {
        strategiesToRun.push(strategy);
    }

    try {
      for (const term of queue) {
        if (!scanningRef.current) break;
        
        const isQuery = term.includes(' ');
        addLog(`Scanning: ${isQuery ? `"${term}"` : term.toUpperCase()}...`, 'info');

        for (const currentStrat of strategiesToRun) {
            if (!scanningRef.current) break;

            // If we are in full scan, but the term is a "query sentence", force DISCOVERY/GLOBAL strategy
            let actualStrat = currentStrat;
            if (strategy === SearchStrategy.FULL_SCAN) {
                if (term.includes(' ') && currentStrat === SearchStrategy.SURNAME_BASE) {
                  actualStrat = SearchStrategy.GLOBAL_SCOUT;
                }
            }

            try {
                const results = await scoutSurname(term, actualStrat);
                
                if (!scanningRef.current) break;

                if (results.length > 0) {
                    addLog(`MATCH FOUND: ${results.length} candidate(s) for ${term}`, 'success');
                    setPlayers(prev => {
                        const newPlayers = results.filter(r => 
                            !prev.some(p => p.name === r.name && p.club === r.club)
                        );
                        if (newPlayers.length === 0) return prev;
                        // Switch to map view automatically if first find
                        if (prev.length === 0) setViewMode('map');
                        return [...prev, ...newPlayers];
                    });
                }
                
                await new Promise(r => setTimeout(r, 500));

            } catch (error) {
                addLog(`Error scanning ${term}: ${(error as Error).message}`, 'error');
            }
        }
        
        processed++;
        setProgress((processed / total) * 100);
      }

      if (scanningRef.current) {
        addLog('Mission Complete. Scan finished.', 'system');
        setProgress(100);
      }
      
    } catch (e) {
      addLog(`Critical Mission Failure: ${(e as Error).message}`, 'error');
    } finally {
      setIsScanning(false);
      scanningRef.current = false;
    }
  };

  const exportCSV = () => {
    if (players.length === 0) return;
    
    const headers = ['Name', 'Club', 'Year', 'Country', 'Found Via', 'Source', 'Reasoning'];
    const csvContent = [
      headers.join(','),
      ...players.map(p => [
        `"${p.name}"`,
        `"${p.club}"`,
        `"${p.year_born}"`,
        `"${p.country}"`,
        `"${p.found_via}"`,
        `"${p.source_url}"`,
        `"${p.reasoning.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FSGC_Scout_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    if (players.length === 0) return;

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        alert('Please allow popups to generate the report.');
        return;
    }

    const dateStr = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FSGC Dossier Scouting</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; max-width: 1000px; margin: 0 auto; background: white; }
          .header-logo { display: flex; align-items: center; gap: 15px; border-bottom: 3px solid #009EE3; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-circle { width: 50px; height: 50px; background: #009EE3; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; }
          h1 { margin: 0; font-size: 28px; color: #0F172A; letter-spacing: -0.5px; }
          .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
          
          .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;}
          .stat { text-align: center; min-width: 100px;}
          .stat-val { display: block; font-size: 24px; font-weight: bold; color: #009EE3; }
          .stat-lbl { font-size: 12px; color: #64748b; text-transform: uppercase; }

          .player-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
          .player-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; page-break-inside: avoid; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .player-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
          .player-name { font-size: 18px; font-weight: 700; color: #0F172A; }
          .player-club { font-size: 14px; color: #475569; font-weight: 600; display: flex; align-items: center; gap: 6px; }
          
          .tags { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
          .tag { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #e0f2fe; color: #0284c7; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
          
          .analysis { font-size: 14px; line-height: 1.6; color: #334155; background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #009EE3; }
          
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header-logo">
           <div class="logo-circle">S</div>
           <div>
             <h1>FSGC Dossier Scouting</h1>
             <div class="subtitle">Report Ufficiale Prospetti Oriundi</div>
           </div>
        </div>

        <div class="summary-box">
          <div class="stat">
            <span class="stat-val">${players.length}</span>
            <span class="stat-lbl">Candidati Identificati</span>
          </div>
          <div class="stat">
            <span class="stat-val">${dateStr}</span>
            <span class="stat-lbl">Data Generazione</span>
          </div>
          <div class="stat">
            <span class="stat-val">AI-V7</span>
            <span class="stat-lbl">Titan System</span>
          </div>
        </div>

        <div class="player-grid">
          ${players.map(p => `
            <div class="player-card">
              <div class="player-header">
                <div>
                  <div class="player-name">${p.name}</div>
                  <div class="player-club">
                    <span>⚽ ${p.club}</span>
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:12px; color:#64748b;">ANNO</div>
                  <div style="font-weight:bold;">${p.year_born}</div>
                </div>
              </div>
              
              <div class="tags">
                <span class="tag">📍 ${p.country}</span>
                <span class="tag">🔍 ${p.found_via}</span>
              </div>

              <div class="analysis">
                <strong>Scout Notes:</strong><br/>
                ${p.reasoning}
              </div>
              
              <div style="margin-top:10px; font-size:11px;">
                <a href="${p.source_url}" target="_blank" style="color:#009EE3; text-decoration:none;">🔗 Fonte Verifica</a>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          Generato automaticamente da FSGC Titan AI Scout V7. Documento ad uso interno federale.
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-fsgc-darker flex flex-col font-sans text-slate-200 overflow-x-hidden">
      <Header />

      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1800px] mx-auto w-full">
        
        {/* LEFT PANEL: CONTROLS & LOGS */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-auto lg:h-[calc(100vh-100px)] lg:sticky lg:top-[80px]">
          
          {/* Controls */}
          <div className="bg-fsgc-panel border border-fsgc-blue/20 rounded-xl p-5 shadow-lg shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Activity size={18} className="text-fsgc-blue" />
                Mission Control
              </h2>
              {players.length > 0 && !isScanning && (
                <button onClick={clearData} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <Trash2 size={12} /> CLEAR
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-wider">
                  Select Scan Protocol
                </label>
                <StrategySelector 
                  selected={strategy} 
                  onSelect={setStrategy} 
                  disabled={isScanning} 
                />
              </div>

              <div className="flex gap-3 pt-2">
                {!isScanning ? (
                  <button
                    onClick={handleScan}
                    className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded bg-fsgc-blue hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(0,158,227,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Play size={16} fill="currentColor" /> LAUNCH SCAN
                  </button>
                ) : (
                  <button
                    onClick={stopScan}
                    className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 transition-all animate-pulse"
                  >
                    <Square size={16} fill="currentColor" /> ABORT
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`mt-6 transition-opacity duration-300 ${isScanning || progress > 0 ? 'opacity-100' : 'opacity-0'}`}>
               <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
                 <span>Sector Scan Progress</span>
                 <span>{Math.round(progress)}%</span>
               </div>
               <div className="h-2 bg-fsgc-darker rounded-full overflow-hidden border border-fsgc-blue/10">
                 <div 
                   className="h-full bg-gradient-to-r from-fsgc-blue to-blue-400 transition-all duration-300 ease-out shadow-[0_0_10px_#009EE3]"
                   style={{ width: `${progress}%` }}
                 />
               </div>
            </div>
          </div>

          {/* Terminal Log */}
          <div className="h-64 lg:flex-1 lg:min-h-0 overflow-hidden flex flex-col">
            <Console logs={logs} />
          </div>
        </div>

        {/* RIGHT PANEL: RESULTS */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 pb-20 lg:pb-0">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-800 pb-4 shrink-0 gap-4 sm:gap-0">
             <div>
               <h2 className="text-2xl font-bold text-white tracking-tight">Candidate Database</h2>
               <p className="text-sm text-slate-400 font-mono mt-1">
                 Identified {players.length} potential oriundi eligible for FSGC selection.
               </p>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* View Toggle */}
                <div className="bg-fsgc-panel rounded-lg p-1 border border-fsgc-blue/20 flex shrink-0">
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-fsgc-blue text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <List size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('map')} 
                        className={`p-2 rounded ${viewMode === 'map' ? 'bg-fsgc-blue text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Map size={16} />
                    </button>
                </div>

                <button 
                  onClick={generateReport}
                  disabled={players.length === 0}
                  className="justify-center text-xs font-mono font-bold flex items-center gap-2 text-white bg-fsgc-blue border border-fsgc-blue hover:bg-blue-500 px-4 py-2 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(0,158,227,0.2)]"
                >
                  <FileText size={14} />
                  REPORT
                </button>
                <button 
                  onClick={exportCSV}
                  disabled={players.length === 0}
                  className="justify-center text-xs font-mono font-bold flex items-center gap-2 text-fsgc-blue border border-fsgc-blue/30 bg-fsgc-blue/5 px-4 py-2 rounded hover:bg-fsgc-blue/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-fsgc-blue"
                >
                  <Download size={14} />
                  CSV
                </button>
             </div>
           </div>

           <div className="flex-1 min-h-[300px] lg:overflow-y-auto lg:pr-2 lg:pb-10 scrollbar-thin scrollbar-thumb-fsgc-blue/20 scrollbar-track-transparent relative">
             {players.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800/50 rounded-xl bg-slate-900/20 py-20 lg:py-0">
                 <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 animate-pulse">
                   <Activity size={40} className="text-slate-700" />
                 </div>
                 <p className="font-mono text-sm text-slate-500">DATABASE EMPTY</p>
                 <p className="text-xs text-slate-600 mt-2 max-w-xs text-center">Initiate a scan sequence via Mission Control to populate the database.</p>
               </div>
             ) : (
                <>
                    {viewMode === 'list' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {players.map((player, idx) => (
                            <PlayerCard key={`${player.name}-${idx}`} player={player} />
                        ))}
                        </div>
                    ) : (
                        <WorldMap players={players} />
                    )}
                </>
             )}
           </div>
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}
