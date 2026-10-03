import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  /** Current active page (1-based index) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback fired when user selects or navigates to a new page */
  onPageChange: (page: number) => void;
  /** Optional total count of items across all pages */
  totalItems?: number;
  /** Number of items per page (default: 10) */
  limit?: number;
  /** Number of siblings on each side of the active page (default: 1) */
  siblingCount?: number;
  /** Whether to show the "Showing X to Y of Z" item count info (default: true) */
  showInfo?: boolean;
  /** Custom label for items, e.g. "teachers", "students", "records" (default: "records") */
  itemLabel?: string;
  /** Optional additional CSS classes for wrapper container */
  className?: string;
  /** Whether pagination controls are disabled (e.g. while loading) */
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  limit = 10,
  siblingCount = 1,
  showInfo = true,
  itemLabel = "records",
  className = "",
  disabled = false,
}) => {
  // Safe bounded page number
  const safePage = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)));

  // Calculate item range for information display
  const startItem =
    totalItems !== undefined && totalItems > 0
      ? (safePage - 1) * limit + 1
      : 0;
  const endItem =
    totalItems !== undefined
      ? Math.min(safePage * limit, totalItems)
      : safePage * limit;

  // Generate page numbers with ellipsis
  const paginationRange = useMemo<(number | string)[]>(() => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblingCount on each side + current + first + last + 2 ellipses

    // Case 1: If total pages is less than page slots
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(safePage - siblingCount, 1);
    const rightSiblingIndex = Math.min(safePage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: Only right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", lastPageIndex];
    }

    // Case 3: Only left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [safePage, totalPages, siblingCount]);

  // If there are no items and no pages, do not render controls
  if (totalPages <= 0 && (totalItems === undefined || totalItems === 0)) {
    return null;
  }

  const isFirstPage = safePage <= 1;
  const isLastPage = safePage >= totalPages;

  return (
    <div
      className={`px-5 py-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 ${className}`}
      aria-label="Pagination"
    >
      {/* Items Summary Info */}
      {showInfo && (
        <div className="text-slate-500 select-none">
          {totalItems !== undefined ? (
            totalItems > 0 ? (
              <span>
                Showing{" "}
                <strong className="text-slate-800 font-semibold">
                  {startItem}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-800 font-semibold">
                  {endItem}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-800 font-semibold">
                  {totalItems}
                </strong>{" "}
                {itemLabel}
              </span>
            ) : (
              <span>
                Showing{" "}
                <strong className="text-slate-800 font-semibold">0</strong>{" "}
                {itemLabel}
              </span>
            )
          ) : (
            <span>
              Page{" "}
              <strong className="text-slate-800 font-semibold">
                {safePage}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-800 font-semibold">
                {totalPages}
              </strong>
            </span>
          )}
        </div>
      )}

      {/* Pagination Navigation Controls */}
      {totalPages > 1 ? (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => !isFirstPage && !disabled && onPageChange(safePage - 1)}
            disabled={isFirstPage || disabled}
            aria-label="Previous page"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isFirstPage || disabled
                ? "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 cursor-pointer shadow-2xs"
            }`}
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Desktop Page Numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {paginationRange.map((pageNumber, idx) => {
              if (pageNumber === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-slate-400 select-none font-semibold text-xs tracking-widest"
                  >
                    ...
                  </span>
                );
              }

              const num = Number(pageNumber);
              const isActive = num === safePage;

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => !disabled && onPageChange(num)}
                  disabled={disabled}
                  aria-label={`Page ${num}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs cursor-default"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 cursor-pointer"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Mobile Current Page Indicator */}
          <div className="sm:hidden px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            {safePage} / {totalPages}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => !isLastPage && !disabled && onPageChange(safePage + 1)}
            disabled={isLastPage || disabled}
            aria-label="Next page"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isLastPage || disabled
                ? "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 cursor-pointer shadow-2xs"
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Pagination;
