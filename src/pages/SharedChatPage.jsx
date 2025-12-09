import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Calendar, User, ArrowLeft, Loader2 } from 'lucide-react';
import MessageContent from '../components/MessageContent';

const SharedChatPage = () => {
  const { shareId } = useParams();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3080"}/api/shared/${shareId}`);
        const data = await response.json();

        if (data.success) {
          setChat(data.chat);
        } else {
          setError(data.message || 'Failed to load chat');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-400">Error</h1>
        <p className="text-gray-400">{error}</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1A232E] p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-lg">{chat.title}</h1>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <User size={12} /> {chat.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {new Date(chat.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} /> {chat.messages.length} messages
                </span>
              </div>
            </div>
          </div>
          <Link to="/" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Try AI Chat
          </Link>
        </div>
      </header>

      {/* Chat Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-6 pb-20">
        {chat.messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-[#1A232E] border border-gray-700 rounded-bl-none'
            }`}>
              <div className="text-xs opacity-50 mb-1 capitalize">{msg.sender}</div>
              <MessageContent message={msg.message} />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default SharedChatPage;
