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
// Student pages
import { StudentProfilePage } from './pages/StudentProfilePage';
import { StudentGradesPage } from './pages/StudentGradesPage';
import { StudentCoursesPage } from './pages/StudentCoursesPage';

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
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      // Student routes
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-grades',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentGradesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-courses',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentCoursesPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
