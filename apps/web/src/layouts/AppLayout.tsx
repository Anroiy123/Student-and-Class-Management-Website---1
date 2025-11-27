import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../lib/authHooks';
import { useTheme } from '../lib/themeHooks';
import type { UserRole } from '../lib/authContext';
import { Icon } from '../components/Icon';

type NavItem = {
  label: string;
  path: string;
  icon:
    | 'dashboard'
    | 'students'
    | 'classes'
    | 'courses'
    | 'grades'
    | 'reports'
    | 'users'
    | 'profile'
    | 'my-grades'
    | 'my-courses';
  roles?: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  // Admin/Teacher items
  {
    label: 'Quản lý sinh viên',
    path: '/students',
    icon: 'students',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý lớp học',
    path: '/classes',
    icon: 'classes',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý môn học',
    path: '/courses',
    icon: 'courses',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý điểm',
    path: '/grades',
    icon: 'grades',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Báo cáo',
    path: '/reports',
    icon: 'reports',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý tài khoản',
    path: '/users',
    icon: 'users',
    roles: ['ADMIN'],
  },
  // Student items
  {
    label: 'Hồ sơ cá nhân',
    path: '/profile',
    icon: 'profile',
    roles: ['STUDENT'],
  },
  {
    label: 'Điểm của tôi',
    path: '/my-grades',
    icon: 'my-grades',
    roles: ['STUDENT'],
  },
  {
    label: 'Môn học của tôi',
    path: '/my-courses',
    icon: 'my-courses',
    roles: ['STUDENT'],
  },
];

export const AppLayout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCollapseButton, setShowCollapseButton] = useState(false);

  // Load collapse state from localStorage on mount
  useEffect(() => {
    try {
      const storedCollapsed = localStorage.getItem('navCollapsed');
      if (storedCollapsed === 'true') {
        setIsCollapsed(true);
      }
    } catch (error) {
      console.error('Failed to load nav collapse state:', error);
    }
  }, []);

  const handleSignOut = () => {
    logout();
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem('navCollapsed', String(newState));
      return newState;
    });
  };

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen flex">
      <aside
        className={clsx(
          'sticky top-0 h-screen border-r-3 border-black bg-nb-lemon transition-all duration-300 relative flex-shrink-0',
          'dark:border-[#4a4a4a] dark:bg-nb-dark-section',
          isCollapsed ? 'w-20 min-w-20' : 'w-64 min-w-64',
        )}
        onMouseEnter={() => setShowCollapseButton(true)}
        onMouseLeave={() => setShowCollapseButton(false)}
      >
        <div
          className={clsx(
            'flex h-full flex-col gap-4',
            isCollapsed ? 'p-2' : 'p-4',
          )}
        >
          {!isCollapsed && (
            <Link
              to="/"
              className="border-3 border-black bg-white px-3 py-2 font-display text-lg font-semibold shadow-neo rounded-md dark:border-[#4a4a4a] dark:bg-nb-dark-bg dark:text-nb-dark-text dark:shadow-neo-dark"
            >
              Student/Class Admin
            </Link>
          )}
          {isCollapsed && (
            <Link
              to="/"
              className="border-3 border-black bg-white p-2 font-display text-2xl font-semibold shadow-neo rounded-md dark:border-[#4a4a4a] dark:bg-nb-dark-bg dark:text-nb-dark-text dark:shadow-neo-dark flex items-center justify-center"
              title="Student/Class Admin"
            >
              S
            </Link>
          )}
          <nav className="nb-nav flex-col">
            {visibleNavItems.map((item) => (
              <NavItem
                key={item.path}
                to={item.path}
                icon={item.icon}
                isCollapsed={isCollapsed}
              >
                {item.label}
              </NavItem>
            ))}
          </nav>
          <div className="mt-auto">
            {user && !isCollapsed && (
              <div className="mb-3 border-3 border-black bg-white p-2 shadow-neo-sm rounded-md dark:border-[#4a4a4a] dark:bg-nb-dark-bg dark:text-nb-dark-text dark:shadow-neo-sm-dark">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                    <p className="text-xs opacity-70">
                      {user.role === 'ADMIN' && 'Quản trị viên'}
                      {user.role === 'TEACHER' && 'Giảng viên'}
                      {user.role === 'STUDENT' && 'Sinh viên'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex-shrink-0 border-2 border-black bg-nb-lemon p-1 shadow-neo-sm hover:scale-110 transition-transform rounded dark:border-[#4a4a4a] dark:bg-nb-gold dark:shadow-neo-sm-dark"
                    aria-label="Toggle theme"
                    title={
                      theme === 'light'
                        ? 'Switch to dark mode'
                        : 'Switch to light mode'
                    }
                  >
                    <img
                      src={
                        theme === 'light' ? '/icons/moon.svg' : '/icons/sun.svg'
                      }
                      alt=""
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            )}
            {user && isCollapsed && (
              <>
                <div
                  className="mb-2 border-3 border-black bg-white p-2 shadow-neo-sm rounded-md dark:border-nb-dark-border dark:bg-nb-dark-bg dark:text-nb-dark-text dark:shadow-neo-sm-dark flex items-center justify-center"
                  title={user.email}
                >
                  <span className="text-lg font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="mb-2 w-full border-3 border-black bg-white p-2 shadow-neo-sm rounded-md hover:translate-x-[2px] hover:-translate-y-[2px] transition-transform dark:border-nb-dark-border dark:bg-nb-dark-bg dark:text-nb-dark-text dark:shadow-neo-sm-dark flex items-center justify-center gap-2"
                  title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
                >
                  <Icon
                    name={theme === 'light' ? 'moon' : 'sun'}
                    size={24}
                    className="nb-theme-icon"
                  />
                </button>
              </>
            )}
            <button
              type="button"
              className={clsx(
                'nb-btn nb-btn--accent',
                isCollapsed ? 'w-full p-2 text-lg' : 'w-full',
              )}
              onClick={handleSignOut}
              title={isCollapsed ? 'Đăng xuất' : undefined}
            >
              {isCollapsed ? '→' : 'Đăng xuất'}
            </button>
          </div>
        </div>
        {/* Collapse/Expand Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className={clsx(
            'absolute -right-4 top-2/3 -translate-y-1/2 border-3 border-black bg-nb-sky p-2 shadow-neo transition-all rounded-md',
            'dark:border-[#4a4a4a] dark:bg-nb-sky dark:shadow-neo-dark dark:text-[#1a1a1a]',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-nb-sky',
            showCollapseButton ? 'opacity-100' : 'opacity-0',
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          tabIndex={0}
        >
          <span className="text-lg font-bold">{isCollapsed ? '→' : '←'}</span>
        </button>
      </aside>
      <main className="flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};

const NavItem = ({
  to,
  icon,
  isCollapsed,
  children,
}: {
  to: string;
  icon:
    | 'dashboard'
    | 'students'
    | 'classes'
    | 'courses'
    | 'grades'
    | 'reports'
    | 'users'
    | 'profile'
    | 'my-grades'
    | 'my-courses';
  isCollapsed: boolean;
  children: ReactNode;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        'nb-nav__item block w-full text-left text-nb-ink',
        isActive
          ? 'nb-nav__item--active dark:text-nb-ink'
          : 'dark:text-nb-dark-text-strong',
        isCollapsed
          ? 'flex items-center justify-center p-2'
          : 'flex items-center gap-2',
      )
    }
    end={to === '/'}
    title={isCollapsed ? String(children) : undefined}
  >
    <Icon
      name={icon}
      size={isCollapsed ? 32 : 24}
      className="flex-shrink-0 nb-nav__icon"
    />
    {!isCollapsed && <span>{children}</span>}
  </NavLink>
);
