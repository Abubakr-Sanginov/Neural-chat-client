import { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2 } from 'lucide-react';
import { searchUsers, addRoomMember, removeRoomMember } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function RoomMembersPanel({ room, onMemberAdded, onMemberRemoved, onClose }) {
  const { user } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const isCreator = room.creator.id === user?.id;

  useEffect(() => {
    if (showAddUser && searchQuery) {
      const timer = setTimeout(async () => {
        try {
          setLoading(true);
          const data = await searchUsers(searchQuery);
          // Filter out users already in the room
          const availableUsers = data.users.filter(
            u => !room.members.some(m => m.id === u.id)
          );
          setUsers(availableUsers);
        } catch (error) {
          console.error('Failed to search users:', error);
        } finally {
          setLoading(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, showAddUser, room.members]);

  const handleAddMember = async (userId) => {
    try {
      await addRoomMember(room.id, userId);
      setShowAddUser(false);
      setSearchQuery('');
      onMemberAdded();
    } catch (error) {
      console.error('Failed to add member:', error);
      alert(error.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Удалить пользователя из комнаты?')) return;
    
    try {
      await removeRoomMember(room.id, userId);
      onMemberRemoved();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1419] rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={24} />
            Участники комнаты
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {room.members.map(member => (
            <div key={member.id} className="flex items-center justify-between bg-[#1A232E] p-3 rounded-lg">
              <div>
                <p className="text-white font-medium">{member.username}</p>
                <p className="text-gray-400 text-sm">{member.email}</p>
                {member.id === room.creator.id && (
                  <span className="text-yellow-500 text-xs">Создатель</span>
                )}
              </div>
              {isCreator && member.id !== room.creator.id && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-red-500 hover:text-red-400 p-2"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add User Button */}
        {!showAddUser && (
          <button
            onClick={() => setShowAddUser(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Добавить пользователя
          </button>
        )}

        {/* Add User Section */}
        {showAddUser && (
          <div className="mt-4 space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target. value)}
              placeholder="Поиск пользователей..."
              className="w-full px-4 py-2 bg-[#1A232E] border border-gray-600 rounded-lg text-white"
              autoFocus
            />
            
            {loading && <p className="text-gray-400 text-center">Поиск...</p>}
            
            <div className="max-h-48 overflow-y-auto space-y-1">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleAddMember(u.id)}
                  className="w-full bg-[#1A232E] hover:bg-[#2A3441] p-2 rounded text-left text-white"
                >
                  <p className="font-medium">{u.username}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                </button>
              ))}
              {!loading && searchQuery && users.length === 0 && (
                <p className="text-gray-400 text-center py-2">Пользователи не найдены</p>
              )}
            </div>

            <button
              onClick={() => {
                setShowAddUser(false);
                setSearchQuery('');
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
            >
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
