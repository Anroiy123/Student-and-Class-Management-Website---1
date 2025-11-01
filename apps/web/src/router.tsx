import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsPage } from "./pages/StudentsPage";
import { ClassesPage } from "./pages/ClassesPage";
import { CoursesPage } from "./pages/CoursesPage";
import { GradesPage } from "./pages/GradesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { StudentProfilePage } from "./pages/StudentProfilePage";
import { SignInPage } from "./pages/SignInPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/auth/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true, 
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      { 
        path: "dashboard", 
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      { 
        path: "students", 
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
            <StudentsPage />
          </ProtectedRoute>
        ),
      },
      { 
        path: "classes", 
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
            <ClassesPage />
          </ProtectedRoute>
        ),
      },
      { 
        path: "courses", 
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <CoursesPage />
          </ProtectedRoute>
        ),
      },
      { 
        path: "grades", 
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]}>
            <GradesPage />
          </ProtectedRoute>
        ),
      },
      { 
        path: "reports", 
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      { 
        path: "profile", 
        element: (
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
