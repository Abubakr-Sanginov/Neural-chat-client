import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginAPI(email, password);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A232E] flex items-center justify-center p-4">
      <div className="bg-[#0F1419] p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Neural Chat</h1>
        <h2 className="text-xl text-gray-300 mb-6 text-center">Вход в систему</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#1A232E] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-[#1A232E] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors mt-6"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-400 transition-colors">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
