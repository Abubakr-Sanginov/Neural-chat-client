import { useState } from 'react';
import { Bookmark, X, Search } from 'lucide-react';
import MessageContent from './MessageContent';

export default function BookmarksPanel({ 
  bookmarks = [], 
  onRemoveBookmark, 
  onNavigateToMessage,
  onClose 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.note?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-[#0F1419] border-l border-gray-700 z-40 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bookmark size={20} className="text-yellow-500" />
          <h3 className="font-semibold">Bookmarks</h3>
          <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">
            {bookmarks.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Search */}
      {bookmarks.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full bg-white/5 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            {bookmarks.length === 0 ? (
              <>
                <Bookmark className="mx-auto mb-4 text-gray-600" size={48} />
                <p className="text-gray-400">No bookmarks yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Bookmark important messages to find them quickly
                </p>
              </>
            ) : (
              <>
                <Search className="mx-auto mb-4 text-gray-600" size={48} />
                <p className="text-gray-400">No results found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try a different search term
                </p>
              </>
            )}
          </div>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors group cursor-pointer"
              onClick={() => onNavigateToMessage(bookmark.chatId, bookmark.messageIndex)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{bookmark.chatTitle || 'Untitled Chat'}</span>
                  <span>•</span>
                  <span>{formatDate(bookmark.timestamp)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(bookmark.id);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove bookmark"
                >
                  <X size={14} className="text-red-400" />
                </button>
              </div>

              <div className="text-sm mb-2 line-clamp-3">
                <MessageContent content={bookmark.message} />
              </div>

              {bookmark.note && (
                <div className="text-xs text-yellow-400 bg-yellow-500/10 rounded px-2 py-1 mt-2">
                  Note: {bookmark.note}
                </div>
              )}

              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                  {bookmark.sender === 'user' ? 'You' : 'AI'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {bookmarks.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            💡 Click on a bookmark to jump to the message
          </p>
        </div>
      )}
    </div>
  );
}
