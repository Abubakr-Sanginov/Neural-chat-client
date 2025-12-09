import { useState } from 'react';
import { X, Trophy, Zap, Send, Loader2 } from 'lucide-react';
import { fetchStreamResponse } from '../api';

const MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", emoji: "⚡" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", emoji: "🧠" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", emoji: "💨" },
];

export default function AIBattleArena({ onClose, systemInstruction, modelSettings }) {
  const [model1, setModel1] = useState(MODELS[0].id);
  const [model2, setModel2] = useState(MODELS[1].id);
  const [question, setQuestion] = useState('');
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const startBattle = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setResponse1('');
    setResponse2('');
    setWinner(null);
    setShowResults(false);

    // Fetch responses from both models simultaneously
    const promises = [
      fetchStreamResponse(
        [{ sender: 'user', message: question }],
        model1,
        systemInstruction,
        modelSettings,
        (chunk) => setResponse1(prev => prev + chunk)
      ),
      fetchStreamResponse(
        [{ sender: 'user', message: question }],
        model2,
        systemInstruction,
        modelSettings,
        (chunk) => setResponse2(prev => prev + chunk)
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
    // Save battle result to stats
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

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-[#0F1419] border border-gray-700 rounded-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" size={28} />
            <div>
              <h2 className="text-2xl font-bold">AI Battle Arena</h2>
              <p className="text-sm text-gray-400">Two models, one question. You decide the winner.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Model Selection */}
        <div className="p-6 border-b border-gray-700 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Model 1</label>
            <select
              value={model1}
              onChange={(e) => setModel1(e.target.value)}
              className="w-full bg-[#1A232E] border border-gray-700 rounded-lg px-4 py-2"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
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
                <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Input */}
        <div className="p-6 border-b border-gray-700">
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
        <div className="flex-1 grid grid-cols-2 gap-4 p-6 overflow-hidden">
          {/* Model 1 Response */}
          <div className="flex flex-col bg-[#1A232E] rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MODELS.find(m => m.id === model1)?.emoji}</span>
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
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {response1 || (loading ? 'Generating response...' : 'Waiting for battle...')}
            </div>
          </div>

          {/* Model 2 Response */}
          <div className="flex flex-col bg-[#1A232E] rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{MODELS.find(m => m.id === model2)?.emoji}</span>
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
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {response2 || (loading ? 'Generating response...' : 'Waiting for battle...')}
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div className="p-4 bg-green-500/20 border-t border-green-500/30 text-center">
            <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-lg">
              <Trophy size={24} />
              {MODELS.find(m => m.id === winner)?.emoji} {MODELS.find(m => m.id === winner)?.name} wins this battle!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
