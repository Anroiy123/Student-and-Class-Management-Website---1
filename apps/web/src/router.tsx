import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { ClassesPage } from './pages/ClassesPage';
import { CoursesPage } from './pages/CoursesPage';
import { GradesPage } from './pages/GradesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/auth/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/auth/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'students',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <StudentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'classes',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <ClassesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'courses',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <CoursesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'grades',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <GradesPage />
          </ProtectedRoute>
        ),
      },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);
