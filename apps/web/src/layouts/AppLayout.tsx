import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, type ReactNode, useCallback } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../lib/authHooks';
import { useTheme } from '../lib/themeHooks';
import type { UserRole } from '../lib/authContext';
import {
  LayoutDashboard,
  GraduationCap,
  School,
  BookOpen,
  ClipboardList,
  BarChart3,
  Users,
  User,
  BookMarked,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
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
  { label: 'Hồ sơ cá nhân', path: '/profile', icon: User, roles: ['STUDENT'] },
  { label: 'Điểm của tôi', path: '/my-grades', icon: ClipboardList, roles: ['STUDENT'] },
  { label: 'Môn học của tôi', path: '/my-courses', icon: BookMarked, roles: ['STUDENT'] },
];

const MOBILE_BREAKPOINT = 768;

export const AppLayout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCollapseButton, setShowCollapseButton] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (!mobile) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('navCollapsed');
      if (stored === 'true') setIsCollapsed(true);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSignOut = () => logout();

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem('navCollapsed', String(newState));
      return newState;
    });
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      document.getElementById('main-content')?.focus();
    }
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      document.getElementById('main-nav')?.querySelector('a')?.focus();
    }
    if (e.key === 'Escape' && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const currentPageTitle = visibleNavItems.find(
    (item) => item.path === location.pathname
  )?.label || 'EduManager';

  const ThemeIcon = theme === 'light' ? Moon : Sun;

  return (
    <>
      <a href="#main-content" className="skip-link">Bỏ qua đến nội dung chính</a>
      <a href="#main-nav" className="skip-link">Bỏ qua đến điều hướng</a>

      <div className="min-h-screen flex flex-col md:flex-row bg-edu-background dark:bg-edu-dark-bg">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-edu-primary dark:bg-edu-dark-surface border-b border-edu-border dark:border-edu-dark-border safe-area-top gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
            aria-label="Mở menu điều hướng"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <span className="font-display font-bold text-white text-base sm:text-lg truncate px-2 flex-1 text-center">
            {currentPageTitle}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
            aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
          >
            <ThemeIcon className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Drawer */}
        <aside
          className={clsx(
            'md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] edu-sidebar transform transition-transform duration-300 ease-out safe-area-left',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-label="Menu điều hướng mobile"
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="flex h-full flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="font-display text-xl font-extrabold text-white tracking-tight">
                  Edu<span className="text-emerald-300">Manager</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1" role="navigation">
              {visibleNavItems.map((item) => (
                <MobileNavItem key={item.path} to={item.path} icon={item.icon} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </MobileNavItem>
              ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-white/20">
              {user && (
                <div className="mb-3 bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      <p className="text-xs text-white/70">
                        {user.role === 'ADMIN' && 'Quản trị viên'}
                        {user.role === 'TEACHER' && 'Giảng viên'}
                        {user.role === 'STUDENT' && 'Sinh viên'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-red-500/80 rounded-lg text-white font-medium text-sm transition-colors min-h-[44px]"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside
          className={clsx(
            'hidden md:block sticky top-0 h-screen edu-sidebar transition-all duration-300 relative flex-shrink-0',
            isCollapsed ? 'w-20 min-w-20' : 'w-64 min-w-64',
          )}
          onMouseEnter={() => setShowCollapseButton(true)}
          onMouseLeave={() => setShowCollapseButton(false)}
          aria-label="Thanh điều hướng chính"
        >
          <div className={clsx('flex h-full flex-col gap-4', isCollapsed ? 'p-3' : 'p-4')}>
            {!isCollapsed && (
              <Link to="/" className="block px-2 py-3">
                <div className="font-display text-2xl font-extrabold text-white tracking-tight">
                  Edu<span className="text-emerald-300">Manager</span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">Hệ thống quản lý sinh viên</p>
              </Link>
            )}
            {isCollapsed && (
              <Link to="/" className="w-full aspect-square flex items-center justify-center" title="EduManager">
                <span className="font-display text-xl font-extrabold text-white">E</span>
              </Link>
            )}
            <nav id="main-nav" className="flex flex-col gap-1" role="navigation" aria-label="Menu chính">
              {visibleNavItems.map((item) => (
                <DesktopNavItem key={item.path} to={item.path} icon={item.icon} isCollapsed={isCollapsed}>
                  {item.label}
                </DesktopNavItem>
              ))}
            </nav>
            <div className="mt-auto">
              {user && !isCollapsed && (
                <div className="mb-3 bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
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
                    aria-pressed={theme === 'dark'}
                  >
                    <ThemeIcon className="w-4 h-4" />
                    <span>{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</span>
                  </button>
                </div>
              )}
              {user && isCollapsed && (
                <>
                  <div className="mb-2 w-full aspect-square flex items-center justify-center bg-white/10 rounded-xl text-white font-bold" title={user.email}>
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="mb-2 w-full aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
                    title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
                  >
                    <ThemeIcon className="w-5 h-5" />
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
              >
                {isCollapsed ? <LogOut className="w-5 h-5" /> : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleCollapse}
            className={clsx(
              'absolute -right-3 top-2/3 -translate-y-1/2 w-6 h-12 bg-edu-primary dark:bg-edu-dark-surface border border-edu-border dark:border-edu-dark-border rounded-r-lg shadow-card flex items-center justify-center transition-all',
              'hover:bg-edu-primary-light dark:hover:bg-edu-dark-muted',
              showCollapseButton ? 'opacity-100' : 'opacity-0 focus:opacity-100',
            )}
            aria-label={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white dark:text-edu-dark-text" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white dark:text-edu-dark-text" />
            )}
          </button>
        </aside>

        {/* Main Content */}
        <main
          id="main-content"
          className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 bg-edu-background dark:bg-edu-dark-bg min-h-[calc(100vh-60px)] md:min-h-screen overflow-x-hidden"
          role="main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
};

// Mobile Nav Item
const MobileNavItem = ({ to, icon: Icon, children, onClick }: { to: string; icon: LucideIcon; children: ReactNode; onClick: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 no-underline min-h-[44px]',
        isActive
          ? 'bg-white/20 text-white font-semibold'
          : 'text-white/70 hover:bg-white/10 hover:text-white',
      )
    }
    end={to === '/'}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm">{children}</span>
  </NavLink>
);

// Desktop Nav Item
const DesktopNavItem = ({ to, icon: Icon, isCollapsed, children }: { to: string; icon: LucideIcon; isCollapsed: boolean; children: ReactNode }) => (
  <NavLink
    to={to}
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
  >
    <Icon className={clsx('flex-shrink-0', isCollapsed ? 'w-5 h-5' : 'w-5 h-5')} />
    {!isCollapsed && <span className="text-sm">{children}</span>}
  </NavLink>
);
