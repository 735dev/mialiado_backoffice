import { useT } from '@/lib/hooks/useT';

interface SectionPlaceholderProps {
  /** Codigo del prototipo (B02, B04...). */
  code: string;
  /** Grupo del menu, clave de i18n (nav.group.operacion). */
  groupKey: string;
  /** Titulo: clave de i18n de la feature (comercios.title). */
  titleKey: string;
  /** Ruta de la pantalla. */
  route: string;
}

/**
 * Pagina provisional de cada seccion mientras se construye su pantalla real. Quien la implemente reemplaza
 * el cuerpo de la vista (no este componente) y deja intactos routeName y su entrada en routes.ts.
 */
export default function SectionPlaceholder({ code, groupKey, titleKey, route }: SectionPlaceholderProps) {
  const t = useT();
  return (
    <section className="flex flex-col gap-2" data-screen={code}>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        {t(groupKey)} · {code}
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight">{t(titleKey)}</h1>
      <p className="text-ink-muted">{t('placeholder.description', { code })}</p>
      <p className="font-mono text-xs text-ink-muted">
        {t('placeholder.route')}: {route}
      </p>
    </section>
  );
}
