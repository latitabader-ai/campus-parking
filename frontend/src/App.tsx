// src/App.tsx — Full routing shell with role-based protection
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { setToken } from '@/api/client';
import axios from 'axios';
import NavBar      from '@/components/NavBar';
import Spinner     from '@/components/Spinner';
import LoginPage   from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MapPage     from '@/pages/MapPage';
import StudentPage from '@/pages/StudentPage';
import SecurityPage from '@/pages/SecurityPage';
import AdminPage   from '@/pages/AdminPage';

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex justify-center mt-20"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  // On mount: attempt to restore session via silent refresh
  useEffect(() => {
    (async () => {
      try {
        const { data } = await authApi.me();
        setAuth(data.data.user, '');
      } catch {
        try {
          const base = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
          const { data } = await axios.post(`${base}/api/v1/auth/refresh`, {}, { withCredentials: true });
          setToken(data.data.accessToken);
          const meRes = await authApi.me();
          setAuth(meRes.data.data.user, data.data.accessToken);
        } catch {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/map"      element={<><MapPage /></>} />

          {/* Student */}
          <Route path="/student" element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentPage />
            </ProtectedRoute>
          } />

          {/* Security */}
          <Route path="/security" element={
            <ProtectedRoute roles={['SECURITY']}>
              <SecurityPage />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="*" element={<Navigate to="/map" replace />} />
        </Routes>
      </main>
    </div>
  );
}
