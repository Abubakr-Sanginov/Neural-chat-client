import { Star, X, ArrowLeft, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllChats } from '../api';

export default function FavoritesPage({ favoriteChats, onRemoveFavorite }) {
  const navigate = useNavigate();
  const [chatsData, setChatsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteChatsData();
  }, [favoriteChats]);

  const loadFavoriteChatsData = async () => {
    try {
      setLoading(true);
      const allChats = await getAllChats();
      const favoriteChatsData = allChats.filter(chat => favoriteChats.includes(chat.id));
      setChatsData(favoriteChatsData);
    } catch (error) {
      console.error('Failed to load favorite chats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A232E] min-h-screen text-white">
      {/* Header */}
      <div className="bg-[#0F1419] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#1A232E] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Star size={24} className="text-yellow-400" fill="currentColor" />
            <h1 className="text-2xl font-bold">Избранные чаты</h1>
          </div>
          <span className="text-gray-400 text-sm ml-auto">
            {chatsData.length} {chatsData.length === 1 ? 'чат' : chatsData.length > 1 && chatsData.length < 5 ? 'чата' : 'чатов'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Загрузка...</p>
          </div>
        ) : chatsData.length === 0 ? (
          <div className="text-center py-20">
            <Star size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Нет избранных чатов</p>
            <p className="text-gray-500 text-sm mt-2">
              Добавьте чаты в избранное, чтобы быстро находить их позже
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatsData.map((chat) => (
              <div
                key={chat.id}
                className="bg-[#0F1419] border border-gray-700 rounded-lg p-4 hover:border-yellow-500/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/chat/${chat.id}`)}
              >
                <div className="flex items-start gap-3">
                  <Star size={20} className="text-yellow-400 flex-shrink-0 mt-1" fill="currentColor" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors truncate">
                        {chat.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>{chat.messageCount} сообщений</span>
                      </div>
                      <span>•</span>
                      <span>
                        {new Date(chat.updatedAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(chat.id);
                    }}
                    className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                    title="Удалить из избранного"
                  >
                    <X size={18} className="text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
