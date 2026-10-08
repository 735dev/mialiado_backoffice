import { describe, expect, it } from 'vitest';
import { esUrlHttp } from './url';

describe('esUrlHttp', () => {
  it('acepta http(s)', () => {
    expect(esUrlHttp('https://x.com/a.pdf')).toBe(true);
    expect(esUrlHttp('http://x.com')).toBe(true);
  });
  it('rechaza esquemas peligrosos, texto y vacios', () => {
    for (const v of ['javascript:alert(1)', 'data:text/html,hola', 'file:///etc/passwd', 'documento.pdf', '', null, undefined]) {
      expect(esUrlHttp(v)).toBe(false);
    }
  });
});
