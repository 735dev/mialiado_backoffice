import { FileText, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { cn } from '@/lib/utils/cn';
import { BandejaTickets } from '../components/BandejaTickets';
import { DetalleTicket } from '../components/DetalleTicket';
import { NuevoTicketModal } from '../components/NuevoTicketModal';
import { PlantillasModal } from '../components/PlantillasModal';
import { useBandeja } from '../hooks/useBandeja';
import { usePlantillasRespuesta } from '../hooks/useCatalogos';
import type { PlantillaRespuesta } from '../models/ticket';

export const routeName = PATHS.soporte;

// B13 · Soporte: bandeja paginada a la izquierda, conversacion a la derecha (en movil, una a la vez).
export default function SoporteView() {
  const t = useT();
  const { puede } = useAuth();
  const [params, setParams] = useSearchParams();
  const esEscritorio = useMediaQuery('(min-width: 768px)');
  const bandeja = useBandeja();
  const plantillas = usePlantillasRespuesta();
  const [verPlantillas, setVerPlantillas] = useState(false);
  const [nuevo, setNuevo] = useState(false);
  const [insertar, setInsertar] = useState<{ texto: string; n: number } | null>(null);
  const [abiertos, setAbiertos] = useState<ReadonlySet<number>>(new Set());

  const elegido = Number(params.get('ticket')) || null;
  // En escritorio, sin eleccion se muestra el primer ticket de la bandeja (como el prototipo).
  const activo = elegido ?? (esEscritorio ? (bandeja.items[0]?.id ?? null) : null);
  const leidos = useMemo(() => (activo === null ? abiertos : new Set([...abiertos, activo])), [abiertos, activo]);
  const puedeAbrirTicket = puede('soporte', 'editar') && puede('usuarios', 'ver');

  const seleccionar = (id: number) => {
    setAbiertos((prev) => new Set(prev).add(id));
    setParams({ ticket: String(id) });
  };
  const usar = (p: PlantillaRespuesta) => setInsertar((prev) => ({ texto: p.cuerpo, n: (prev?.n ?? 0) + 1 }));

  return (
    <section className="flex flex-col gap-5" data-screen="B13">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('soporte.title')}</h1>
          <p className="mt-1 text-ink-muted">{t('soporte.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="md" onClick={() => setVerPlantillas(true)}>
            <FileText size={16} aria-hidden="true" />
            {t('soporte.templates.open')}
          </Button>
          {puedeAbrirTicket && (
            <Button size="md" onClick={() => setNuevo(true)}>
              <Plus size={16} aria-hidden="true" />
              {t('soporte.newTicket.open')}
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-col items-stretch gap-5 md:flex-row">
        <BandejaTickets
          bandeja={bandeja}
          selectedId={activo}
          leidos={leidos}
          onSelect={seleccionar}
          className={elegido ? 'hidden md:flex md:w-[408px] md:flex-none' : 'md:w-[408px] md:flex-none'}
        />
        <DetalleTicket
          ticketId={activo}
          plantillas={plantillas}
          insertar={insertar}
          onChanged={bandeja.reload}
          onBack={() => setParams({})}
          className={cn(elegido ? 'flex-1' : 'hidden flex-1 md:flex')}
        />
      </div>

      <PlantillasModal open={verPlantillas} onOpenChange={setVerPlantillas} plantillas={plantillas} canUse={activo !== null && puede('soporte', 'editar')} onUse={usar} />
      <NuevoTicketModal
        open={nuevo}
        onOpenChange={setNuevo}
        onCreated={() => {
          bandeja.setTab('abiertos');
          bandeja.reload();
        }}
      />
    </section>
  );
}
