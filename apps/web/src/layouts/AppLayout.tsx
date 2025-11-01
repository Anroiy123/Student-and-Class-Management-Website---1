import { Link, NavLink, Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { useAuth } from "../contexts/AuthContext";

type NavItem = {
  label: string;
  path: string;
  roles?: Array<'ADMIN' | 'TEACHER' | 'STUDENT'>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", roles: ["ADMIN", "TEACHER"] },
  { label: "Quản lý sinh viên", path: "/students", roles: ["ADMIN", "TEACHER"] },
  { label: "Quản lý lớp học", path: "/classes", roles: ["ADMIN", "TEACHER"] },
  { label: "Quản lý môn học", path: "/courses", roles: ["ADMIN"] },
  { label: "Quản lý điểm", path: "/grades", roles: ["ADMIN", "TEACHER"] },
  { label: "Báo cáo", path: "/reports", roles: ["ADMIN"] },
  { label: "Thông tin cá nhân", path: "/profile", roles: ["STUDENT"] },
];

export const AppLayout = () => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  // Filter nav items theo role
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true; // Không có roles = hiển thị cho tất cả
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  // Determine home link based on role
  const homeLink = isStudent ? "/profile" : "/";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 bg-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to={homeLink} className="text-lg font-semibold text-blue-600">
            Student/Class Admin
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
            {visibleNavItems.map((item) => (
              <NavItem key={item.path} to={item.path}>
                {item.label}
              </NavItem>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {/* Hiển thị thông tin user */}
            <div className="text-sm">
              <div className="font-medium text-slate-700">{user?.email}</div>
              <div className="text-xs text-slate-500">
                {isAdmin && '👑 Admin'}
                {isTeacher && '👨‍🏫 Giảng viên'}
                {isStudent && '🎓 Sinh viên'}
              </div>
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
              onClick={handleSignOut}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};

const NavItem = ({ to, children }: { to: string; children: ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "rounded-md px-3 py-2 transition-colors hover:bg-blue-50 hover:text-blue-600",
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-slate-600 hover:text-blue-600",
      )
    }
    end={to === "/dashboard" || to === "/profile"}
  >
    {children}
  </NavLink>
);
