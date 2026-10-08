import { REGLA_KEYS, type Nivel, type Reglas, type ReglaKey, type ReglasPayload, type VistaPrevia } from '../models/reglas';
import type { ReglasFormValues } from '../schemas/reglas';

export const sortNiveles = (niveles: Nivel[]): Nivel[] => [...niveles].sort((a, b) => a.orden - b.orden);

/** Valores iniciales del formulario a partir de lo publicado. `hasta` de un tramo = `desde` del siguiente - 1. */
export function toFormValues(r: Reglas): ReglasFormValues {
  const [n0, n1, n2] = sortNiveles(r.niveles);
  const { reglas } = r;
  return {
    hasta0: (n1?.desde ?? 1) - 1,
    hasta1: (n2?.desde ?? 2) - 1,
    extra0: n0?.puntos_extra ?? 0,
    extra1: n1?.puntos_extra ?? 0,
    extra2: n2?.puntos_extra ?? 0,
    ventana_anulacion_min: reglas.ventana_anulacion_min,
    descuento_max_pct: reglas.descuento_max_pct,
    recarga_minima: reglas.recarga_minima,
    compras_mes_mantener: reglas.compras_mes_mantener,
    dias_baja_nivel: reglas.dias_baja_nivel,
    moderacion_previa: reglas.moderacion_previa,
    puja_minima: reglas.puja_minima,
    qr_vigencia_seg: reglas.qr_vigencia_seg,
  };
}

const sameNum = (a: number, b: number) => Math.abs(a - b) < 1e-9;

export interface Cambios {
  /** Reglas sueltas modificadas. */
  reglas: ReglaKey[];
  /** Algun nivel (tramo o puntos extra) cambio. */
  niveles: boolean;
  /** Cuantos cambios ve la persona: reglas + 1 si cambio algun nivel. */
  total: number;
}

/** Que difiere del borrador respecto a lo publicado. */
export function diffCambios(values: ReglasFormValues, publicado: Reglas): Cambios {
  const base = toFormValues(publicado);
  const reglas = REGLA_KEYS.filter((k) => {
    const a = values[k];
    const b = base[k];
    return typeof a === 'number' && typeof b === 'number' ? !sameNum(a, b) : a !== b;
  });
  const niveles = (['hasta0', 'hasta1', 'extra0', 'extra1', 'extra2'] as const).some((k) => !sameNum(values[k], base[k]));
  return { reglas, niveles, total: reglas.length + (niveles ? 1 : 0) };
}

/** Body de PUT /reglas con solo lo cambiado. Los niveles viajan completos y en orden (el backend los exige asi). */
export function buildPayload(values: ReglasFormValues, publicado: Reglas, resumen?: string): ReglasPayload {
  const cambios = diffCambios(values, publicado);
  const payload: ReglasPayload = {};
  for (const k of cambios.reglas) (payload as Record<string, unknown>)[k] = values[k];
  if (cambios.niveles) {
    const [n0, n1, n2] = sortNiveles(publicado.niveles);
    payload.niveles = [
      { codigo: String(n0?.codigo), desde: 0, puntos_extra: values.extra0 },
      { codigo: String(n1?.codigo), desde: values.hasta0 + 1, puntos_extra: values.extra1 },
      { codigo: String(n2?.codigo), desde: values.hasta1 + 1, puntos_extra: values.extra2 },
    ];
  }
  const text = resumen?.trim();
  if (text) payload.resumen = text;
  return payload;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface PreviaNivel {
  nivel: string;
  descuento_pct: number;
  precio: number;
}
export interface PreviaCalculada {
  precioNormal: number;
  niveles: PreviaNivel[];
  flash: { descuento_pct: number; precio: number; ganaFlash: boolean };
}

/**
 * Vista previa del efecto del borrador: descuento del nivel = descuento base + puntos extra del nivel; y con una
 * Promo Flash gana la de mayor ahorro. Reproduce la formula del backend sobre lo que se esta editando.
 */
export function calcularPrevia(values: ReglasFormValues, publicado: Reglas): PreviaCalculada {
  const vp: VistaPrevia = publicado.vista_previa;
  const extras = [values.extra0, values.extra1, values.extra2];
  const niveles = sortNiveles(publicado.niveles).map((n, i) => {
    const pct = vp.descuento_base + (extras[i] ?? 0);
    return { nivel: String(n.codigo), descuento_pct: pct, precio: round2(vp.precio_normal * (1 - pct / 100)) };
  });
  const pro = niveles[1] ?? niveles[0];
  const flashPct = vp.ejemplo_flash.descuento_pct;
  const best = Math.max(flashPct, pro?.descuento_pct ?? 0);
  return {
    precioNormal: vp.precio_normal,
    niveles,
    flash: { descuento_pct: flashPct, precio: round2(vp.precio_normal * (1 - best / 100)), ganaFlash: flashPct >= (pro?.descuento_pct ?? 0) },
  };
}
