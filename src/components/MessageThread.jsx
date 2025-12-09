import { useState } from 'react';
import { MessageCircle, X, CornerDownRight } from 'lucide-react';
import MessageContent from './MessageContent';

export default function MessageThread({ 
  message, 
  replies = [], 
  onReply, 
  onCloseThread 
}) {
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleSendReply = () => {
    if (replyText.trim()) {
      onReply(message.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-[#0F1419] border-l border-gray-700 z-40 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-400" />
          <h3 className="font-semibold">Thread</h3>
        </div>
        <button
          onClick={onCloseThread}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Original Message */}
      <div className="p-4 bg-blue-500/10 border-b border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Original Message</div>
        <div className="text-sm">
          <MessageContent content={message.message} />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {replies.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <CornerDownRight className="mx-auto mb-2" size={32} />
            <p>No replies yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          replies.map((reply, idx) => (
            <div key={idx} className="flex gap-2">
              <CornerDownRight size={16} className="text-gray-600 mt-1 flex-shrink-0" />
              <div className="flex-1 bg-white/5 rounded-lg p-3">
                <div className="text-sm mb-1">
                  <MessageContent content={reply.message} />
                </div>
                <div className="text-xs text-gray-500">
                  {reply.sender} • {new Date(reply.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Input */}
      <div className="p-4 border-t border-gray-700">
        {showReplyInput ? (
          <div className="space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-white/5 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyText('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Reply
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowReplyInput(true)}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Reply to thread
          </button>
        )}
      </div>
    </div>
  );
}
