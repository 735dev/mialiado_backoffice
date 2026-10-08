import { MODULOS, type Accion, type Modulo } from '@/lib/constants/modules';
import type { Role } from '@/lib/constants/roles';
import type { MatrizPermisos, PermisoModulo } from '../models/equipo';

export const ACCIONES: readonly Accion[] = ['ver', 'editar', 'aprobar'];

const VACIO: PermisoModulo = { ver: false, editar: false, aprobar: false };

export const permisoDe = (m: MatrizPermisos, rol: Role, modulo: Modulo): PermisoModulo => m[rol]?.[modulo] ?? VACIO;

/** Copia profunda de la matriz con todos los modulos presentes (los ausentes cuentan como sin acceso). */
export function normalizar(matriz: MatrizPermisos, roles: readonly Role[]): MatrizPermisos {
  const out: MatrizPermisos = {};
  for (const rol of roles) {
    out[rol] = {};
    for (const modulo of MODULOS) out[rol][modulo] = { ...permisoDe(matriz, rol, modulo) };
  }
  return out;
}

/**
 * Marca o desmarca una accion. Coherencia: quitar «ver» quita tambien «editar» y «aprobar»;
 * activar «editar» o «aprobar» activa «ver» (no se puede editar lo que no se ve).
 */
export function alternar(matriz: MatrizPermisos, rol: Role, modulo: Modulo, accion: Accion): MatrizPermisos {
  const actual = permisoDe(matriz, rol, modulo);
  const valor = !actual[accion];
  const nuevo: PermisoModulo = { ...actual, [accion]: valor };
  if (accion === 'ver' && !valor) {
    nuevo.editar = false;
    nuevo.aprobar = false;
  }
  if (accion !== 'ver' && valor) nuevo.ver = true;
  return { ...matriz, [rol]: { ...matriz[rol], [modulo]: nuevo } };
}

const iguales = (a: PermisoModulo, b: PermisoModulo): boolean => a.ver === b.ver && a.editar === b.editar && a.aprobar === b.aprobar;

/** Solo los roles y modulos que difieren de la matriz guardada (es lo que espera PUT /equipo/permisos). */
export function diferencias(original: MatrizPermisos, borrador: MatrizPermisos): MatrizPermisos {
  const out: MatrizPermisos = {};
  for (const rol of Object.keys(borrador) as Role[]) {
    for (const modulo of MODULOS) {
      const nuevo = permisoDe(borrador, rol, modulo);
      if (!iguales(nuevo, permisoDe(original, rol, modulo))) {
        out[rol] = { ...out[rol], [modulo]: nuevo };
      }
    }
  }
  return out;
}

export const hayCambios = (original: MatrizPermisos, borrador: MatrizPermisos): boolean => Object.keys(diferencias(original, borrador)).length > 0;
