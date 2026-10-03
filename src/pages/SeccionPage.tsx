import type { Seccion } from '../lib/secciones';

// Página provisional de cada sección mientras se construye su pantalla real.
export default function SeccionPage({ seccion }: { seccion: Seccion }) {
  return (
    <section className="flex flex-col gap-2">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{seccion.grupo}</p>
      <h1 className="text-3xl font-extrabold tracking-tight">{seccion.nombre}</h1>
      <p className="text-ink-muted">
        Pendiente de construir. Diseño de referencia: prototipo {seccion.pantalla} en aliado_prototipos/backoffice.
      </p>
    </section>
  );
}
