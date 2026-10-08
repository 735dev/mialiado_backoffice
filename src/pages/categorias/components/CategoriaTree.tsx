import { ChevronDown, ChevronRight, ChevronUp, GripVertical, Pencil } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { Arbol, Nodo } from '../models/categoria';
import { hijosDe, principales } from '../utils/arbol';
import { renderIcono } from '../utils/iconos';

interface CategoriaTreeProps {
  arbol: Arbol;
  selectedId: number | null;
  expanded: ReadonlySet<number>;
  canEdit: boolean;
  busy: boolean;
  onToggleExpand: (id: number) => void;
  onSelect: (id: number) => void;
  onToggleVisible: (n: Nodo) => void;
  /** Sube o baja un lugar entre sus hermanos. */
  onMove: (n: Nodo, delta: -1 | 1) => void;
  /** Suelta `dragged` sobre `target` (mismo padre): queda en el lugar de `target`. */
  onReorder: (dragged: number, target: number, parentId: number | null) => void;
}

interface FilaProps extends Omit<CategoriaTreeProps, 'arbol' | 'expanded'> {
  nodo: Nodo;
  index: number;
  total: number;
  open?: boolean;
  dragging: Nodo | null;
  setDragging: (n: Nodo | null) => void;
}

interface FlechasProps {
  nodo: Nodo;
  index: number;
  total: number;
  busy: boolean;
  onMove: (n: Nodo, delta: -1 | 1) => void;
}

/** Subir/bajar un lugar entre hermanos: alternativa accesible (teclado) al arrastre. */
function Flechas({ nodo, index, total, busy, onMove }: FlechasProps) {
  const t = useT();
  return (
    <div className="flex flex-none flex-row sm:flex-col">
      <button
        type="button"
        aria-label={t('categorias.arbol.subir', { nombre: nodo.nombre })}
        disabled={index === 0 || busy}
        onClick={() => onMove(nodo, -1)}
        className="flex h-11 w-11 sm:h-5 sm:w-7 items-center justify-center rounded text-ink-soft hover:bg-surface disabled:opacity-30"
      >
        <ChevronUp size={14} />
      </button>
      <button
        type="button"
        aria-label={t('categorias.arbol.bajar', { nombre: nodo.nombre })}
        disabled={index === total - 1 || busy}
        onClick={() => onMove(nodo, 1)}
        className="flex h-11 w-11 sm:h-5 sm:w-7 items-center justify-center rounded text-ink-soft hover:bg-surface disabled:opacity-30"
      >
        <ChevronDown size={14} />
      </button>
    </div>
  );
}

/** Texto de apoyo de una fila: subcategorias (solo en principales) y comercios. */
function metaDe(nodo: Nodo, t: ReturnType<typeof useT>): string {
  const comercios = t(nodo.comercios === 1 ? 'categorias.arbol.comercios_one' : 'categorias.arbol.comercios', { n: nodo.comercios });
  if (nodo.parentId !== null) return comercios;
  const subs = nodo.hijos === 0 ? t('categorias.arbol.sinSub') : t(nodo.hijos === 1 ? 'categorias.arbol.subcategorias_one' : 'categorias.arbol.subcategorias', { n: nodo.hijos });
  return `${subs} · ${comercios}`;
}

/** Arrastrar y soltar entre hermanos del mismo padre (HTML5 nativo, sin librerias). */
function dndProps(nodo: Nodo, dragging: Nodo | null, setDragging: (n: Nodo | null) => void, onReorder: CategoriaTreeProps['onReorder'], enabled: boolean) {
  const sameLevel = dragging !== null && dragging.parentId === nodo.parentId && dragging.id !== nodo.id;
  return {
    draggable: enabled,
    onDragStart: (e: DragEvent<HTMLLIElement>) => {
      e.dataTransfer.effectAllowed = 'move';
      setDragging(nodo);
    },
    onDragEnd: () => setDragging(null),
    onDragOver: (e: DragEvent<HTMLLIElement>) => sameLevel && e.preventDefault(),
    onDrop: (e: DragEvent<HTMLLIElement>) => {
      e.preventDefault();
      if (sameLevel && dragging) onReorder(dragging.id, nodo.id, nodo.parentId);
      setDragging(null);
    },
  };
}

function Fila({ nodo, index, total, open, dragging, setDragging, selectedId, canEdit, busy, onToggleExpand, onSelect, onToggleVisible, onMove, onReorder }: FilaProps) {
  const t = useT();
  const sub = nodo.parentId !== null;
  const meta = metaDe(nodo, t);

  return (
    <li
      {...dndProps(nodo, dragging, setDragging, onReorder, canEdit && !busy)}
      data-testid={`fila-${nodo.id}`}
      className={cn(
        'flex items-center gap-2 rounded-card px-2 py-2.5 sm:gap-3 sm:px-3',
        sub ? 'bg-bg' : 'bg-surface-2',
        selectedId === nodo.id && 'ring-2 ring-primary-deep',
        dragging?.id === nodo.id && 'opacity-50',
      )}
    >
      <GripVertical size={18} aria-hidden="true" className={cn('hidden flex-none text-ink-muted sm:block', canEdit ? 'cursor-grab' : 'opacity-30')} />
      {!sub && (
        <button
          type="button"
          onClick={() => onToggleExpand(nodo.id)}
          aria-expanded={open}
          aria-label={t(open ? 'categorias.arbol.contraerUna' : 'categorias.arbol.expandirUna', { nombre: nodo.nombre })}
          disabled={nodo.hijos === 0}
          className="flex h-11 w-11 sm:h-8 sm:w-8 flex-none items-center justify-center rounded-full hover:bg-surface disabled:opacity-30"
        >
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
      )}
      <span className="hidden h-9 w-9 sm:flex flex-none items-center justify-center rounded-full bg-primary-tint text-primary-deep">
        {renderIcono(nodo.icono)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('truncate font-bold', !nodo.visible && 'text-ink-muted')}>{nodo.nombre}</span>
          {!nodo.visible && <Badge>{t('categorias.arbol.oculta')}</Badge>}
        </div>
        <div className="text-xs text-ink-muted">{meta}</div>
      </div>
      {canEdit && <Flechas nodo={nodo} index={index} total={total} busy={busy} onMove={onMove} />}
      <Switch
        checked={nodo.visible}
        onCheckedChange={() => onToggleVisible(nodo)}
        label={t('categorias.arbol.mostrar', { nombre: nodo.nombre })}
        disabled={!canEdit || busy}
      />
      <button
        type="button"
        onClick={() => onSelect(nodo.id)}
        aria-label={t('categorias.arbol.editar', { nombre: nodo.nombre })}
        className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-soft hover:bg-surface md:h-9 md:w-9"
      >
        <Pencil size={16} />
      </button>
    </li>
  );
}

/** Arbol de dos niveles: categorias principales plegables con sus subcategorias; ordenable arrastrando o con las flechas. */
export function CategoriaTree({ arbol, expanded, ...rest }: CategoriaTreeProps) {
  const t = useT();
  const [dragging, setDragging] = useState<Nodo | null>(null);
  const tops = principales(arbol);

  return (
    <ul className="flex flex-col gap-2" aria-label={t('categorias.arbol.titulo')}>
      {tops.map((c, i) => {
        const open = expanded.has(c.id);
        const hijos = open ? hijosDe(arbol, c.id) : [];
        return (
          <li key={c.id} className="flex flex-col gap-1.5" data-testid={`grupo-${c.id}`}>
            <ul>
              <Fila {...rest} nodo={c} index={i} total={tops.length} open={open} dragging={dragging} setDragging={setDragging} />
            </ul>
            {open && hijos.length > 0 && (
              <ul className="ml-2 flex flex-col gap-1.5 border-l-2 border-line pl-3 sm:ml-10">
                {hijos.map((h, j) => (
                  <Fila key={h.id} {...rest} nodo={h} index={j} total={hijos.length} dragging={dragging} setDragging={setDragging} />
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
