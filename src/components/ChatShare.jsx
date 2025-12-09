import { useState } from 'react';
import { Share2, X, Copy, Check, Loader2 } from 'lucide-react';
import { getAuthHeaders } from '../api';

export default function ChatShare({ isOpen, onClose, chatId, chatTitle, chat }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');

  const generateShareLink = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3080"}/api/chats/${chatId}/share`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        setShareUrl(data.shareUrl);
      } else {
        setError(data.message || 'Failed to generate link');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#1A232E] w-full max-w-md rounded-lg shadow-2xl border border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Share2 className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold">Share Chat</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Chat: <span className="text-white">{chatTitle}</span></p>
            <p className="text-sm text-gray-400">Messages: <span className="text-white">{chat?.length || 0}</span></p>
          </div>

          {/* Share Link Generation */}
          <div>
            {!shareUrl ? (
              <button
                onClick={generateShareLink}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
                Generate Public Link
              </button>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-400">Public Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-[#0F1419] px-3 py-2 rounded border border-gray-700 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors flex items-center gap-2"
                    title="Copy link"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Anyone with this link can view this chat.
                </p>
              </div>
            )}
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
