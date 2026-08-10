// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import ErrorMessage from '@/components/ErrorMessage';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { setAuth } = useAuthStore();
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      setAuth(data.data.user, data.data.accessToken);
      const dest: Record<string, string> = { STUDENT: '/student', SECURITY: '/security', ADMIN: '/admin' };
      nav(dest[data.data.user.role] ?? '/map');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Login failed';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">KSU Campus Parking</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorMessage msg={error} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@demo.ksu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">Demo accounts (password: Demo@12345)</p>
            <p>student@demo.ksu — Security@demo.ksu — admin@demo.ksu</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <Link to="/register" className="text-green-700 hover:underline">Register</Link>
          {' · '}
          <Link to="/map" className="text-green-700 hover:underline">View public map</Link>
        </p>
      </div>
    </div>
  );
}
