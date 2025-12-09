import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { createRoom, searchUsers } from '../api';

export default function CreateRoomModal({ onClose, onRoomCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(async () => {
        try {
          const data = await searchUsers(searchQuery);
          setUsers(data.users);
        } catch (error) {
          console.error('Failed to search users:', error);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Введите название комнаты');
      return;
    }

    setLoading(true);

    try {
      const data = await createRoom(name.trim(), description.trim(), selectedUserIds);
      onRoomCreated(data.room);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1419] rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Создать комнату</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Название комнаты *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#1A232E] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Моя комната"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-[#1A232E] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Описание комнаты..."
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Добавить участников
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#1A232E] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Поиск пользователей..."
            />
            
            {searchQuery && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {users.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 bg-[#1A232E] hover:bg-[#2A3441] p-2 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm">{user.username}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </label>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-2">Пользователи не найдены</p>
                )}
              </div>
            )}

            {selectedUserIds.length > 0 && (
              <p className="text-blue-400 text-sm mt-2">
                Выбрано: {selectedUserIds.length} пользователей
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Создание...' : (
                <>
                  <Plus size={18} />
                  Создать
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
