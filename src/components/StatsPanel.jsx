import { BarChart3, TrendingUp, MessageSquare, Clock, X } from 'lucide-react';

export default function StatsPanel({ stats, isOpen, onClose }) {
  if (!isOpen) return null;

  const formatNumber = (num) => {
    return num > 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };

  // Mock cost calculation (approximate pricing for Gemini Pro)
  const calculateCost = (tokens) => {
    const pricePerMillion = 0.50; // $0.50 per 1M tokens (input)
    return ((tokens / 1000000) * pricePerMillion).toFixed(4);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#1A232E] w-full max-w-2xl rounded-xl shadow-2xl border border-gray-700 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-purple-400" />
            Usage Statistics
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F1419] p-4 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Messages</p>
              <p className="text-2xl font-bold text-white">{stats.totalMessages || 0}</p>
            </div>
          </div>

          <div className="bg-[#0F1419] p-4 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Tokens</p>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.totalTokens || 0)}</p>
              <p className="text-xs text-gray-500">Est. Cost: ${calculateCost(stats.totalTokens || 0)}</p>
            </div>
          </div>

          <div className="bg-[#0F1419] p-4 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Chats</p>
              <p className="text-2xl font-bold text-white">{stats.totalChats || 0}</p>
            </div>
          </div>

          <div className="bg-[#0F1419] p-4 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-bold text-white">{stats.avgResponseTime || '0.8'}s</p>
            </div>
          </div>
        </div>

        {/* Response Time Trend */}
        <div className="p-6 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Response Time Trend</h3>
          <div className="h-24 flex items-end justify-between gap-1">
            {[2.1, 1.8, 1.5, 2.3, 1.2, 0.9, 1.1, 1.4, 1.6, 1.3].map((time, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1 group">
                <div 
                  className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm hover:from-green-500 hover:to-green-300 transition-all relative" 
                  style={{ height: `${(time / 2.5) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {time}s
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">10 msgs ago</span>
            <span className="text-xs text-gray-500">Latest</span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Weekly Activity</h3>
          <div className="h-40 flex items-end justify-between gap-2">
            {(stats.weeklyUsage && stats.weeklyUsage.length > 0) ? stats.weeklyUsage.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                <div 
                  className="w-full bg-blue-600/50 rounded-t-sm hover:bg-blue-500 transition-all relative" 
                  style={{ height: `${(day.count / Math.max(...stats.weeklyUsage.map(d => d.count))) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.count} msgs
                  </div>
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            )) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No activity data available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
