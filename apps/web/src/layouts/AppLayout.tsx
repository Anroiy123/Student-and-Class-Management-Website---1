import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect, type ReactNode, useCallback } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../lib/authHooks';
import { useTheme } from '../lib/themeHooks';
import { NotificationBell } from '../components/NotificationBell';
import type { UserRole } from '../lib/authContext';
import {
  LayoutDashboard,
  GraduationCap,
  School,
  BookOpen,
  ClipboardList,
  BarChart3,
  Users,
  Send,
  User,
  Award,
  BookMarked,
  LogOut,
  Moon,
  Sun,
  Menu,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  // Admin/Teacher items
  {
    label: 'Quản lý sinh viên',
    path: '/students',
    icon: GraduationCap,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý lớp học',
    path: '/classes',
    icon: School,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý môn học',
    path: '/courses',
    icon: BookOpen,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý điểm',
    path: '/grades',
    icon: ClipboardList,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Báo cáo',
    path: '/reports',
    icon: BarChart3,
    roles: ['ADMIN', 'TEACHER'],
  },
  {
    label: 'Quản lý tài khoản',
    path: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    label: 'Gửi thông báo',
    path: '/send-notification',
    icon: Send,
    roles: ['ADMIN', 'TEACHER'],
  },
  // Student items
  {
    label: 'Hồ sơ cá nhân',
    path: '/profile',
    icon: User,
    roles: ['STUDENT'],
  },
  {
    label: 'Điểm của tôi',
    path: '/my-grades',
    icon: Award,
    roles: ['STUDENT'],
  },
  {
    label: 'Môn học của tôi',
    path: '/my-courses',
    icon: BookMarked,
    roles: ['STUDENT'],
  },
];

export const AppLayout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCollapseButton, setShowCollapseButton] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

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

      <div className="min-h-screen flex bg-edu-background dark:bg-edu-dark-bg overflow-x-hidden max-w-full w-full">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={clsx(
            'edu-sidebar transition-all duration-300 flex-shrink-0 h-screen',
            // Desktop - fixed sidebar
            'lg:fixed lg:inset-y-0 lg:left-0 lg:z-30',
            isCollapsed ? 'lg:w-20' : 'lg:w-64',
            // Mobile - fixed overlay with max-width constraint
            isMobileMenuOpen 
              ? 'fixed inset-y-0 left-0 w-64 max-w-[85vw] z-50' 
              : 'hidden lg:block',
          )}
          onMouseEnter={() => setShowCollapseButton(true)}
          onMouseLeave={() => setShowCollapseButton(false)}
          aria-label="Thanh điều hướng chính"
        >
          <div
            className={clsx(
              'flex h-full flex-col gap-4 overflow-y-auto',
              isCollapsed ? 'p-3' : 'p-4',
            )}
          >
            {/* Logo - fixed at top */}
            <div className="flex-shrink-0">
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
            </div>

            {/* Navigation - scrollable */}
            <nav 
              id="main-nav" 
              className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto"
              role="navigation"
              aria-label="Menu chính"
            >
              {visibleNavItems.map((item) => (
                <NavItemComponent
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  isCollapsed={isCollapsed}
                  onMobileClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </NavItemComponent>
              ))}
            </nav>

            {/* User section - fixed at bottom */}
            <div className="flex-shrink-0 mt-auto" role="region" aria-label="Thông tin người dùng">
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
                    <NotificationBell isCollapsed={false} />
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
                    {theme === 'light' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
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
                    {theme === 'light' ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
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
                <LogOut className={clsx(isCollapsed ? 'w-5 h-5' : 'w-4 h-4')} />
                {!isCollapsed && <span>Đăng xuất</span>}
              </button>
            </div>
          </div>
          {/* Collapse/Expand Button - Desktop only */}
          <button
            type="button"
            onClick={toggleCollapse}
            className={clsx(
              'absolute -right-3 top-2/3 -translate-y-1/2 w-6 h-12 bg-edu-primary dark:bg-edu-dark-surface border border-edu-border dark:border-edu-dark-border rounded-r-lg shadow-card flex items-center justify-center transition-all',
              'hover:bg-edu-primary-light dark:hover:bg-edu-dark-muted',
              'hidden lg:flex',
              showCollapseButton ? 'opacity-100' : 'opacity-0 focus:opacity-100',
            )}
            aria-label={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            aria-expanded={!isCollapsed}
            aria-controls="main-nav"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white dark:text-edu-dark-text" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white dark:text-edu-dark-text" />
            )}
          </button>
        </aside>

        {/* Main Content - with margin for fixed sidebar on desktop */}
        <main 
          id="main-content" 
          className={clsx(
            'flex-1 flex flex-col bg-edu-background dark:bg-edu-dark-bg min-w-0 overflow-x-hidden',
            // Add margin-left on desktop to account for fixed sidebar
            isCollapsed ? 'lg:ml-20' : 'lg:ml-64',
          )}
          role="main"
          tabIndex={-1}
          aria-label="Nội dung chính"
        >
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-30 bg-edu-primary dark:bg-edu-dark-surface border-b border-edu-border dark:border-edu-dark-border px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              aria-label="Mở menu"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="font-display text-base sm:text-lg font-bold text-white truncate flex-1 text-center px-2">
              Edu<span className="text-emerald-300">Manager</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <NotificationBell isCollapsed={false} />
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white touch-manipulation"
                aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6 overflow-x-hidden max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

const NavItemComponent = ({
  to,
  icon: Icon,
  isCollapsed,
  onMobileClick,
  children,
}: {
  to: string;
  icon: LucideIcon;
  isCollapsed: boolean;
  onMobileClick?: () => void;
  children: ReactNode;
}) => (
  <NavLink
    to={to}
    onClick={onMobileClick}
    className={({ isActive }) =>
      clsx(
        'flex items-center rounded-lg transition-all duration-150 no-underline',
        isActive
          ? 'bg-white/20 text-white font-semibold hover:text-white hover:bg-white/25'
          : 'text-white/70 hover:bg-white/10 hover:text-white',
        isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5',
      )
    }
    end={to === '/'}
    title={isCollapsed ? String(children) : undefined}
    aria-label={String(children)}
  >
    {({ isActive }) => (
      <>
        <Icon className={clsx('flex-shrink-0', isCollapsed ? 'w-5 h-5' : 'w-5 h-5')} />
        {!isCollapsed && <span className="text-sm">{children}</span>}
        {isActive && <span className="sr-only">(trang hiện tại)</span>}
      </>
    )}
  </NavLink>
);
