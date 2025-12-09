import { Pin, X } from 'lucide-react';

export default function PinnedMessages({ pinnedMessages, onUnpin, onNavigate }) {
  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  return (
    <div className="pinned-messages-container mb-4 p-4 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg">
      <div className="flex items-center gap-2 mb-3 text-blue-400">
        <Pin size={16} />
        <span className="text-sm font-semibold">Pinned Messages ({pinnedMessages.length})</span>
      </div>
      
      <div className="space-y-2">
        {pinnedMessages.map((pinned, index) => (
          <div
            key={index}
            className="bg-[#1A232E] bg-opacity-50 p-3 rounded-lg flex justify-between items-start gap-3 group hover:bg-opacity-70 transition-all"
          >
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold ${pinned.sender === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                  {pinned.sender === 'user' ? 'You' : 'AI'}
                </span>
                {pinned.timestamp && (
                  <span className="text-xs text-gray-500">
                    {new Date(pinned.timestamp).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-300 line-clamp-2">
                {pinned.message.substring(0, 150)}...
              </div>
            </div>
            
            <button
              onClick={() => onUnpin(pinned.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 p-1 rounded hover:bg-red-900 hover:bg-opacity-30"
              title="Unpin message"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
