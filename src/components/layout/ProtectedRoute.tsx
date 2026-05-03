import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useRestoreSession } from '@/services/authService';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token } = useAuthStore();
  const { isLoading } = useRestoreSession();

  // While restoring session from httpOnly cookie, don't redirect yet
  if (isAuthenticated && !token && isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
