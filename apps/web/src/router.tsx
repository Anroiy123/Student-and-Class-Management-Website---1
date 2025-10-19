import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsPage } from "./pages/StudentsPage";
import { ClassesPage } from "./pages/ClassesPage";
import { CoursesPage } from "./pages/CoursesPage";
import { GradesPage } from "./pages/GradesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SignInPage } from "./pages/SignInPage";

export const router = createBrowserRouter([
  {
    path: "/auth/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "students", element: <StudentsPage /> },
      { path: "classes", element: <ClassesPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "grades", element: <GradesPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
]);
