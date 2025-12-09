import { useState, useEffect } from 'react';
import { Columns, X, Trophy, Zap, Loader2, Users } from 'lucide-react';
import ChatBody from './ChatBody';
import { fetchStreamResponse } from '../api';
import MessageContent from './MessageContent';

const MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", emoji: "⚡" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", emoji: "🧠" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", emoji: "💨" },
];

export default function UnifiedComparison({ 
  // For Compare Mode (existing chats)
  chat1, 
  chat2, 
  chat1Title, 
  chat2Title,
  // For Battle Mode (AI contest)
  systemInstruction,
  modelSettings,
  // Common
  isOpen, 
  onClose,
  initialMode = 'compare' // 'compare' or 'battle'
}) {
  // Mode switching
  const [mode, setMode] = useState(initialMode);
  
  // Compare Mode state
  const [syncScroll, setSyncScroll] = useState(true);
  const [scrollLeft, setScrollLeft] = useState(null);
  const [scrollRight, setScrollRight] = useState(null);
  
  // Battle Mode state
  const [model1, setModel1] = useState(MODELS[0].id);
  const [model2, setModel2] = useState(MODELS[1].id);
  const [question, setQuestion] = useState('');
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Sync scroll for compare mode
  const handleScrollLeft = (e) => {
    if (syncScroll && scrollRight) {
      const scrollPercentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
      scrollRight.scrollTop = scrollPercentage * (scrollRight.scrollHeight - scrollRight.clientHeight);
    }
  };

  const handleScrollRight = (e) => {
    if (syncScroll && scrollLeft) {
      const scrollPercentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
      scrollLeft.scrollTop = scrollPercentage * (scrollLeft.scrollHeight - scrollLeft.clientHeight);
    }
  };

  // Battle mode functions
  const startBattle = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setResponse1('');
    setResponse2('');
    setWinner(null);
    setShowResults(false);

    const promises = [
      fetchStreamResponse(
        [{ sender: 'user', message: question }],
        model1,
        systemInstruction,
        modelSettings,
        (chunk) => setResponse1(prev => prev + (typeof chunk === 'string' ? chunk : JSON.stringify(chunk)))
      ),
      fetchStreamResponse(
        [{ sender: 'user', message: question }],
        model2,
        systemInstruction,
        modelSettings,
        (chunk) => setResponse2(prev => prev + (typeof chunk === 'string' ? chunk : JSON.stringify(chunk)))
      )
    ];

    try {
      await Promise.all(promises);
      setShowResults(true);
    } catch (error) {
      console.error('Battle error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectWinner = (modelId) => {
    setWinner(modelId);
    const battleResult = {
      date: new Date().toISOString(),
      question,
      winner: modelId,
      model1,
      model2,
    };
    
    const battles = JSON.parse(localStorage.getItem('aiBattles') || '[]');
    battles.push(battleResult);
    localStorage.setItem('aiBattles', JSON.stringify(battles));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A232E] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#0F1419]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {mode === 'compare' ? <Columns size={24} /> : <Trophy size={24} className="text-yellow-500" />}
            <h2 className="text-xl font-bold">
              {mode === 'compare' ? 'Chat Comparison' : 'AI Battle Arena'}
            </h2>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex gap-2 bg-[#1A232E] rounded-lg p-1">
            <button
              onClick={() => setMode('compare')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                mode === 'compare' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={16} />
              Compare Chats
            </button>
            <button
              onClick={() => setMode('battle')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                mode === 'battle' 
                  ? 'bg-yellow-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy size={16} />
              AI Battle
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {mode === 'compare' && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Sync Scroll</span>
            </label>
          )}
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* COMPARE MODE */}
      {mode === 'compare' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Chat */}
          <div className="flex-1 flex flex-col border-r border-gray-700">
            <div className="bg-[#0F1419] px-4 py-3 border-b border-gray-700">
              <h3 className="font-semibold text-blue-400">{chat1Title || 'Chat 1'}</h3>
              <p className="text-xs text-gray-500">{chat1?.length || 0} messages</p>
            </div>
            <div
              ref={setScrollLeft}
              onScroll={handleScrollLeft}
              className="flex-1 overflow-y-auto p-4 custom-scrollbar"
            >
              {chat1 && chat1.length > 0 ? (
                <ChatBody chat={chat1} onEditMessage={() => {}} onDeleteMessage={() => {}} readOnly />
              ) : (
                <div className="text-center text-gray-500 mt-8">No messages</div>
              )}
            </div>
          </div>

          {/* Right Chat */}
          <div className="flex-1 flex flex-col">
            <div className="bg-[#0F1419] px-4 py-3 border-b border-gray-700">
              <h3 className="font-semibold text-green-400">{chat2Title || 'Chat 2'}</h3>
              <p className="text-xs text-gray-500">{chat2?.length || 0} messages</p>
            </div>
            <div
              ref={setScrollRight}
              onScroll={handleScrollRight}
              className="flex-1 overflow-y-auto p-4 custom-scrollbar"
            >
              {chat2 && chat2.length > 0 ? (
                <ChatBody chat={chat2} onEditMessage={() => {}} onDeleteMessage={() => {}} readOnly />
              ) : (
                <div className="text-center text-gray-500 mt-8">No messages</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BATTLE MODE */}
      {mode === 'battle' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Model Selection */}
          <div className="p-4 border-b border-gray-700 grid grid-cols-2 gap-4 bg-[#0F1419]">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Model 1</label>
              <select
                value={model1}
                onChange={(e) => setModel1(e.target.value)}
                className="w-full bg-[#1A232E] border border-gray-700 rounded-lg px-4 py-2"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Model 2</label>
              <select
                value={model2}
                onChange={(e) => setModel2(e.target.value)}
                className="w-full bg-[#1A232E] border border-gray-700 rounded-lg px-4 py-2"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Input */}
          <div className="p-4 border-b border-gray-700 bg-[#0F1419]">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && startBattle()}
                placeholder="Ask a question for both models to answer..."
                className="flex-1 bg-[#1A232E] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={startBattle}
                disabled={loading || !question.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Fighting...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Start Battle
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Battle Arena - Split Screen */}
          <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
            {/* Model 1 Response */}
            <div className="flex flex-col bg-[#0F1419] rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{MODELS.find(m => m.id === model1)?.name}</span>
                </div>
                {showResults && (
                  <button
                    onClick={() => selectWinner(model1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      winner === model1
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {winner === model1 ? '🏆 Winner!' : 'Pick Winner'}
                  </button>
                )}
              </div>
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-0">
                {response1 ? (
                  <MessageContent message={response1} />
                ) : (
                  <div className="text-gray-400">{loading ? 'Generating response...' : 'Waiting for battle...'}</div>
                )}
              </div>
            </div>

            {/* Model 2 Response */}
            <div className="flex flex-col bg-[#0F1419] rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{MODELS.find(m => m.id === model2)?.name}</span>
                </div>
                {showResults && (
                  <button
                    onClick={() => selectWinner(model2)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      winner === model2
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {winner === model2 ? '🏆 Winner!' : 'Pick Winner'}
                  </button>
                )}
              </div>
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-0">
                {response2 ? (
                  <MessageContent message={response2} />
                ) : (
                  <div className="text-gray-400">{loading ? 'Generating response...' : 'Waiting for battle...'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Winner Announcement */}
          {winner && (
            <div className="p-4 bg-green-500/20 border-t border-green-500/30 text-center">
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-lg">
                <Trophy size={24} />
                {MODELS.find(m => m.id === winner)?.name} wins this battle!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
