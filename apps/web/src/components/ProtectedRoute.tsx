import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'ADMIN' | 'TEACHER' | 'STUDENT'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Đang load user từ token
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập → Redirect về trang login
  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Đã đăng nhập nhưng không có quyền → Hiển thị 403
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300">403</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">Không có quyền truy cập</h2>
          <p className="mt-2 text-gray-500">
            Bạn không có quyền truy cập trang này.
            <br />
            Role của bạn: <span className="font-medium">{user.role}</span>
            <br />
            Yêu cầu: <span className="font-medium">{allowedRoles.join(', ')}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // User có quyền → Render children
  return <>{children}</>;
}
