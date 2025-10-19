import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { clsx } from "clsx";

type NavItem = {
  label: string;
  path: string;
  roles?: string[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Quản lý sinh viên", path: "/students" },
  { label: "Quản lý lớp học", path: "/classes" },
  { label: "Quản lý môn học", path: "/courses" },
  { label: "Quản lý điểm", path: "/grades" },
  { label: "Báo cáo", path: "/reports" },
];

export const AppLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // TODO: replace with real sign-out logic when auth is implemented.
    navigate("/auth/sign-in");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 bg-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-blue-600">
            Student/Class Admin
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.path} to={item.path}>
                {item.label}
              </NavItem>
            ))}
          </nav>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
            onClick={handleSignOut}
          >
            Đăng xuất
          </button>
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
    end={to === "/"}
  >
    {children}
  </NavLink>
);
