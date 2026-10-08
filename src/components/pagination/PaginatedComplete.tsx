import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';

interface PaginatedCompleteProps {
  page: number;
  limit: number;
  total: number;
  links: { next: string | null; previous: string | null };
  onPageChange: (page: number) => void;
}

/** Numeros de pagina con "..." cuando hay muchas (siempre primera, ultima y vecinas de la actual). */
export function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const keep = new Set([1, totalPages, page - 1, page, page + 1]);
  const result: (number | 'gap')[] = [];
  let last = 0;
  for (const p of [...keep].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)) {
    if (p - last > 1) result.push('gap');
    result.push(p);
    last = p;
  }
  return result;
}

const NAV = 'flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-e1 disabled:opacity-40';

export function PaginatedComplete({ page, limit, total, links, onPageChange }: PaginatedCompleteProps) {
  const t = useT();
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <nav aria-label={t('pagination.page', { page, total: totalPages })} className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        className={NAV}
        aria-label={t('pagination.previous')}
        disabled={!links.previous}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        <ChevronLeft size={20} />
      </button>
      {pageWindow(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-ink-muted">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={cn(
              'h-11 min-w-11 rounded-full px-3 text-sm font-bold',
              p === page ? 'bg-ink text-bg' : 'text-ink hover:bg-surface-2',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={NAV}
        aria-label={t('pagination.next')}
        disabled={!links.next}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
}
