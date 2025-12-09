import { Archive, ArchiveRestore, Trash2, Calendar } from 'lucide-react';

export default function ArchivePanel({ 
  archivedChats = [], 
  onUnarchive, 
  onDeletePermanently,
  onClose 
}) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A232E] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Archive size={24} className="text-gray-400" />
            <h2 className="text-xl font-bold">Archive</h2>
            <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">
              {archivedChats.length} chats
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {archivedChats.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="mx-auto mb-4 text-gray-600" size={64} />
              <p className="text-gray-400 text-lg">Archive is empty</p>
              <p className="text-gray-500 text-sm mt-2">
                Archived chats will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {archivedChats.map((chat) => (
                <div
                  key={chat.id}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium flex-1 pr-2 line-clamp-1">
                      {chat.title}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onUnarchive(chat.id)}
                        className="p-1.5 hover:bg-green-500/20 rounded transition-colors"
                        title="Unarchive"
                      >
                        <ArchiveRestore size={16} className="text-green-400" />
                      </button>
                      <button
                        onClick={() => onDeletePermanently(chat.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(chat.archivedAt || chat.timestamp)}
                    </span>
                    <span>{chat.messageCount || 0} messages</span>
                  </div>
                  
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {chat.lastMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {archivedChats.length > 0 && (
          <div className="p-4 border-t border-gray-700">
            <p className="text-sm text-gray-500">
              💡 Tip: Archived chats are hidden from the main list but can be restored anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
