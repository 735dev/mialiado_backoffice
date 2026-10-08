import { z } from 'zod';
import { emailSchema, requiredText } from '@/lib/utils/schemas';
import { FORMATOS, FRECUENCIAS, NIVELES, TIPOS, type CuerpoProgramado, type CuerpoReporte } from '../models/reporte';
import { finDia, inicioDia } from '../utils/format';

export const reporteSchema = z
  .object({
    tipo: z.enum(TIPOS),
    nombre: z.string().trim().max(120, 'errors.maxLength|120'),
    desde: z.string(),
    hasta: z.string(),
    categoria_id: z.string(),
    zona: z.string(),
    nivel: z.union([z.enum(NIVELES), z.literal('')]),
    columnas: z.array(z.string()).min(1, 'reportes.errors.columnas'),
    formato: z.enum(FORMATOS),
  })
  .superRefine((v, ctx) => {
    if (v.formato === 'pdf') ctx.addIssue({ code: 'custom', path: ['formato'], message: 'reportes.errors.pdf' });
    if (v.desde && v.hasta && v.desde > v.hasta) ctx.addIssue({ code: 'custom', path: ['hasta'], message: 'reportes.errors.rango' });
  });
export type ReporteForm = z.infer<typeof reporteSchema>;

export const reporteInicial: ReporteForm = {
  tipo: 'canjes',
  nombre: '',
  desde: '',
  hasta: '',
  categoria_id: '',
  zona: '',
  nivel: '',
  columnas: [],
  formato: 'xlsx',
};

export function aCuerpoReporte(v: ReporteForm): CuerpoReporte {
  return {
    tipo: v.tipo,
    nombre: v.nombre.trim() || undefined,
    desde: v.desde ? inicioDia(v.desde) : undefined,
    hasta: v.hasta ? finDia(v.hasta) : undefined,
    categoria_id: v.categoria_id ? Number(v.categoria_id) : undefined,
    zona: v.zona || undefined,
    nivel: v.nivel || undefined,
    columnas: v.columnas,
    formato: v.formato,
  };
}

export const programadoSchema = z
  .object({
    tipo: z.enum(TIPOS),
    nombre: requiredText(1, 120),
    formato: z.enum(FORMATOS),
    frecuencia: z.enum(FRECUENCIAS),
    dia: z.string(),
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'errors.invalid'),
    destinatario: emailSchema,
  })
  .superRefine((v, ctx) => {
    if (v.formato === 'pdf') ctx.addIssue({ code: 'custom', path: ['formato'], message: 'reportes.errors.pdf' });
    const dia = Number(v.dia);
    if (v.frecuencia === 'semanal' && (v.dia === '' || dia < 0 || dia > 6)) {
      ctx.addIssue({ code: 'custom', path: ['dia'], message: 'reportes.errors.dia' });
    }
    if (v.frecuencia === 'mensual' && (v.dia === '' || dia < 1 || dia > 28)) {
      ctx.addIssue({ code: 'custom', path: ['dia'], message: 'reportes.errors.dia' });
    }
  });
export type ProgramadoForm = z.infer<typeof programadoSchema>;

export const programadoInicial: ProgramadoForm = {
  tipo: 'canjes',
  nombre: '',
  formato: 'xlsx',
  frecuencia: 'semanal',
  dia: '0',
  hora: '08:00',
  destinatario: '',
};

export function aCuerpoProgramado(v: ProgramadoForm): CuerpoProgramado {
  return {
    tipo: v.tipo,
    nombre: v.nombre.trim(),
    formato: v.formato,
    frecuencia: v.frecuencia,
    dia: v.frecuencia === 'diario' ? undefined : Number(v.dia),
    hora: v.hora,
    destinatario: v.destinatario.trim(),
  };
}
