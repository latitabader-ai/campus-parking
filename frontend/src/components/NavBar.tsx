// src/components/NavBar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';

export default function NavBar() {
  const { user, clearAuth } = useAuthStore();
  const nav = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    nav('/login');
  };

  const roleLabel: Record<string, string> = {
    STUDENT: 'Student', SECURITY: 'Security Staff', ADMIN: 'Admin',
  };

  return (
    <header className="bg-green-800 text-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-base tracking-tight">
          KSU Campus Parking
          <span className="ml-2 text-xs font-normal bg-green-700 text-green-100 px-1.5 py-0.5 rounded">MVP Demo</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/map" className="hover:underline">Map</Link>
          {user ? (
            <>
              {user.role === 'STUDENT'  && <Link to="/student"  className="hover:underline">My Parking</Link>}
              {user.role === 'SECURITY' && <Link to="/security" className="hover:underline">Dashboard</Link>}
              {user.role === 'ADMIN'    && <Link to="/admin"    className="hover:underline">Admin</Link>}
              <span className="text-green-200 text-xs">{roleLabel[user.role] ?? user.role}</span>
              <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1">Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-secondary text-xs px-3 py-1">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
