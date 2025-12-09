import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FavoritesPanel({ favorites, chats, onRemoveFavorite, onJumpToMessage }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="favorites-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Избранные сообщения"
      >
        <Star size={20} />
        {favorites.length > 0 && (
          <span className="favorites-count">{favorites.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="favorites-panel">
          <div className="favorites-header">
            <h3>Избранные сообщения</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className="favorites-list">
            {favorites.length === 0 ? (
              <p className="empty-favorites">Нет избранных сообщений</p>
            ) : (
              favorites.map((fav) => (
                <div key={fav.id} className="favorite-item">
                  <div className="favorite-content">
                    <p>{fav.message.substring(0, 100)}...</p>
                    <span className="favorite-date">{new Date(fav.timestamp).toLocaleDateString()}</span>
                  </div>
                  <button 
                    className="remove-favorite"
                    onClick={() => onRemoveFavorite(fav.id)}
                  >
                    <Star size={16} fill="gold" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
