import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import {
  useUnreadCountQuery,
  useNotificationsQuery,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../lib/notifications';
import type { Notification } from '../lib/notifications';
import { Link } from 'react-router-dom';
import { useBreakpoint } from '../lib/responsive';
import { BottomSheet } from './BottomSheet';
import {
  Bell,
  ClipboardCheck,
  PenLine,
  Info,
  X,
  Inbox,
} from 'lucide-react';

export const NotificationBell = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isMobile } = useBreakpoint();

  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const { data: notificationsData, isLoading } = useNotificationsQuery(
    { page: 1, pageSize: 5 },
    { enabled: isOpen }
  );

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Tính toán vị trí dropdown khi mở (chỉ cho desktop)
  useEffect(() => {
    if (isOpen && buttonRef.current && !isMobile) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 384;
      const dropdownMaxHeight = 420;

      let left = rect.right + 8;

      if (left + dropdownWidth > window.innerWidth - 8) {
        left = rect.left - dropdownWidth - 8;
      }
      if (left < 8) {
        left = 8;
      }

      let top = rect.top;

      if (top + dropdownMaxHeight > window.innerHeight - 8) {
        top = window.innerHeight - dropdownMaxHeight - 8;
      }

      if (top < 8) {
        top = 8;
      }
      setDropdownPosition({
        top: top,
        left: left,
      });
    }
  }, [isOpen, isMobile]);

  // Đóng dropdown khi click bên ngoài (chỉ cho desktop)
  useEffect(() => {
    if (isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'grade_added':
        return <ClipboardCheck className="w-6 h-6 text-green-500" />;
      case 'grade_updated':
        return <PenLine className="w-6 h-6 text-blue-500" />;
      default:
        return <Info className="w-6 h-6 text-amber-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Notification list content (shared between mobile and desktop)
  const NotificationContent = () => (
    <>
      {isLoading ? (
        <div className="p-8 text-center text-sm text-edu-ink-light dark:text-edu-dark-muted">
          Đang tải...
        </div>
      ) : notificationsData && notificationsData.items.length > 0 ? (
        notificationsData.items.map((notification) => (
          <div
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            className={clsx(
              'border-b border-edu-border dark:border-edu-dark-border p-4 cursor-pointer',
              'transition-colors hover:bg-gray-50 dark:hover:bg-edu-dark-muted/30',
              !notification.isRead && 'bg-blue-50 dark:bg-blue-900/20'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={clsx(
                          'text-sm font-semibold',
                          !notification.isRead
                            ? 'text-edu-primary dark:text-edu-dark-accent'
                            : 'text-edu-ink dark:text-edu-dark-text'
                        )}
                      >
                        {notification.title}
                      </h4>
                      {notification.category &&
                        notification.category !== 'general' && (
                          <span
                            className={clsx(
                              'text-xs px-2 py-0.5 rounded-full',
                              notification.category === 'academic' &&
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                              notification.category === 'administrative' &&
                                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                              notification.category === 'event' &&
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                              notification.category === 'urgent' &&
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            )}
                          >
                            {notification.category === 'academic' && 'Học tập'}
                            {notification.category === 'administrative' &&
                              'Hành chính'}
                            {notification.category === 'event' && 'Sự kiện'}
                            {notification.category === 'urgent' && 'Khẩn cấp'}
                          </span>
                        )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(notification._id, e)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                    title="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-edu-ink-light dark:text-edu-dark-muted mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center">
          <Inbox className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-edu-ink-light dark:text-edu-dark-muted">
            Không có thông báo nào
          </p>
        </div>
      )}
    </>
  );

  // Footer content
  const FooterContent = () =>
    notificationsData && notificationsData.total > 5 ? (
      <Link
        to="/notifications"
        className="block text-center text-sm text-edu-primary dark:text-edu-dark-accent hover:underline py-2"
        onClick={handleClose}
      >
        Xem tất cả ({notificationsData.total})
      </Link>
    ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'relative p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
          'bg-white/10 hover:bg-white/20',
          'text-white',
          isCollapsed && 'w-full'
        )}
        title="Thông báo"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile: Bottom Sheet */}
      {isMobile && (
        <BottomSheet
          isOpen={isOpen}
          onClose={handleClose}
          title="Thông báo"
          footer={<FooterContent />}
        >
          {/* Header actions */}
          {notificationsData && notificationsData.items.length > 0 && (
            <div className="px-4 py-2 border-b border-edu-border dark:border-edu-dark-border">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-sm text-edu-primary dark:text-edu-dark-accent hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
          <NotificationContent />
        </BottomSheet>
      )}

      {/* Desktop: Dropdown */}
      {!isMobile &&
        isOpen &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/20 z-[9998]"
              onClick={handleClose}
              style={{
                animation: 'fadeIn 0.2s ease-out forwards',
              }}
            />
            {/* Dropdown */}
            <div
              ref={dropdownRef}
              className="fixed w-96 max-w-[calc(100vw-2rem)] nb-card shadow-lg z-[9999]"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                animation:
                  'slideInFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transformOrigin: 'left top',
              }}
            >
              <div className="flex items-center justify-between border-b border-edu-border dark:border-edu-dark-border p-4">
                <h3 className="font-semibold text-lg">Thông báo</h3>
                {notificationsData && notificationsData.items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-edu-primary dark:text-edu-dark-accent hover:underline"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                <NotificationContent />
              </div>

              {notificationsData && notificationsData.total > 5 && (
                <div className="border-t border-edu-border dark:border-edu-dark-border p-3 text-center">
                  <Link
                    to="/notifications"
                    className="text-sm text-edu-primary dark:text-edu-dark-accent hover:underline"
                    onClick={handleClose}
                  >
                    Xem tất cả ({notificationsData.total})
                  </Link>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
