import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageSquare, Calendar, ArrowRight } from 'lucide-react';
import { getAllChats } from '../api';

const GlobalSearchModal = ({ isOpen, onClose, onNavigateToChat }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadChats();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const loadChats = async () => {
    try {
      const data = await getAllChats();
      setChats(data);
    } catch (error) {
      console.error("Failed to load chats for search", error);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, chats]);

  const performSearch = () => {
    setIsLoading(true);
    const lowerQuery = query.toLowerCase();
    const searchResults = [];

    chats.forEach(chat => {
      // Search in title
      if (chat.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: 'chat',
          id: chat.id,
          title: chat.title,
          date: new Date(chat.updatedAt),
          match: 'Title match'
        });
      }

      // Search in messages
      chat.messages.forEach((msg, index) => {
        if (msg.message.toLowerCase().includes(lowerQuery)) {
          // Don't add if we already have this chat from title match (optional, but maybe good to show specific message)
          // Let's show specific message matches even if title matches
          searchResults.push({
            type: 'message',
            id: chat.id,
            title: chat.title,
            date: new Date(chat.updatedAt),
            match: msg.message,
            messageIndex: index
          });
        }
      });
    });

    // Sort by date desc
    searchResults.sort((a, b) => b.date - a.date);
    setResults(searchResults.slice(0, 20)); // Limit to 20 results
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div 
        className="bg-[#1A232E] w-full max-w-2xl rounded-xl shadow-2xl border border-gray-700 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, chats..."
            className="bg-transparent border-none outline-none text-white text-lg flex-1 placeholder-gray-500"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result, idx) => (
                <button
                  key={`${result.id}-${idx}`}
                  onClick={() => {
                    onNavigateToChat(result.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 hover:bg-gray-800 rounded-lg group transition-colors flex items-start gap-3"
                >
                  <div className="mt-1 p-2 bg-gray-800 group-hover:bg-gray-700 rounded-full text-blue-400">
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-medium text-gray-200 truncate pr-2">{result.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                        <Calendar size={10} />
                        {result.date.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 break-words">
                      {result.type === 'message' ? (
                        <span dangerouslySetInnerHTML={{
                          __html: result.match.replace(
                            new RegExp(`(${query})`, 'gi'),
                            '<span class="text-blue-400 font-bold bg-blue-400/10">$1</span>'
                          )
                        }} />
                      ) : (
                        <span className="italic text-gray-500">Chat title match</span>
                      )}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-600 group-hover:text-blue-400 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12 text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Type to search across all your chats</p>
              <div className="flex justify-center gap-2 mt-4 text-xs">
                <span className="bg-gray-800 px-2 py-1 rounded">Search titles</span>
                <span className="bg-gray-800 px-2 py-1 rounded">Search messages</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-700 bg-[#0F1419] text-xs text-gray-500 flex justify-between">
          <span>{results.length} results</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">Enter</kbd> Select</span>
            <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
