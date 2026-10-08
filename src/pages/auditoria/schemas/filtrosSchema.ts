import { z } from 'zod';
import type { ConsultaAuditoria } from '../models/evento';
import { finDia, inicioDia, rangoDesde, type RangoPreset } from '../utils/fechas';

export const RANGOS: RangoPreset[] = ['hoy', 'ultimos7', 'ultimos30', 'ultimos90', 'personalizado'];

export const filtrosSchema = z
  .object({
    accion: z.string(),
    persona: z.string(),
    modulo: z.string(),
    rango: z.enum(['hoy', 'ultimos7', 'ultimos30', 'ultimos90', 'personalizado']),
    desde: z.string(),
    hasta: z.string(),
    q: z.string().max(100, 'errors.maxLength|100'),
  })
  .superRefine((v, ctx) => {
    if (v.rango === 'personalizado' && v.desde && v.hasta && v.desde > v.hasta) {
      ctx.addIssue({ code: 'custom', path: ['hasta'], message: 'auditoria.errors.rango' });
    }
  });
export type FiltrosForm = z.infer<typeof filtrosSchema>;

export const filtrosIniciales: FiltrosForm = { accion: '', persona: '', modulo: '', rango: 'ultimos7', desde: '', hasta: '', q: '' };

/** Del formulario a la consulta. Un rango personalizado invertido se ignora hasta que se corrija (no se manda al servidor). */
export function aConsulta(v: FiltrosForm, hoy: string): ConsultaAuditoria {
  const base = { accion: v.accion, modulo: v.modulo, usuario_id: v.persona, q: v.q };
  if (v.rango !== 'personalizado') return { ...base, desde: inicioDia(rangoDesde(v.rango, hoy)), hasta: '' };
  if (v.desde && v.hasta && v.desde > v.hasta) return { ...base, desde: inicioDia(rangoDesde('ultimos7', hoy)), hasta: '' };
  return { ...base, desde: v.desde ? inicioDia(v.desde) : inicioDia(rangoDesde('ultimos7', hoy)), hasta: v.hasta ? finDia(v.hasta) : '' };
}
