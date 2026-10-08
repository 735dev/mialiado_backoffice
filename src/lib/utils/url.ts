/** Solo http(s) es seguro para un enlace que viene del servidor o de otra persona (descarta javascript:, data:, etc.). */
export function esUrlHttp(valor: string | null | undefined): valor is string {
  if (!valor) return false;
  try {
    const u = new URL(valor);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}
