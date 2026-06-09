interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-[#eefaf5] px-4 py-3 text-sm font-semibold text-slate-500">
      <button
        className="rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-500 shadow-sm transition hover:text-mint-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        type="button"
      >
        上一页
      </button>
      <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-white/80 p-1">
        {pages.map((page, index) => (
          page === 'ellipsis' ? (
            <span className="px-1.5 text-xs font-bold text-slate-300" key={`ellipsis-${index}`}>...</span>
          ) : (
            <button
              aria-label={`跳转到第${page}页`}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${page === currentPage ? 'bg-mint-500 text-white shadow-sm' : 'text-slate-500 hover:bg-mint-50 hover:text-mint-600'}`}
              key={page}
              onClick={() => onChange(page)}
              type="button"
            >
              {page}
            </button>
          )
        ))}
      </div>
      <button
        className="rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-500 shadow-sm transition hover:text-mint-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        type="button"
      >
        下一页
      </button>
    </div>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const visiblePages: Array<number | 'ellipsis'> = [];
  const candidates = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = Array.from(candidates)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      visiblePages.push('ellipsis');
    }
    visiblePages.push(page);
  });

  return visiblePages;
}
