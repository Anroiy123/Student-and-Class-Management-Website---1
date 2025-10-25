import { Navigate } from 'react-router-dom';
import { useRequireAuth, type UserRole } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { isAuthorized, isLoading } = useRequireAuth(allowedRoles);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="nb-card">
          <p className="text-lg font-semibold">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <>{children}</>;
};
