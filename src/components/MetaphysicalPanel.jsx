import React from 'react';
import { 
  Scale, EyeOff, RefreshCw, GitBranch, Sparkles, 
  FlaskConical, History, Ghost, Triangle, Languages, 
  Gem, Maximize, Copy, Minimize, Zap, X 
} from 'lucide-react';
import { METAPHYSICAL_FUNCTIONS } from '../data/metaphysicalFunctions';

const iconMap = {
  Scale, EyeOff, RefreshCw, GitBranch, Sparkles,
  FlaskConical, History, Ghost, Triangle, Languages,
  Gem, Maximize, Copy, Minimize, Zap
};

export default function MetaphysicalPanel({ isOpen, onClose, onSelectFunction }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1419] border border-purple-500/30 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl shadow-purple-900/20 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20 flex justify-between items-center bg-gradient-to-r from-[#0F1419] to-[#1A1025]">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Метафизическое Ядро
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Функции управления реальностью и смыслом
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {METAPHYSICAL_FUNCTIONS.map((func) => {
              const Icon = iconMap[func.icon] || Sparkles;
              return (
                <button
                  key={func.id}
                  onClick={() => onSelectFunction(func)}
                  className="flex flex-col items-start p-4 rounded-xl bg-[#1A232E]/50 border border-purple-500/10 hover:border-purple-500/50 hover:bg-[#1A232E] transition-all duration-200 group text-left h-full"
                >
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/20 mb-3 transition-colors">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-200 group-hover:text-white mb-2 text-sm">
                    {func.title}
                  </h3>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 leading-relaxed">
                    {func.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-[#0F1419] text-center">
          <p className="text-xs text-purple-500/50 font-mono uppercase tracking-widest">
            Осторожно: Изменение фундаментальных констант
          </p>
        </div>
      </div>
    </div>
  );
}
