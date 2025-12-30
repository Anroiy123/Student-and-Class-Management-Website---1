/**
 * Responsive System
 * Centralized exports for responsive utilities
 */

// Constants
export {
  BREAKPOINTS,
  TOUCH_TARGET,
  CHART_HEIGHT,
  CHART_FONT_SIZE,
  PAGER_MAX_BUTTONS,
  RESPONSIVE_CONFIG,
  type Breakpoint,
  type ResponsiveConfig,
} from './constants';

// Hooks
export { useBreakpoint, getBreakpoint, type BreakpointState } from './useBreakpoint';
