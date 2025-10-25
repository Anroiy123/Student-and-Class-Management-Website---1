import { Link, NavLink, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useAuth, type UserRole } from '../lib/auth';

type NavItem = {
  label: string;
  path: string;
  roles?: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/' },
  {
    label: 'Quản lý sinh viên',
    path: '/students',
    roles: ['ADMIN', 'TEACHER'],
  },
  { label: 'Quản lý lớp học', path: '/classes', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Quản lý môn học', path: '/courses', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Quản lý điểm', path: '/grades', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Báo cáo', path: '/reports' },
];

export const AppLayout = () => {
  const { logout, user } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen flex">
      <aside className="sticky top-0 h-screen w-64 border-r-3 border-black bg-nb-lemon">
        <div className="flex h-full flex-col gap-4 p-4">
          <Link
            to="/"
            className="border-3 border-black bg-white px-3 py-2 font-display text-lg font-semibold shadow-neo"
          >
            Student/Class Admin
          </Link>
          <nav className="nb-nav flex-col">
            {visibleNavItems.map((item) => (
              <NavItem key={item.path} to={item.path}>
                {item.label}
              </NavItem>
            ))}
          </nav>
          <div className="mt-auto">
            {user && (
              <div className="mb-3 border-3 border-black bg-white p-2 shadow-neo-sm">
                <p className="text-xs font-semibold">{user.email}</p>
                <p className="text-xs opacity-70">
                  {user.role === 'ADMIN' && 'Quản trị viên'}
                  {user.role === 'TEACHER' && 'Giảng viên'}
                  {user.role === 'STUDENT' && 'Sinh viên'}
                </p>
              </div>
            )}
            <button
              type="button"
              className="nb-btn nb-btn--accent w-full"
              onClick={handleSignOut}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 sm:px-6">
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
        'nb-nav__item block w-full text-left',
        isActive && 'nb-nav__item--active',
      )
    }
    end={to === '/'}
  >
    {children}
  </NavLink>
);
