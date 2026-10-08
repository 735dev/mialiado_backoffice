import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApiError } from '@/lib/api/types';
import { homePath } from '@/lib/routes/access';
import { PATHS } from '@/lib/routes/paths';
import { SECCIONES } from '@/lib/secciones';
import { useAppDispatch } from '@/lib/store/hooks';
import { signedIn } from '@/lib/store/slices/authSlice';
import { notify } from '@/lib/utils/notify';
import { login, obtenerMe, verificar2fa, type LoginChallenge } from '@/providers/adminAuthProvider';
import type { CodeValues, CredentialsValues } from '../schemas/login';

/** 401 (credenciales o codigo malos) y 403 (sin rol, invitacion pendiente, suspendido) se muestran en el formulario. */
const INLINE_STATUS = [401, 403];

/**
 * Flujo B01 en dos pasos: correo + contrasena -> challenge; codigo TOTP -> sesion. Al entrar trae /auth/me
 * (perfil + matriz de permisos) y guarda todo junto, asi nunca hay una sesion a medias.
 */
export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = useCallback((err: ApiError) => {
    if (INLINE_STATUS.includes(err.status)) setError(err.detail);
    else notify.fromApiError(err);
  }, []);

  const submitCredentials = useCallback(
    async (values: CredentialsValues) => {
      setBusy(true);
      setError(null);
      const res = await login(values.correo, values.password);
      setBusy(false);
      if (!res.ok) return fail(res);
      setCorreo(values.correo);
      setChallenge(res.data);
    },
    [fail],
  );

  const submitCode = useCallback(
    async (values: CodeValues) => {
      if (!challenge) return;
      setBusy(true);
      setError(null);
      const res = await verificar2fa(challenge.challengeToken, values.codigo);
      if (!res.ok) {
        setBusy(false);
        return fail(res);
      }
      const session = res.data;
      if (!session) {
        setBusy(false);
        return setError('acceso.noRole');
      }
      const me = await obtenerMe(session.role, session.accessToken);
      setBusy(false);
      if (!me.ok) return fail(me);
      dispatch(signedIn({ token: session.accessToken, refreshToken: session.refreshToken, user: me.data.user, permisos: me.data.permisos }));
      navigate(homePath({ role: me.data.user.role, permisos: me.data.permisos }, SECCIONES, PATHS.sinPermiso), { replace: true });
    },
    [challenge, dispatch, fail, navigate],
  );

  /** Vuelve al paso 1 (otra cuenta o el desafio vencio: valen 5 min). */
  const restart = useCallback(() => {
    setChallenge(null);
    setError(null);
  }, []);

  return { step: challenge ? ('code' as const) : ('credentials' as const), challenge, correo, error, busy, submitCredentials, submitCode, restart };
}
