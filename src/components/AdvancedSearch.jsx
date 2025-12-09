import { Search, X, Calendar, Star, Tag } from 'lucide-react';
import { useState } from 'react';

export default function AdvancedSearch({ chats, onSelectChat, onClose }) {
  const [query, setQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterTags, setFilterTags] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Search in chat messages and title
  const filteredChats = chats.filter(chat => {
    const matchesQuery = !query || 
      chat.title.toLowerCase().includes(query.toLowerCase()) ||
      chat.messages?.some(m => m.message?.toLowerCase().includes(query.toLowerCase()));
    
    const matchesFavorites = !filterFavorites || chat.isFavorite;
    
    const matchesDate = (!dateFrom && !dateTo) || 
      (new Date(chat.updatedAt) >= (dateFrom ? new Date(dateFrom) : new Date(0)) &&
       new Date(chat.updatedAt) <= (dateTo ? new Date(dateTo) : new Date()));
    
    return matchesQuery && matchesFavorites && matchesDate;
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-[#0F1419] border border-gray-700 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Search size={20} />
            Advanced Search
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in messages..."
            className="w-full bg-[#1A232E] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                filterFavorites ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Star size={14} />
              Favorites Only
            </button>
            
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-[#1A232E] border border-gray-700 rounded-lg px-3 py-1 text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-[#1A232E] border border-gray-700 rounded-lg px-3 py-1 text-sm"
                placeholder="To"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 mb-3">
            {filteredChats.length} result{filteredChats.length !== 1 ? 's' : ''}
          </div>
          
          <div className="space-y-2">
            {filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  onClose();
                }}
                className="w-full p-3 bg-[#1A232E] hover:bg-white/10 rounded-lg text-left transition-colors"
              >
                <div className="font-medium mb-1">{chat.title}</div>
                <div className="text-xs text-gray-400">
                  {new Date(chat.updatedAt).toLocaleDateString()} • {chat.messages?.length || 0} messages
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
