// frontend/src/Login.jsx
import { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Connect to your Python Backend
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        username,
        password
      });

      // Pass the user data up to App.jsx
      onLogin(response.data); 
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Try senthil / password123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-600 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-96">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">TechFlow AI</h1>
          <p className="text-blue-200">Enterprise Support Agent</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-blue-100 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-blue-300/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-blue-100 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-blue-300/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-blue-300/60">
          <p>Demo Credentials:</p>
          <p>Manager: senthil / password123</p>
          <p>Support: adi / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;