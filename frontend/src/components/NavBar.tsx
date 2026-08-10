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

  // Issue 7: abbreviated role label for the user chip
  const roleLabel: Record<string, string> = {
    STUDENT: 'Student', SECURITY: 'Security', ADMIN: 'Admin',
  };

  return (
    <header style={{ background: '#0089C4' }} className="text-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="font-semibold text-base tracking-tight text-white">
          KSU Campus Parking
          <span className="ml-2 text-xs font-normal bg-white text-ksu-blue px-1.5 py-0.5 rounded">MVP Demo</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/map" className="text-white/90 hover:text-white hover:underline">Map</Link>
          {user && (
            <>
              {user.role === 'STUDENT'  && <Link to="/student"  className="text-white/90 hover:text-white hover:underline">My Parking</Link>}
              {user.role === 'SECURITY' && <Link to="/security" className="text-white/90 hover:text-white hover:underline">Dashboard</Link>}
              {user.role === 'ADMIN'    && <Link to="/admin"    className="text-white/90 hover:text-white hover:underline">Admin</Link>}
            </>
          )}

          {/* Issue 7: user chip on the far right */}
          {user ? (
            <div className="flex items-center gap-2 ml-2 border-l border-white/30 pl-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-white text-xs font-semibold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-xs text-white/90 hidden sm:block">
                {user.name} · {roleLabel[user.role] ?? user.role}
              </span>
              <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1 ml-1">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn-secondary text-xs px-3 py-1 ml-2">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
