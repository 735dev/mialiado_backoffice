import { cn } from './cn';

describe('cn', () => {
  it('conserva el tamano al combinarlo con un color text-*', () => {
    expect(cn('text-sm', 'text-ink')).toBe('text-sm text-ink');
  });

  it('la ultima clase en conflicto gana y se ignoran los falsos', () => {
    expect(cn('text-sm', 'text-base')).toBe('text-base');
    const off = Math.random() > 2;
    expect(cn('p-2', off && 'p-4', undefined, 'p-3')).toBe('p-3');
  });
});
