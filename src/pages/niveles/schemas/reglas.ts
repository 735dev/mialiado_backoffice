import { z } from 'zod';

const num = () => z.number({ required_error: 'errors.required', invalid_type_error: 'errors.required' });
const entero = (min: number, max: number) =>
  num()
    .int('niveles.errors.entero')
    .min(min, `niveles.errors.min|${min}`)
    .max(max, `niveles.errors.max|${max}`);
const monto = (min: number, max: number) => num().min(min, `niveles.errors.min|${min}`).max(max, `niveles.errors.max|${max}`);

/**
 * Formulario de B10. En los niveles se edita el tope de cada tramo ("Hasta"): el "Desde" del siguiente es ese tope + 1,
 * asi los tramos son siempre contiguos y `desde` crece estrictamente (regla del backend).
 * Los mensajes son claves i18n de la feature (`niveles.errors.*`) o comunes (`errors.*`).
 */
export const reglasSchema = z
  .object({
    hasta0: entero(0, 100000),
    hasta1: entero(0, 100000),
    extra0: entero(0, 1000),
    extra1: entero(0, 1000),
    extra2: entero(0, 1000),
    ventana_anulacion_min: entero(1, 1440),
    descuento_max_pct: entero(1, 100),
    recarga_minima: monto(0.01, 100000),
    compras_mes_mantener: entero(0, 1000),
    dias_baja_nivel: entero(1, 3650),
    moderacion_previa: z.boolean(),
    puja_minima: monto(0, 100000),
    qr_vigencia_seg: entero(10, 3600),
  })
  .refine((v) => v.hasta1 > v.hasta0, { path: ['hasta1'], message: 'niveles.errors.hastaMayor' });

export type ReglasFormValues = z.infer<typeof reglasSchema>;
