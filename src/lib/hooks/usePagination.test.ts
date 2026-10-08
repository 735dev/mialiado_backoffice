import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type { ApiResult, Paginated } from '@/lib/api/types';
import { usePagination } from './usePagination';

const notifyFromApiError = vi.fn();
vi.mock('@/lib/utils/notify', () => ({ notify: { fromApiError: (e: unknown) => notifyFromApiError(e) } }));

const DATA = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

async function fetcher(p: { page: number; limit: number; q?: string }): Promise<ApiResult<Paginated<{ id: number }>>> {
  const rows = p.q ? DATA.filter((d) => String(d.id).includes(p.q as string)) : DATA;
  const start = (p.page - 1) * p.limit;
  return {
    ok: true,
    data: {
      data: rows.slice(start, start + p.limit),
      total: rows.length,
      page: p.page,
      limit: p.limit,
      links: { next: start + p.limit < rows.length ? 'n' : null, previous: p.page > 1 ? 'p' : null },
    },
  };
}

describe('usePagination', () => {
  it('carga la pagina 1 con page y limit', async () => {
    const spy = vi.fn(fetcher);
    const { result } = renderHook(() => usePagination({ fetcher: spy, initialParams: {}, initialLimit: 10 }));
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(spy).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result.current.items).toHaveLength(10);
    expect(result.current.total).toBe(25);
  });

  it('cambia de pagina', async () => {
    const { result } = renderHook(() => usePagination({ fetcher, initialParams: {}, initialLimit: 10 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.page).toBe(3));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toHaveLength(5);
    expect(result.current.hasMore).toBe(false);
  });

  it('vuelve a la pagina 1 cuando cambian los filtros', async () => {
    const { result, rerender } = renderHook(({ q }) => usePagination({ fetcher, initialParams: { q }, initialLimit: 10 }), {
      initialProps: { q: '' },
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    rerender({ q: '1' });
    await waitFor(() => expect(result.current.page).toBe(1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.total).toBe(DATA.filter((d) => String(d.id).includes('1')).length);
  });

  it('modo append acumula con loadMore', async () => {
    const { result } = renderHook(() => usePagination({ fetcher, initialParams: {}, initialLimit: 10, mode: 'append' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(20));
  });

  it('avisa con notify.fromApiError si falla y conserva lo cargado', async () => {
    const failing = vi.fn().mockResolvedValue({ ok: false, status: 500, title: 't', detail: 'd' });
    const { result } = renderHook(() => usePagination({ fetcher: failing, initialParams: {} }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(notifyFromApiError).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }));
    expect(result.current.items).toEqual([]);
  });

  it('no consulta si enabled es false', () => {
    const spy = vi.fn(fetcher);
    const { result } = renderHook(() => usePagination({ fetcher: spy, initialParams: {}, enabled: false }));
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});
