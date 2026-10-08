import { Badge } from '@/components/ui/Badge';
import { useT } from '@/lib/hooks/useT';
import type { Prioridad } from '../models/ticket';

const TONO: Record<Prioridad, 'err' | 'warn' | 'neutral'> = { alta: 'err', media: 'warn', baja: 'neutral' };

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  const t = useT();
  return <Badge tone={TONO[prioridad]}>{t(`soporte.prioridad.${prioridad}`)}</Badge>;
}
