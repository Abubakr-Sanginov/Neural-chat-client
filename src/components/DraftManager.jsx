import { useEffect, useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export default function DraftManager({ chatId, onRestoreDraft }) {
  const [draft, setDraft] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Load draft for current chat
    const drafts = JSON.parse(localStorage.getItem('chatDrafts') || '{}');
    if (drafts[chatId]) {
      setDraft(drafts[chatId]);
      setShowNotification(true);
    } else {
      setDraft(null);
      setShowNotification(false);
    }
  }, [chatId]);

  const saveDraft = (text, attachments = []) => {
    if (!text.trim() && attachments.length === 0) {
      deleteDraft();
      return;
    }

    const drafts = JSON.parse(localStorage.getItem('chatDrafts') || '{}');
    drafts[chatId] = {
      text,
      attachments,
      timestamp: Date.now()
    };
    localStorage.setItem('chatDrafts', JSON.stringify(drafts));
    setDraft(drafts[chatId]);
  };

  const deleteDraft = () => {
    const drafts = JSON.parse(localStorage.getItem('chatDrafts') || '{}');
    delete drafts[chatId];
    localStorage.setItem('chatDrafts', JSON.stringify(drafts));
    setDraft(null);
    setShowNotification(false);
  };

  const restoreDraft = () => {
    if (draft) {
      onRestoreDraft(draft);
      setShowNotification(false);
    }
  };

  const getTimeSince = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return {
    draft,
    saveDraft,
    deleteDraft,
    restoreDraft,
    hasDraft: !!draft,
    DraftNotification: showNotification && draft ? (
      <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
        <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Draft saved {getTimeSince(draft.timestamp)}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{draft.text}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={restoreDraft}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
          >
            Restore
          </button>
          <button
            onClick={() => setShowNotification(false)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    ) : null
  };
}

// Hook for easy integration
export function useDraftManager(chatId, onRestoreDraft) {
  return DraftManager({ chatId, onRestoreDraft });
}
