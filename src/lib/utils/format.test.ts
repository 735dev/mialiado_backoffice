import { describe, expect, it } from 'vitest';
import { avatarTone, formatDate, formatDateTime, formatInteger, formatMoney, formatShortDate, initials } from './format';

describe('format compartido', () => {
  it('dinero en USD por idioma, con 2 decimales y signo', () => {
    expect(formatMoney(9240, 'es')).toBe('$9.240,00');
    expect(formatMoney(9240, 'en')).toBe('$9,240.00');
    expect(formatMoney(-5, 'en')).toBe('-$5.00');
    expect(formatMoney(8, 'es', 0)).toBe('$8');
  });

  it('enteros con separador de miles tambien en 4 cifras', () => {
    expect(formatInteger(3912, 'es')).toBe('3.912');
    expect(formatInteger(3912, 'en')).toBe('3,912');
  });

  it('fechas: vacio o invalido devuelve el marcador', () => {
    expect(formatDate(null, 'es')).toBe('–');
    expect(formatDateTime('no-fecha', 'es', '—')).toBe('—');
    expect(formatShortDate('2026-10-08T15:00:00Z', 'en', '–', 'UTC')).toBe('Oct 8');
    expect(formatDateTime('2026-10-08T15:30:00Z', 'en', '–', 'UTC')).toMatch(/Oct 8,? 3:30\s?PM/);
  });

  it('iniciales y color estable', () => {
    expect(initials('Ana Perez')).toBe('AP');
    expect(initials('Cafe')).toBe('CA');
    expect(initials('Maria de los Angeles')).toBe('MA');
    expect(avatarTone('Ana')).toBe(avatarTone('Ana'));
  });
});
