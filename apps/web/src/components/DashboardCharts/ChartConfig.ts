/**
 * Responsive Chart Configuration
 * Centralized config for chart dimensions, fonts, and responsive behavior
 */
import {
  CHART_HEIGHT,
  CHART_FONT_SIZE,
  type Breakpoint,
} from '../../lib/responsive';

export interface ResponsiveChartConfig {
  height: number;
  fontSize: {
    axis: number;
    label: number;
    legend: number;
  };
  legendPosition: 'right' | 'bottom';
  showInlineLabels: boolean;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Get chart configuration based on breakpoint
 */
export function getChartConfig(
  breakpoint: Breakpoint,
  options?: {
    /** Number of data segments (for pie charts) */
    segmentCount?: number;
    /** Custom height override */
    customHeight?: number;
  }
): ResponsiveChartConfig {
  const isMobile = breakpoint === 'mobile';
  const segmentCount = options?.segmentCount ?? 0;

  // Base height from constants
  const baseHeight = options?.customHeight
    ? options.customHeight
    : isMobile
      ? CHART_HEIGHT.MOBILE
      : CHART_HEIGHT.DESKTOP;

  // Font sizes from constants
  const fontSizes = isMobile ? CHART_FONT_SIZE.MOBILE : CHART_FONT_SIZE.DESKTOP;

  // For pie charts with many segments on mobile, hide inline labels
  const showInlineLabels = !(isMobile && segmentCount > 4);

  // Legend position: bottom on mobile, right on desktop
  const legendPosition = isMobile ? 'bottom' : 'right';

  // Margins adjusted for mobile
  const margin = isMobile
    ? { top: 10, right: 10, bottom: 10, left: 0 }
    : { top: 10, right: 10, bottom: 20, left: 0 };

  return {
    height: baseHeight,
    fontSize: fontSizes,
    legendPosition,
    showInlineLabels,
    margin,
  };
}

/**
 * Get dynamic chart height based on data count
 * Useful for bar charts with variable number of items
 */
export function getDynamicChartHeight(
  breakpoint: Breakpoint,
  itemCount: number,
  options?: {
    minHeight?: number;
    heightPerItem?: number;
  }
): number {
  const isMobile = breakpoint === 'mobile';

  const minHeight = options?.minHeight ?? (isMobile ? 200 : 250);
  const heightPerItem = options?.heightPerItem ?? (isMobile ? 30 : 35);

  return Math.max(minHeight, itemCount * heightPerItem);
}

/**
 * Abbreviate labels for mobile display
 */
export function abbreviateLabel(
  label: string,
  breakpoint: Breakpoint,
  maxLength = 10
): string {
  if (breakpoint !== 'mobile') return label;

  // Common abbreviations for Vietnamese grade labels
  const abbreviations: Record<string, string> = {
    'Xuất sắc': 'XS',
    'Giỏi': 'Giỏi',
    'Khá': 'Khá',
    'Trung bình': 'TB',
    'Yếu': 'Yếu',
    'Kém': 'Kém',
  };

  // Check for known abbreviations
  for (const [full, abbr] of Object.entries(abbreviations)) {
    if (label.includes(full)) {
      return abbr;
    }
  }

  // Truncate if too long
  if (label.length > maxLength) {
    return label.substring(0, maxLength - 1) + '…';
  }

  return label;
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, breakpoint: Breakpoint): string {
  const percent = (value * 100).toFixed(0);
  return breakpoint === 'mobile' ? `${percent}%` : `${percent}%`;
}
