import { z } from 'zod';

/** Piezas Zod reutilizables; los mensajes son claves i18n de lib/i18n/locales. */
export const requiredText = (min = 1, max = 120) =>
  z
    .string({ required_error: 'errors.required' })
    .trim()
    .min(min, min <= 1 ? 'errors.required' : `errors.minLength|${min}`)
    .max(max, `errors.maxLength|${max}`);

export const emailSchema = z.string({ required_error: 'errors.required' }).trim().min(1, 'errors.required').email('errors.email');

/** 8+ caracteres, una mayuscula y un numero (reglas del backend para contrasenas del equipo). */
export const passwordSchema = z
  .string({ required_error: 'errors.required' })
  .min(8, 'errors.passwordRule')
  .regex(/[A-Z]/, 'errors.passwordRule')
  .regex(/\d/, 'errors.passwordRule');
