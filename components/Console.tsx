
import React, { useEffect, useRef } from 'react';
import { LogMessage } from '../types';
import { Terminal } from 'lucide-react';

interface ConsoleProps {
  logs: LogMessage[];
  lowFx?: boolean;
}

export const Console: React.FC<ConsoleProps> = ({ logs, lowFx }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={`bg-black/40 border border-fsgc-blue/20 rounded-lg flex flex-col h-full overflow-hidden ${lowFx ? '' : 'backdrop-blur-sm'}`}>
      <div className="bg-fsgc-blue/5 px-3 py-2 border-b border-fsgc-blue/10 flex items-center gap-2">
        <Terminal size={14} className="text-fsgc-blue" />
        <span className="text-xs font-mono font-bold text-fsgc-blue uppercase">Live Operation Log</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 scrollbar-thin scrollbar-thumb-fsgc-blue/20 scrollbar-track-transparent">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Awaiting mission parameters...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
            <span className={`break-words ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'system' ? 'text-fsgc-blue font-bold' :
              'text-slate-300'
            }`}>
              {log.type === 'success' && '✓ '}
              {log.type === 'error' && '✗ '}
              {log.type === 'info' && 'ℹ '}
              {log.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
