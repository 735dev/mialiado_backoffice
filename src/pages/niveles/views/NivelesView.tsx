import { useMemo, useState } from 'react';
import { Form } from '@/components/form/Form';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { NivelesCard } from '../components/NivelesCard';
import { PreviaCard } from '../components/PreviaCard';
import { PublishBar } from '../components/PublishBar';
import { ReglasCard } from '../components/ReglasCard';
import { VersionesCard } from '../components/VersionesCard';
import { useReglas } from '../hooks/useReglas';
import { useReglasEditor } from '../hooks/useReglasEditor';
import type { Reglas, Version } from '../models/reglas';
import { calcularPrevia, sortNiveles } from '../utils/reglas';

export const routeName = PATHS.niveles;

function Header({ onHistorial }: { onHistorial?: () => void }) {
  const t = useT();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{t('nav.group.configuracion')} · B10</p>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('niveles.title')}</h1>
        <p className="text-ink-muted">{t('niveles.subtitle')}</p>
      </div>
      {onHistorial && (
        <Button size="md" variant="secondary" onClick={onHistorial}>
          {t('niveles.verHistorial')}
        </Button>
      )}
    </header>
  );
}

/** Editor de B10 con los datos ya cargados: borrador (RHF + Zod), vista previa en vivo, versiones y publicacion. */
function Editor({ data, reload }: { data: Reglas; reload: () => void }) {
  const t = useT();
  const { puede, user } = useAuth();
  const canEdit = puede('niveles_reglas', 'editar');
  const editor = useReglasEditor(data, reload);
  const [resumen, setResumen] = useState('');
  const [restaurar, setRestaurar] = useState<Version | null>(null);
  const [historial, setHistorial] = useState(false);

  const niveles = useMemo(() => sortNiveles(data.niveles), [data.niveles]);
  const previa = useMemo(() => calcularPrevia(editor.values, data), [editor.values, data]);
  const hayBorrador = editor.cambios.total > 0;

  const abrirHistorial = () => {
    setHistorial(true);
    document.getElementById('historial')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Header onHistorial={abrirHistorial} />
      <Form methods={editor.form} onSubmit={editor.solicitarPublicar} className="gap-6" aria-label={t('niveles.title')}>
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-6">
            <NivelesCard niveles={niveles} values={editor.values} disabled={!canEdit} />
            <ReglasCard publicado={data} values={editor.values} disabled={!canEdit} />
          </div>
          <div className="flex min-w-0 flex-col gap-6">
            <PreviaCard previa={previa} niveles={niveles} borrador={hayBorrador} />
            <VersionesCard
              versiones={data.versiones}
              actual={data.version}
              borrador={hayBorrador ? { version: data.version + 1, autor: user?.nombre ?? '' } : null}
              canRestore={canEdit}
              onRestore={setRestaurar}
              expanded={historial}
              onExpandedChange={setHistorial}
            />
          </div>
        </div>
        {canEdit && <PublishBar cambios={editor.cambios.total} busy={editor.busy} onDiscard={editor.descartar} />}
      </Form>

      <ConfirmDialog
        open={editor.pending !== null}
        title={t('niveles.publicar.confirmarTitulo')}
        description={t('niveles.publicar.confirmarTexto', { n: editor.cambios.total })}
        confirmLabel={t('niveles.publicar.publicar')}
        busy={editor.busy}
        onClose={editor.cancelarPublicar}
        onConfirm={() => void editor.publicar(resumen).then(() => setResumen(''))}
      >
        <label className="mt-4 flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
          {t('niveles.publicar.resumen')}
          <input
            type="text"
            value={resumen}
            maxLength={120}
            onChange={(e) => setResumen(e.target.value)}
            placeholder={t('niveles.publicar.resumenPlaceholder')}
            className="h-11 rounded-field border-[1.5px] border-line-strong bg-bg px-3 text-sm font-normal text-ink outline-none focus:border-primary-deep"
          />
        </label>
      </ConfirmDialog>

      <ConfirmDialog
        open={restaurar !== null}
        title={t('niveles.restaurar.titulo', { v: restaurar?.version ?? 0 })}
        description={hayBorrador ? t('niveles.restaurar.textoConBorrador') : t('niveles.restaurar.texto')}
        confirmLabel={t('niveles.versiones.restaurar')}
        busy={editor.busy}
        onClose={() => setRestaurar(null)}
        onConfirm={() => restaurar && void editor.restaurar(restaurar.version).then((ok) => ok && setRestaurar(null))}
      />
    </>
  );
}

/** B10 Niveles y reglas. */
export default function NivelesView() {
  const t = useT();
  const { data, error, isLoading, reload } = useReglas();

  return (
    <section className="flex flex-col gap-6" data-screen="B10">
      {data ? (
        <Editor data={data} reload={reload} />
      ) : (
        <>
          <Header />
          {isLoading ? (
            <div className="flex h-60 items-center justify-center text-ink-muted" aria-busy="true">
              <Spinner size={32} />
            </div>
          ) : (
            <EmptyState
              title={t('niveles.error.titulo')}
              description={error?.detail ? t(error.detail) : t('niveles.error.texto')}
              action={
                <Button size="md" onClick={reload}>
                  {t('common.retry')}
                </Button>
              }
            />
          )}
        </>
      )}
    </section>
  );
}
