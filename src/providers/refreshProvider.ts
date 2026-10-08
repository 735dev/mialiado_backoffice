import type { AxiosError } from 'axios';
import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully } from '@/lib/api/handlers';
import type { ApiResult } from '@/lib/api/types';

export interface TokensModel {
  accessToken: string;
  refreshToken: string;
}

/** Contrato: admin.md (POST /api/admin/auth/refresh, publico, el refresh rota). */
export const REFRESH_ENDPOINT = '/auth/refresh';

export const tokensFromJson = (j: { access_token: string; refresh_token: string }): TokensModel => ({
  accessToken: j.access_token,
  refreshToken: j.refresh_token,
});

/** 401 = refresh invalido, vencido, ya usado o persona suspendida: hay que volver a iniciar sesion. */
export async function renovarSesion(refreshToken: string): Promise<ApiResult<TokensModel>> {
  try {
    const res = await apiAxios.post({ url: REFRESH_ENDPOINT, data: { refresh_token: refreshToken } });
    if (isSuccessfully(res.status)) return { ok: true, data: tokensFromJson(res.data) };
    return handleMessageAxios(res.data);
  } catch (e) {
    return handleErrorAxios(e as AxiosError);
  }
}
