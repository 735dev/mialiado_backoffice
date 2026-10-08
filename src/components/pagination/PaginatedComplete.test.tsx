import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { PaginatedComplete, pageWindow } from './PaginatedComplete';

describe('pageWindow', () => {
  it('muestra todas las paginas si son pocas', () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it('colapsa con huecos si son muchas', () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, 'gap', 20]);
    expect(pageWindow(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
    expect(pageWindow(20, 20)).toEqual([1, 'gap', 19, 20]);
  });
});

describe('PaginatedComplete', () => {
  it('no pinta nada sin resultados', () => {
    const { container } = render(<div />);
    renderWithProviders(<PaginatedComplete page={1} limit={10} total={0} links={{ next: null, previous: null }} onPageChange={() => 0} />);
    expect(container.querySelector('nav')).toBeNull();
  });

  it('navega con anterior/siguiente segun links', async () => {
    const onPageChange = vi.fn();
    renderWithProviders(
      <PaginatedComplete page={2} limit={10} total={30} links={{ next: 'n', previous: 'p' }} onPageChange={onPageChange} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('deshabilita anterior en la primera pagina', () => {
    renderWithProviders(
      <PaginatedComplete page={1} limit={10} total={30} links={{ next: 'n', previous: null }} onPageChange={() => 0} />,
    );
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });
});
