import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { CategoriaTree } from '../components/CategoriaTree';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EditorPanel } from '../components/EditorPanel';
import { HojaEditor } from '../components/HojaEditor';
import { NuevaDialog } from '../components/NuevaDialog';
import { useAccionesCategorias } from '../hooks/useAccionesCategorias';
import { useCategorias } from '../hooks/useCategorias';
import type { Arbol, Nodo } from '../models/categoria';
import type { EditarValues } from '../schemas/categoria';
import { buscarNodo, cambiosDe, hermanosDe, mover, ordenPayload, principales } from '../utils/arbol';

export const routeName = PATHS.categorias;

function Cabecera({ onNueva }: { onNueva?: () => void }) {
  const t = useT();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{t('nav.group.configuracion')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('categorias.title')}</h1>
        <p className="text-ink-muted">{t('categorias.subtitle')}</p>
      </div>
      {onNueva && (
        <Button size="md" onClick={onNueva}>
          <Plus size={16} aria-hidden="true" />
          {t('categorias.nueva.boton')}
        </Button>
      )}
    </header>
  );
}

function ArbolCabecera({ subs, comercios, canEdit, todoAbierto, onToggleTodo }: { subs: number; comercios: number; canEdit: boolean; todoAbierto: boolean; onToggleTodo: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 id="arbol-titulo" className="text-lg font-extrabold tracking-tight">
          {t('categorias.arbol.titulo')}
        </h2>
        <p className="text-sm text-ink-muted">
          {t('categorias.arbol.resumen', { subs, comercios })}
          {canEdit && ` · ${t('categorias.arbol.arrastra')}`}
        </p>
      </div>
      <button type="button" onClick={onToggleTodo} className="inline-flex min-h-11 items-center text-sm font-bold text-primary-deep underline">
        {todoAbierto ? t('categorias.arbol.contraerTodo') : t('categorias.arbol.expandirTodo')}
      </button>
    </div>
  );
}

/** Arbol ya cargado: expandir/contraer, ordenar, activar/desactivar, editar, crear y eliminar. */
function Gestor({ arbol, reload }: { arbol: Arbol; reload: () => void }) {
  const t = useT();
  const { puede } = useAuth();
  const canEdit = puede('categorias', 'editar');
  const wide = useMediaQuery('(min-width: 1280px)');
  const acciones = useAccionesCategorias(reload);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedState, setExpanded] = useState<ReadonlySet<number> | null>(null);
  const [nueva, setNueva] = useState(false);
  const [eliminar, setEliminar] = useState(false);

  const tops = principales(arbol);
  const expanded = expandedState ?? new Set(tops.slice(0, 1).map((c) => c.id));
  const todoAbierto = tops.every((c) => c.hijos === 0 || expanded.has(c.id));
  const nodo = buscarNodo(arbol, selectedId);

  const toggleExpand = (id: number) => {
    const next = new Set(expanded);
    if (!next.delete(id)) next.add(id);
    setExpanded(next);
  };

  const reordenar = useCallback(
    (lista: Nodo[]) => acciones.ordenar(ordenPayload(lista), t('categorias.toast.ordenada')),
    [acciones, t],
  );

  const onMove = (n: Nodo, delta: -1 | 1) => {
    const hermanos = hermanosDe(arbol, n.parentId);
    void reordenar(mover(hermanos, n.id, hermanos.findIndex((h) => h.id === n.id) + delta));
  };

  const onReorder = (dragged: number, target: number, parentId: number | null) => {
    const hermanos = hermanosDe(arbol, parentId);
    void reordenar(mover(hermanos, dragged, hermanos.findIndex((h) => h.id === target)));
  };

  const onToggleVisible = (n: Nodo) =>
    void acciones.actualizar(n.id, { visible: !n.visible }, t(n.visible ? 'categorias.toast.oculta' : 'categorias.toast.visible', { nombre: n.nombre }));

  const guardar = async (values: EditarValues) => {
    if (!nodo) return;
    const hermanos = hermanosDe(arbol, nodo.parentId);
    const lugar = hermanos.findIndex((h) => h.id === nodo.id) + 1;
    const body = cambiosDe(values, nodo);
    if (Object.keys(body).length > 0 && !(await acciones.actualizar(nodo.id, body, t('categorias.toast.guardada')))) return;
    if (values.posicion !== lugar) await reordenar(mover(hermanos, nodo.id, values.posicion - 1));
  };

  const confirmarEliminar = async () => {
    if (!nodo) return;
    const ok = await acciones.eliminar(nodo.id);
    setEliminar(false); // ante un 409 el aviso global queda solo, sin otro dialogo encima
    if (ok) setSelectedId(null);
  };

  const editor = nodo && (
    <EditorPanel
      key={`${nodo.id}:${nodo.nombre}:${nodo.icono}:${nodo.visible}:${nodo.posicion}`}
      nodo={nodo}
      lugar={hermanosDe(arbol, nodo.parentId).findIndex((h) => h.id === nodo.id) + 1}
      hermanos={hermanosDe(arbol, nodo.parentId).length}
      padre={nodo.parentId === null ? null : (arbol.data.find((c) => c.id === nodo.parentId)?.nombre ?? null)}
      canEdit={canEdit}
      busy={acciones.busy}
      onSave={(v) => void guardar(v)}
      onDelete={() => setEliminar(true)}
      onClose={() => setSelectedId(null)}
    />
  );

  return (
    <>
      <Cabecera onNueva={canEdit ? () => setNueva(true) : undefined} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section aria-labelledby="arbol-titulo" className="flex min-w-0 flex-col gap-4 rounded-panel bg-surface p-4 shadow-e1 md:p-6">
          <ArbolCabecera
            subs={arbol.total_subcategorias}
            comercios={arbol.total_comercios}
            canEdit={canEdit}
            todoAbierto={todoAbierto}
            onToggleTodo={() => setExpanded(todoAbierto ? new Set() : new Set(tops.filter((c) => c.hijos > 0).map((c) => c.id)))}
          />
          {tops.length === 0 ? (
            <EmptyState title={t('categorias.vacio.titulo')} description={t('categorias.vacio.texto')} className="py-10" />
          ) : (
            <CategoriaTree
              arbol={arbol}
              selectedId={selectedId}
              expanded={expanded}
              canEdit={canEdit}
              busy={acciones.busy}
              onToggleExpand={toggleExpand}
              onSelect={setSelectedId}
              onToggleVisible={onToggleVisible}
              onMove={onMove}
              onReorder={onReorder}
            />
          )}
        </section>

        {wide && (
          <div className="sticky top-8">
            {editor ?? (
              <div className="rounded-panel bg-surface p-4 shadow-e1">
                <EmptyState title={t('categorias.editor.vacioTitulo')} description={t('categorias.editor.vacioTexto')} className="py-8" />
              </div>
            )}
          </div>
        )}
      </div>

      {!wide && (
        <HojaEditor open={nodo !== null} onOpenChange={(o) => !o && setSelectedId(null)}>
          {editor}
        </HojaEditor>
      )}

      <NuevaDialog open={nueva} padres={tops} busy={acciones.busy} onClose={() => setNueva(false)} onCreate={acciones.crear} />
      <ConfirmDialog
        danger
        open={eliminar && nodo !== null}
        title={t('categorias.eliminar.titulo', { nombre: nodo?.nombre ?? '' })}
        description={t('categorias.eliminar.texto')}
        confirmLabel={t('categorias.editor.eliminar')}
        busy={acciones.busy}
        onClose={() => setEliminar(false)}
        onConfirm={() => void confirmarEliminar()}
      />
    </>
  );
}

/** B11 Categorias. */
export default function CategoriasView() {
  const t = useT();
  const { arbol, error, isLoading, reload } = useCategorias();

  return (
    <section className="flex flex-col gap-6" data-screen="B11">
      {arbol ? (
        <Gestor arbol={arbol} reload={reload} />
      ) : (
        <>
          <Cabecera />
          {isLoading ? (
            <div className="flex h-60 items-center justify-center text-ink-muted" aria-busy="true">
              <Spinner size={32} />
            </div>
          ) : (
            <EmptyState
              title={t('categorias.error.titulo')}
              description={error?.detail ? t(error.detail) : t('categorias.error.texto')}
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
