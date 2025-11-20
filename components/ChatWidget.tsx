import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'model', 
      text: 'Welcome, Scout. I am the FSGC Titan AI. I can assist you with player verification, eligibility rules, or general football data analysis. How can I help?' 
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getChatResponse(userText);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: "System Error: Unable to reach Titan Mainframe." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_20px_rgba(0,158,227,0.3)] bg-fsgc-blue text-white transition-all duration-300 hover:scale-110 hover:bg-blue-500"
      >
        <Sparkles size={24} className="group-hover:animate-pulse" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-fsgc-darker"></div>
      </button>
    );
  }

  return (
    <div className={`fixed z-50 flex flex-col bg-fsgc-panel border border-fsgc-blue/30 shadow-2xl overflow-hidden transition-all duration-300 
      ${isExpanded 
        ? 'w-screen h-screen top-0 left-0 rounded-none' 
        : 'bottom-0 left-0 w-full h-full sm:bottom-6 sm:left-auto sm:right-6 sm:w-80 sm:h-[500px] sm:rounded-xl'
      }
      ${!isExpanded && 'sm:w-96'}
    `}>
      
      {/* Header */}
      <div className="bg-fsgc-darker p-3 border-b border-fsgc-blue/20 flex justify-between items-center shrink-0 cursor-pointer" onClick={() => !isExpanded && setIsExpanded(true)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-fsgc-blue/20 flex items-center justify-center border border-fsgc-blue/50 text-fsgc-blue">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-none">Titan AI Assistant</h3>
            <div className="flex items-center gap-1 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-[10px] text-slate-400 font-mono">ONLINE - GEMINI PRO 3</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
            <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                className="hidden sm:block p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
            >
                <X size={16} />
            </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/80 to-fsgc-darker/90 backdrop-blur scrollbar-thin scrollbar-thumb-fsgc-blue/20 scrollbar-track-transparent">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-md ${
              m.role === 'user' 
                ? 'bg-fsgc-blue text-white rounded-br-sm' 
                : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-bl-sm backdrop-blur-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-bl-sm p-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-fsgc-blue" />
              <span className="text-xs text-slate-400 font-mono animate-pulse">Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-fsgc-darker border-t border-fsgc-blue/20 shrink-0">
        <div className="relative flex items-center">
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about player stats, eligibility..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-fsgc-blue focus:ring-1 focus:ring-fsgc-blue/50 transition-all shadow-inner placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-1.5 bg-fsgc-blue text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-fsgc-blue transition-colors shadow-lg"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-[10px] text-slate-600 text-center mt-2 font-mono">
            Powered by Gemini 3 Pro Preview
        </div>
      </div>
    </div>
  );
};