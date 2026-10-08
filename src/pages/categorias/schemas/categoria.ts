import { z } from 'zod';
import { requiredText } from '@/lib/utils/schemas';

/** Edicion de una categoria existente. `posicion` es 1-based dentro de sus hermanos (maximo = cantidad de hermanos). */
export const editarSchema = (max: number) =>
  z.object({
    nombre: requiredText(2, 60),
    icono: z.string(),
    posicion: z
      .number({ required_error: 'errors.required', invalid_type_error: 'errors.required' })
      .int('categorias.errors.entero')
      .min(1, 'categorias.errors.posicion|1')
      .max(Math.max(1, max), `categorias.errors.posicionMax|${Math.max(1, max)}`),
    visible: z.boolean(),
  });
export type EditarValues = z.infer<ReturnType<typeof editarSchema>>;

/** Alta: `parent_id` vacio = categoria principal. */
export const crearSchema = z.object({
  nombre: requiredText(2, 60),
  icono: z.string(),
  parent_id: z.union([z.number(), z.literal('')]),
  visible: z.boolean(),
});
export type CrearValues = z.infer<typeof crearSchema>;
