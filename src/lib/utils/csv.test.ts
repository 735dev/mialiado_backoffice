import { describe, expect, it } from 'vitest';
import { csvCell, toCsv } from './csv';

describe('csv', () => {
  it('neutraliza celdas que Excel evaluaria como formula', () => {
    for (const peligro of ['=1+1', '+SUM(A1)', '-2+3', '@cmd', '\t=1']) {
      expect(csvCell(peligro).startsWith(`"'`)).toBe(true);
    }
  });
  it('deja intactos el texto normal y los numeros (incluso negativos)', () => {
    expect(csvCell('Cafe Luna')).toBe('"Cafe Luna"');
    expect(csvCell(-5)).toBe('"-5"');
  });
  it('escapa comillas y arma filas', () => {
    expect(toCsv([['a"b', 1], ['x', 'y']])).toBe('"a""b","1"\n"x","y"');
  });
});
