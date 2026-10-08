export interface Subcategoria {
  id: number;
  parent_id: number;
  nombre: string;
  icono: string | null;
  posicion: number;
  visible: boolean;
  comercios: number;
}

export interface Categoria {
  id: number;
  parent_id: null;
  nombre: string;
  icono: string | null;
  posicion: number;
  visible: boolean;
  /** Comercios de toda la categoria (suma de sus subcategorias). */
  comercios: number;
  subcategorias: Subcategoria[];
}

/** GET /categorias: arbol de dos niveles (incluye las ocultas) y totales. */
export interface Arbol {
  data: Categoria[];
  total_subcategorias: number;
  total_comercios: number;
}

/** Un nodo del arbol (categoria o subcategoria) con lo que la edicion necesita saber de su lugar. */
export interface Nodo {
  id: number;
  parentId: number | null;
  nombre: string;
  icono: string | null;
  visible: boolean;
  comercios: number;
  posicion: number;
  /** Subcategorias directas (0 en una subcategoria). */
  hijos: number;
}

export interface CrearCategoriaBody {
  nombre: string;
  icono?: string;
  parent_id?: number;
  visible?: boolean;
}

export interface ActualizarCategoriaBody {
  nombre?: string;
  icono?: string;
  visible?: boolean;
}
