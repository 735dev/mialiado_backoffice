import type { AxiosError } from 'axios';
import { handleErrorAxios, handleMessageAxios, isSuccessfully, qs } from './handlers';

const axiosError = (status: number | null, data?: unknown) =>
  ({ response: status === null ? undefined : { status, data } }) as unknown as AxiosError;

describe('handleErrorAxios', () => {
  it('sin respuesta devuelve status 0 (sin red)', () => {
    expect(handleErrorAxios(axiosError(null))).toMatchObject({ ok: false, status: 0, detail: 'errors.network' });
  });

  it('usa el detail exacto del backend en un 422 y arma fieldErrors', () => {
    const res = handleErrorAxios(
      axiosError(422, { detail: 'Correo ya registrado', errors: { email: ['Duplicado', 'Revisa'], phone: 'Invalido' } }),
    );
    expect(res.detail).toBe('Correo ya registrado');
    expect(res.fieldErrors).toEqual({ email: 'Duplicado Revisa', phone: 'Invalido' });
  });

  it('acepta errors como lista [{campo, mensaje}] del backend', () => {
    const res = handleErrorAxios(
      axiosError(422, {
        detail: 'Datos invalidos',
        errors: [
          { campo: 'correo', mensaje: 'Correo invalido' },
          { campo: 'password', mensaje: 'Muy corta' },
          { campo: 'password', mensaje: 'Falta mayuscula' },
          { mensaje: 'sin campo' },
        ],
      }),
    );
    expect(res.fieldErrors).toEqual({ correo: 'Correo invalido', password: 'Muy corta Falta mayuscula' });
  });

  it('une los mensajes cuando FastAPI manda detail como lista', () => {
    const res = handleErrorAxios(axiosError(422, { detail: [{ loc: ['body', 'x'], msg: 'campo requerido' }, { msg: 'otro' }] }));
    expect(res.detail).toBe('campo requerido otro');
  });

  it.each([
    [401, 'errors.unauthorizedTitle'],
    [403, 'errors.forbiddenTitle'],
    [404, 'errors.notFoundTitle'],
    [500, 'errors.serverTitle'],
    [418, 'errors.genericTitle'],
  ])('mapea el status %i a una clave i18n por defecto', (status, title) => {
    expect(handleErrorAxios(axiosError(status, {})).title).toBe(title);
  });
});

describe('handleMessageAxios', () => {
  it('por defecto es un 400 con clave generica', () => {
    expect(handleMessageAxios(undefined)).toMatchObject({ ok: false, status: 400, title: 'errors.genericTitle' });
  });
});

describe('isSuccessfully', () => {
  it('acepta 2xx, "OK" o la presencia del campo indicado', () => {
    expect(isSuccessfully(200)).toBe(true);
    expect(isSuccessfully(204)).toBe(true);
    expect(isSuccessfully('OK')).toBe(true);
    expect(isSuccessfully(400, { id: 1 }, 'id')).toBe(true);
    expect(isSuccessfully(400, { x: 1 }, ['id', 'links'])).toBe(false);
    expect(isSuccessfully(500)).toBe(false);
  });
});

describe('qs', () => {
  it('omite vacios y codifica', () => {
    expect(qs({ q: 'a b', page: 2, limit: undefined, x: null, y: '', ok: false })).toBe('q=a+b&page=2&ok=false');
  });
});
