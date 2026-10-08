/** Nombre de archivo seguro: sin rutas ni caracteres raros, con la extension del formato y un largo razonable. */
export function nombreSeguro(nombre: string, formato: string): string {
  const base = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._ -]+/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^[. ]+|[. ]+$/g, '')
    .slice(0, 80);
  const ext = formato === 'xlsx' ? 'xlsx' : 'csv';
  const limpio = base.replace(/\.(csv|xlsx)$/i, '');
  return `${limpio || 'reporte'}.${ext}`;
}

/**
 * Entrega un Blob al navegador como descarga. La URL es un blob: local (nunca una URL del servidor ni con token)
 * y se revoca enseguida.
 */
export function guardarArchivo(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
