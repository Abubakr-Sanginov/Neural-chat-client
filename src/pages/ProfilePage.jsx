import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Save, ArrowLeft, Camera, LogOut } from 'lucide-react';
import { getAuthHeaders } from '../api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    avatar: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:3080/api/auth/me', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to load profile');
      
      const data = await response.json();
      setUser(data.user);
      setFormData({
        username: data.user.username,
        avatar: data.user.avatar || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:3080/api/auth/profile', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      setUser(data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A232E] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A232E] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Chat
          </button>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-[#0F1419] rounded-xl border border-gray-700 p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-200 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-[#1A232E]">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    formData.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">Click to change avatar (Coming soon)</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-[#1A232E] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative opacity-70">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={user?.email}
                  readOnly
                  className="w-full bg-[#1A232E] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Member Since
              </label>
              <div className="relative opacity-70">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={new Date(user?.createdAt).toLocaleDateString()}
                  readOnly
                  className="w-full bg-[#1A232E] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-8"
            >
              <Save size={20} />
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
