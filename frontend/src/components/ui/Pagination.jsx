import { ChevronLeft, ChevronRight } from "lucide-react";

// 1 … 4 5 6 … 10
const getPageNumbers = (page, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap-" + p, p] : [p]));
};

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageButton = "min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={`${pageButton} text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        <ChevronLeft size={18} className="mx-auto" />
      </button>

      {getPageNumbers(page, totalPages).map((p) =>
        typeof p === "string" ? (
          <span key={p} className="hidden sm:inline px-1 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${pageButton} hidden sm:block ${
              p === page ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <span className="sm:hidden px-2 text-sm text-gray-600">
        {page} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={`${pageButton} text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        <ChevronRight size={18} className="mx-auto" />
      </button>
    </nav>
  );
}

export default Pagination;
