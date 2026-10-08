import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AliLogo } from './icons';

describe('AliLogo', () => {
  it('cada instancia usa su propio id de degradado (varias en la misma pagina)', () => {
    const { container } = render(
      <>
        <AliLogo />
        <AliLogo />
      </>,
    );
    const ids = [...container.querySelectorAll('radialGradient')].map((g) => g.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    container.querySelectorAll('circle').forEach((c, i) => expect(c.getAttribute('fill')).toBe(`url(#${ids[i]})`));
  });
});
