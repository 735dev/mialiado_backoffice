/** Roles del backoffice (aliado_backend/docs/api/admin.md). `admin` tiene acceso total. */
export const ROLES = ['admin', 'moderador', 'soporte', 'finanzas'] as const;
export type Role = (typeof ROLES)[number];

export const isRole = (value: unknown): value is Role => typeof value === 'string' && (ROLES as readonly string[]).includes(value);

/** Del arreglo `roles` de la sesion se toma el primero que sea del backoffice (admin gana si estan varios). */
export function pickRole(roles: readonly string[] | undefined | null): Role | null {
  if (!roles) return null;
  if (roles.includes('admin')) return 'admin';
  return roles.find(isRole) ?? null;
}
