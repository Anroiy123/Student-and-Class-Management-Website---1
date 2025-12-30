/**
 * Responsive System Constants
 * Centralized configuration for breakpoints and responsive utilities
 */

// Breakpoint values (in pixels)
export const BREAKPOINTS = {
  MOBILE: 640, // < 640px = mobile
  TABLET: 1024, // 640-1023px = tablet, >= 1024px = desktop
} as const;

// Breakpoint type
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// Touch target sizes (WCAG 2.1 AA compliance)
export const TOUCH_TARGET = {
  MIN_SIZE: 44, // Minimum touch target size in pixels
  MIN_SPACING: 8, // Minimum spacing between touch targets
} as const;

// Chart dimensions
export const CHART_HEIGHT = {
  MOBILE: 200,
  DESKTOP: 280,
} as const;

// Pager button counts per breakpoint
export const PAGER_MAX_BUTTONS = {
  MOBILE: 3,
  TABLET: 5,
  DESKTOP: 7,
} as const;

// Chart font sizes
export const CHART_FONT_SIZE = {
  MOBILE: {
    axis: 10,
    label: 10,
    legend: 11,
  },
  DESKTOP: {
    axis: 12,
    label: 12,
    legend: 12,
  },
} as const;

// Responsive config type
export interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
  };
  touchTarget: {
    minSize: number;
    minSpacing: number;
  };
  pager: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  chart: {
    mobileHeight: number;
    desktopHeight: number;
  };
}

// Default responsive config
export const RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: {
    mobile: BREAKPOINTS.MOBILE,
    tablet: BREAKPOINTS.TABLET,
  },
  touchTarget: {
    minSize: TOUCH_TARGET.MIN_SIZE,
    minSpacing: TOUCH_TARGET.MIN_SPACING,
  },
  pager: {
    mobile: PAGER_MAX_BUTTONS.MOBILE,
    tablet: PAGER_MAX_BUTTONS.TABLET,
    desktop: PAGER_MAX_BUTTONS.DESKTOP,
  },
  chart: {
    mobileHeight: CHART_HEIGHT.MOBILE,
    desktopHeight: CHART_HEIGHT.DESKTOP,
  },
};
