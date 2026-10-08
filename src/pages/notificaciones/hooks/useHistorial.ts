import { useMemo, useState } from 'react';
import { usePagination } from '@/lib/hooks/usePagination';
import type { Notificacion, TabHistorial } from '../models/notificacion';
import { listarNotificaciones } from '../providers/notificacionesProvider';

export function useHistorial() {
  const [tab, setTab] = useState<TabHistorial>('todos');
  const initialParams = useMemo(() => ({ tab }), [tab]);
  const pagination = usePagination<Notificacion, { tab: TabHistorial }>({ fetcher: listarNotificaciones, initialParams });
  return { ...pagination, tab, setTab };
}
