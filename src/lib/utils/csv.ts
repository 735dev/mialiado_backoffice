import { guardarArchivo } from './descarga';

/**
 * Celda CSV segura. Si empieza con = + - @ (o tabulador / retorno) Excel y Sheets la evaluan como formula
 * (CSV injection): se antepone un apostrofo para que se lea como texto. Los numeros se dejan tal cual.
 */
export function csvCell(v: string | number): string {
  const text = String(v);
  const seguro = typeof v === 'string' && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${seguro.replace(/"/g, '""')}"`;
}

/** CSV (cabecera + filas) listo para descargar. */
export function toCsv(rows: Array<Array<string | number>>): string {
  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

/** Descarga un CSV generado en el navegador (sin pasar por la red). BOM para que Excel respete los acentos. */
export function downloadCsv(filename: string, content: string): void {
  guardarArchivo(new Blob(['﻿', content], { type: 'text/csv;charset=utf-8' }), filename);
}
