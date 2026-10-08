import { createElement, type ReactElement } from 'react';
import { Coffee, Gamepad2, Globe, Heart, Percent, ShoppingBag, Sparkles, Star, Store, Tag, Ticket, Utensils, Zap, type LucideIcon } from 'lucide-react';

/** Iconos elegibles (los 12 del prototipo). El backend guarda el nombre en `icono`. */
export const ICONOS: Record<string, LucideIcon> = {
  store: Store,
  ticket: Ticket,
  heart: Heart,
  star: Star,
  bolt: Zap,
  sparkle: Sparkles,
  percent: Percent,
  globe: Globe,
  utensils: Utensils,
  bag: ShoppingBag,
  cup: Coffee,
  gamepad: Gamepad2,
};

export const ICONO_NOMBRES = Object.keys(ICONOS);

/** Icono de una categoria como elemento; si no tiene o es desconocido, una etiqueta generica. */
export function renderIcono(nombre: string | null | undefined, size = 18): ReactElement {
  return createElement((nombre && ICONOS[nombre]) || Tag, { size, 'aria-hidden': true });
}
