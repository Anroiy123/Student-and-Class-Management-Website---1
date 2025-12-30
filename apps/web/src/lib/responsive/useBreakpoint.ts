/**
 * useBreakpoint Hook
 * Provides responsive breakpoint state using matchMedia API
 * with debounced updates for better performance
 */
import { useState, useEffect, useMemo } from 'react';
import { BREAKPOINTS, type Breakpoint } from './constants';

export interface BreakpointState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 100;

/**
 * Get current breakpoint based on width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.MOBILE) return 'mobile';
  if (width < BREAKPOINTS.TABLET) return 'tablet';
  return 'desktop';
}

/**
 * Get initial width (SSR-safe)
 */
function getInitialWidth(): number {
  if (typeof window === 'undefined') return BREAKPOINTS.TABLET; // Default to desktop for SSR
  return window.innerWidth;
}

/**
 * Custom hook to detect current breakpoint
 * Uses matchMedia API for better performance
 * Returns breakpoint state with boolean flags for each breakpoint
 */
export function useBreakpoint(): BreakpointState {
  const [width, setWidth] = useState(getInitialWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial width on mount (for SSR hydration)
    setWidth(window.innerWidth);

    // Create media query listeners
    const mobileQuery = window.matchMedia(
      `(max-width: ${BREAKPOINTS.MOBILE - 1}px)`
    );
    const tabletQuery = window.matchMedia(
      `(min-width: ${BREAKPOINTS.MOBILE}px) and (max-width: ${BREAKPOINTS.TABLET - 1}px)`
    );

    // Debounced resize handler
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const debouncedResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, DEBOUNCE_DELAY);
    };

    // Media query change handlers (more efficient than resize)
    const handleMediaChange = () => {
      debouncedResize();
    };

    // Add listeners
    mobileQuery.addEventListener('change', handleMediaChange);
    tabletQuery.addEventListener('change', handleMediaChange);
    window.addEventListener('resize', debouncedResize);

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      mobileQuery.removeEventListener('change', handleMediaChange);
      tabletQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // Memoize the return value
  const state = useMemo<BreakpointState>(() => {
    const breakpoint = getBreakpoint(width);
    return {
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      width,
    };
  }, [width]);

  return state;
}

/**
 * Utility function to get breakpoint from width (for testing)
 */
export { getBreakpoint };
