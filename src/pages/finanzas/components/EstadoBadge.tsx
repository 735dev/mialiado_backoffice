import { Badge } from '@/components/ui/Badge';
import { useT } from '@/lib/hooks/useT';
import type { EstadoRecarga } from '../models/finanzas';

const TONE = { pendiente: 'warn', acreditada: 'ok', rechazada: 'err', reembolsada: 'neutral' } as const;

export function EstadoBadge({ estado }: { estado: EstadoRecarga }) {
  const t = useT();
  return <Badge tone={TONE[estado] ?? 'neutral'}>{t(`finanzas.estado.${estado}`)}</Badge>;
}
