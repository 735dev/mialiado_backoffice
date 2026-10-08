import type { ActualizarCategoriaBody, Arbol, Nodo } from '../models/categoria';

const byPos = <T extends { posicion: number; id: number }>(a: T, b: T) => a.posicion - b.posicion || a.id - b.id;

/** Categorias principales en el orden en que las ve la app. */
export const principales = (arbol: Arbol): Nodo[] =>
  [...arbol.data].sort(byPos).map((c) => ({
    id: c.id,
    parentId: null,
    nombre: c.nombre,
    icono: c.icono,
    visible: c.visible,
    comercios: c.comercios,
    posicion: c.posicion,
    hijos: c.subcategorias.length,
  }));

/** Subcategorias de una categoria, ordenadas. */
export const hijosDe = (arbol: Arbol, parentId: number): Nodo[] =>
  [...(arbol.data.find((c) => c.id === parentId)?.subcategorias ?? [])].sort(byPos).map((s) => ({
    id: s.id,
    parentId,
    nombre: s.nombre,
    icono: s.icono,
    visible: s.visible,
    comercios: s.comercios,
    posicion: s.posicion,
    hijos: 0,
  }));

/** Hermanos de un nodo (mismo nivel y mismo padre), incluido el propio. */
export const hermanosDe = (arbol: Arbol, parentId: number | null): Nodo[] => (parentId === null ? principales(arbol) : hijosDe(arbol, parentId));

export function buscarNodo(arbol: Arbol, id: number | null): Nodo | null {
  if (id === null) return null;
  const top = principales(arbol).find((n) => n.id === id);
  if (top) return top;
  for (const c of arbol.data) {
    const hijo = hijosDe(arbol, c.id).find((n) => n.id === id);
    if (hijo) return hijo;
  }
  return null;
}

/** Mueve el elemento `id` a la posicion `to` (indice) y devuelve la lista nueva; igual si no cambia. */
export function mover<T extends { id: number }>(lista: T[], id: number, to: number): T[] {
  const from = lista.findIndex((x) => x.id === id);
  if (from < 0 || to < 0 || to >= lista.length || from === to) return lista;
  const copia = [...lista];
  const [item] = copia.splice(from, 1);
  copia.splice(to, 0, item as T);
  return copia;
}

/** Body de PUT /categorias/orden: posiciones consecutivas desde 0 en el orden dado. */
export const ordenPayload = (lista: Array<{ id: number }>) => lista.map((x, i) => ({ id: x.id, posicion: i }));

/** Campos que cambiaron en el editor (solo esos viajan en el PATCH). El icono vacio no se envia. */
export function cambiosDe(values: { nombre: string; icono: string; visible: boolean }, nodo: Nodo): ActualizarCategoriaBody {
  const body: ActualizarCategoriaBody = {};
  if (values.nombre !== nodo.nombre) body.nombre = values.nombre;
  if (values.icono && values.icono !== (nodo.icono ?? '')) body.icono = values.icono;
  if (values.visible !== nodo.visible) body.visible = values.visible;
  return body;
}
