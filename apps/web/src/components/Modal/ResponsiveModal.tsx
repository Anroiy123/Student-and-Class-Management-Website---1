import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBreakpoint } from '../../lib/responsive';

export interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Modal size on desktop (default: 'md') */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Responsive Modal Component
 * - Full-screen on mobile with sticky header/footer
 * - Centered modal with max-width on desktop
 * - Body scroll lock and Escape key handling
 */
export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ResponsiveModalProps) {
  const { isMobile } = useBreakpoint();
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap - focus modal when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Mobile: Full-screen modal
  if (isMobile) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex flex-col bg-edu-surface dark:bg-edu-dark-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={modalRef}
        tabIndex={-1}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-edu-border dark:border-edu-dark-border bg-edu-surface dark:bg-edu-dark-surface">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-edu-ink dark:text-edu-dark-text truncate pr-2"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-edu-muted dark:hover:bg-edu-dark-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Đóng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {/* Sticky Footer */}
        {footer && (
          <footer className="sticky bottom-0 z-10 px-4 py-3 border-t border-edu-border dark:border-edu-dark-border bg-edu-surface dark:bg-edu-dark-surface">
            {footer}
          </footer>
        )}
      </div>,
      document.body
    );
  }

  // Desktop: Centered modal with backdrop
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        style={{
          animation: 'fadeIn 0.2s ease-out forwards',
        }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          className={`w-full ${SIZE_CLASSES[size]} bg-edu-surface dark:bg-edu-dark-surface rounded-lg shadow-2xl flex flex-col max-h-[90vh]`}
          style={{
            animation: 'scaleIn 0.2s ease-out forwards',
          }}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-edu-border dark:border-edu-dark-border">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-edu-ink dark:text-edu-dark-text"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-edu-muted dark:hover:bg-edu-dark-muted transition-colors"
              aria-label="Đóng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <footer className="px-6 py-4 border-t border-edu-border dark:border-edu-dark-border">
              {footer}
            </footer>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>,
    document.body
  );
}
