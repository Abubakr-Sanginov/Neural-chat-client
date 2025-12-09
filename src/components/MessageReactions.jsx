import { useState } from 'react';
import { Smile } from 'lucide-react';

const REACTIONS = ['👍', '❤️', '😂', '🎉', '🤔', '👏', '🔥', '💯'];

export default function MessageReactions({ messageId, reactions = {}, onReact }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = (emoji) => {
    onReact(messageId, emoji);
    setShowPicker(false);
  };

  // Get unique reactions with counts
  const reactionCounts = Object.entries(reactions).reduce((acc, [userId, emoji]) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative inline-block">
      {/* Existing Reactions */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className="flex gap-1 mb-1">
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-full text-xs flex items-center gap-1 transition-colors"
            >
              <span>{emoji}</span>
              {count > 1 && <span className="text-gray-400">{count}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Reaction Picker */}
      <div className="relative inline-block">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
          title="Add reaction"
        >
          <Smile size={16} />
        </button>

        {showPicker && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
            />

            {/* Emoji Picker */}
            <div className="absolute bottom-full left-0 mb-2 bg-[#1A232E] border border-gray-700 rounded-lg p-2 shadow-xl z-50 flex gap-1">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-2 hover:bg-white/10 rounded text-xl transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
