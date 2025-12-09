import { Pin, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function PinnedMessagesPanel({ pinnedMessages, onUnpin, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (pinnedMessages.length === 0) return null;

  return (
    <div className="bg-blue-500/10 border-b border-blue-500/30">
      <div
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-blue-500/20 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2 text-blue-400">
          <Pin size={16} />
          <span className="text-sm font-medium">
            {pinnedMessages.length} Pinned Message{pinnedMessages.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>

      {!isCollapsed && (
        <div className="px-4 pb-3 space-y-2">
          {pinnedMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-[#1A232E] rounded-lg p-3 flex items-start gap-2 hover:bg-white/5 transition-colors"
            >
              <div className="flex-1 cursor-pointer" onClick={() => onNavigate(msg.id)}>
                <div className="text-sm line-clamp-2">{msg.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpin(msg.id);
                }}
                className="p-1 hover:bg-red-500/20 rounded text-red-400"
                title="Unpin"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for managing pinned messages
export const usePinnedMessages = (chatId) => {
  const [pinnedMessages, setPinnedMessages] = useState(() => {
    const saved = localStorage.getItem(`pinnedMessages_${chatId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const pinMessage = (message) => {
    const newPinned = [...pinnedMessages, { ...message, pinnedAt: new Date().toISOString() }];
    setPinnedMessages(newPinned);
    localStorage.setItem(`pinnedMessages_${chatId}`, JSON.stringify(newPinned));
  };

  const unpinMessage = (messageId) => {
    const newPinned = pinnedMessages.filter(m => m.id !== messageId);
    setPinnedMessages(newPinned);
    localStorage.setItem(`pinnedMessages_${chatId}`, JSON.stringify(newPinned));
  };

  const togglePin = (message) => {
    const isPinned = pinnedMessages.some(m => m.id === message.id);
    if (isPinned) {
      unpinMessage(message.id);
    } else {
      pinMessage(message);
    }
  };

  return { pinnedMessages, pinMessage, unpinMessage, togglePin };
};
