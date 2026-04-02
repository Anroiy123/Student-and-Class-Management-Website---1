import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect, type ReactNode, useCallback } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../lib/authHooks';
import { useTheme } from '../lib/themeHooks';
import type { UserRole } from '../lib/authContext';

type NavItem = {
  label: string;
  path: string;
  roles?: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/' },
  // Admin/Teacher items
  {
    label: 'Quản lý sinh viên',
    path: '/students',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý lớp học',
    path: '/classes',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý môn học',
    path: '/courses',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý điểm',
    path: '/grades',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Báo cáo',
    path: '/reports',
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý tài khoản',
    path: '/users',
    roles: ['ADMIN'],
  },
  // Student items
  {
    label: 'Hồ sơ cá nhân',
    path: '/profile',
    roles: ['STUDENT'],
  },
  {
    label: 'Điểm của tôi',
    path: '/my-grades',
    roles: ['STUDENT'],
  },
  {
    label: 'Môn học của tôi',
    path: '/my-courses',
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

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Alt + 1: Focus on main content
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      mainContent?.focus();
    }
    // Alt + 2: Focus on navigation
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      const nav = document.getElementById('main-nav');
      const firstNavItem = nav?.querySelector('a');
      firstNavItem?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Skip Links for Keyboard Navigation */}
      <a href="#main-content" className="skip-link">
        Bỏ qua đến nội dung chính
      </a>
      <a href="#main-nav" className="skip-link">
        Bỏ qua đến điều hướng
      </a>

      <div className="min-h-screen flex bg-edu-background dark:bg-edu-dark-bg">
        <aside
          className={clsx(
            'sticky top-0 h-screen edu-sidebar transition-all duration-300 relative flex-shrink-0',
            isCollapsed ? 'w-20 min-w-20' : 'w-64 min-w-64',
          )}
          onMouseEnter={() => setShowCollapseButton(true)}
          onMouseLeave={() => setShowCollapseButton(false)}
          aria-label="Thanh điều hướng chính"
        >
          <div
            className={clsx(
              'flex h-full flex-col gap-4',
              isCollapsed ? 'p-3' : 'p-4',
            )}
          >
            {!isCollapsed && (
              <Link
                to="/"
                className="block px-2 py-3"
                aria-label="Trang chủ - Quản lý Sinh viên/Lớp học"
              >
                <div className="font-display text-2xl font-extrabold text-white tracking-tight">
                  Edu<span className="text-emerald-300">Manager</span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">Hệ thống quản lý sinh viên</p>
              </Link>
            )}
            {isCollapsed && (
              <Link
                to="/"
                className="w-full aspect-square flex items-center justify-center"
                title="EduManager - Trang chủ"
                aria-label="Trang chủ"
              >
                <span className="font-display text-xl font-extrabold text-white">E</span>
              </Link>
            )}
            <nav 
              id="main-nav" 
              className="flex flex-col gap-1"
              role="navigation"
              aria-label="Menu chính"
            >
              {visibleNavItems.map((item) => (
                <NavItem
                  key={item.path}
                  to={item.path}
                  isCollapsed={isCollapsed}
                >
                  {item.label}
                </NavItem>
              ))}
            </nav>
            <div className="mt-auto" role="region" aria-label="Thông tin người dùng">
              {user && !isCollapsed && (
                <div className="mb-3 bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold text-white truncate"
                        title={user.email}
                      >
                        {user.email}
                      </p>
                      <p className="text-xs text-white/70">
                        {user.role === 'ADMIN' && 'Quản trị viên'}
                        {user.role === 'TEACHER' && 'Giảng viên'}
                        {user.role === 'STUDENT' && 'Sinh viên'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white text-sm font-medium transition-colors"
                    aria-label={
                      theme === 'light'
                        ? 'Chuyển sang chế độ tối'
                        : 'Chuyển sang chế độ sáng'
                    }
                    aria-pressed={theme === 'dark'}
                  >
                    <span className="text-base">{theme === 'light' ? '🌙' : '☀️'}</span>
                    <span>{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</span>
                  </button>
                </div>
              )}
              {user && isCollapsed && (
                <>
                  <div
                    className="mb-2 w-full aspect-square flex items-center justify-center bg-white/10 rounded-xl text-white font-bold"
                    title={user.email}
                    role="status"
                    aria-label={`Đang đăng nhập với: ${user.email}`}
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="mb-2 w-full aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
                    title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
                    aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
                    aria-pressed={theme === 'dark'}
                  >
                    <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
                  </button>
                </>
              )}
              <button
                type="button"
                className={clsx(
                  'w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-red-500/80 rounded-lg text-white/80 hover:text-white font-medium text-sm transition-colors',
                  isCollapsed && 'aspect-square p-2',
                )}
                onClick={handleSignOut}
                title={isCollapsed ? 'Đăng xuất' : undefined}
                aria-label="Đăng xuất khỏi hệ thống"
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
              'absolute -right-3 top-2/3 -translate-y-1/2 w-6 h-12 bg-edu-primary dark:bg-edu-dark-surface border border-edu-border dark:border-edu-dark-border rounded-r-lg shadow-card flex items-center justify-center transition-all',
              'hover:bg-edu-primary-light dark:hover:bg-edu-dark-muted',
              showCollapseButton ? 'opacity-100' : 'opacity-0 focus:opacity-100',
            )}
            aria-label={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            aria-expanded={!isCollapsed}
            aria-controls="main-nav"
          >
            <span className="text-xs font-bold text-white dark:text-edu-dark-text" aria-hidden="true">{isCollapsed ? '›' : '‹'}</span>
          </button>
        </aside>
        <main 
          id="main-content" 
          className="flex-1 px-6 py-6 lg:px-8 bg-edu-background dark:bg-edu-dark-bg"
          role="main"
          tabIndex={-1}
          aria-label="Nội dung chính"
        >
          <Outlet />
        </main>
      </div>
    </>
  );
};

const NavItem = ({
  to,
  isCollapsed,
  children,
}: {
  to: string;
  isCollapsed: boolean;
  children: ReactNode;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        'flex items-center rounded-lg transition-all duration-150 no-underline',
        isActive
          ? 'bg-white/20 text-white font-semibold hover:text-white hover:bg-white/25'
          : 'text-white/70 hover:bg-white/10 hover:text-white',
        isCollapsed
          ? 'justify-center p-3 text-xs'
          : 'px-4 py-2.5',
      )
    }
    end={to === '/'}
    title={isCollapsed ? String(children) : undefined}
    aria-label={String(children)}
  >
    {({ isActive }) => (
      <>
        {isCollapsed ? (
          <span className="text-xs font-medium">{String(children).charAt(0)}</span>
        ) : (
          <span className="text-sm">{children}</span>
        )}
        {isActive && <span className="sr-only">(trang hiện tại)</span>}
      </>
    )}
  </NavLink>
);
