/**
 * Calculate visible page numbers with ellipsis
 * Always shows first and last page when truncated
 */

export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function calculateVisiblePages(
  currentPage: number,
  totalPages: number,
  maxButtons: number
): PageItem[] {
  // If total pages fit within max buttons, show all
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: PageItem[] = [];
  const sideButtons = Math.floor((maxButtons - 3) / 2); // -3 for first, last, and current

  // Always include first page
  pages.push(1);

  // Calculate start and end of middle section
  let start = Math.max(2, currentPage - sideButtons);
  let end = Math.min(totalPages - 1, currentPage + sideButtons);

  // Adjust if we're near the beginning
  if (currentPage <= sideButtons + 2) {
    start = 2;
    end = Math.min(totalPages - 1, maxButtons - 2);
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - sideButtons - 1) {
    start = Math.max(2, totalPages - maxButtons + 3);
    end = totalPages - 1;
  }

  // Add ellipsis before middle section if needed
  if (start > 2) {
    pages.push('ellipsis-start');
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis after middle section if needed
  if (end < totalPages - 1) {
    pages.push('ellipsis-end');
  }

  // Always include last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
