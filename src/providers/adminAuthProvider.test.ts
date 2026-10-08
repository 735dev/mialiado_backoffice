import { challengeFromJson, meFromJson, permisosFromJson, sessionFromJson } from './adminAuthProvider';
import { pendientesFromJson } from './pendientesProvider';

describe('adminAuthProvider (mapeo del contrato)', () => {
  it('login con 2FA ya configurado no trae secreto', () => {
    expect(challengeFromJson({ requiere_2fa: true, challenge_token: 'c', configurado: true })).toEqual({
      challengeToken: 'c',
      configurado: true,
      secreto: undefined,
      otpauthUri: undefined,
    });
  });

  it('primer ingreso trae secreto y otpauth_uri', () => {
    const c = challengeFromJson({ challenge_token: 'c', configurado: false, secreto: 'JBSW', otpauth_uri: 'otpauth://totp/x' });
    expect(c).toMatchObject({ configurado: false, secreto: 'JBSW', otpauthUri: 'otpauth://totp/x' });
  });

  it('la sesion toma el rol del backoffice y admin gana', () => {
    expect(sessionFromJson({ access_token: 'a', refresh_token: 'r', roles: ['cliente', 'moderador'] })?.role).toBe('moderador');
    expect(sessionFromJson({ access_token: 'a', refresh_token: 'r', roles: ['moderador', 'admin'] })?.role).toBe('admin');
    expect(sessionFromJson({ access_token: 'a', refresh_token: 'r', roles: ['cliente'] })).toBeNull();
  });

  it('permisos: solo modulos conocidos y flags ausentes en false', () => {
    expect(permisosFromJson({ resumen: { ver: true }, inventado: { ver: true }, finanzas: { ver: true, editar: true, aprobar: true } })).toEqual({
      resumen: { ver: true, editar: false, aprobar: false },
      finanzas: { ver: true, editar: true, aprobar: true },
    });
    expect(permisosFromJson(undefined)).toEqual({});
  });

  it('me arma usuario, matriz y administradores', () => {
    const me = meFromJson(
      { id: 3, nombre: 'Carlos Mendoza', correo: 'c@a.app', rol_etiqueta: 'Administrador', permisos: { resumen: { ver: true } }, admins: [{ nombre: 'A', correo: 'a@a.app' }] },
      'admin',
    );
    expect(me.user).toEqual({ id: 3, nombre: 'Carlos Mendoza', correo: 'c@a.app', role: 'admin', rolEtiqueta: 'Administrador' });
    expect(me.admins).toHaveLength(1);
  });

  it('pendientes: solo cuenta lo mayor a cero', () => {
    expect(pendientesFromJson({ comercios_por_verificar: 7, promos_por_moderar: 0, tickets_sin_leer: 0, tickets_abiertos: 5, recargas_por_conciliar: 3 })).toEqual({
      comercios: 7,
      promociones: undefined,
      soporte: 5,
      finanzas: 3,
    });
  });
});
