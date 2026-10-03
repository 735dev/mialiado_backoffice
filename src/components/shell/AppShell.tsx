import { NavLink, Outlet } from 'react-router-dom';
import { SECCIONES } from '../../lib/secciones';

const grupos = Array.from(new Set(SECCIONES.map((s) => s.grupo)));

export default function AppShell() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      <aside className="border-b border-line bg-surface p-4 md:min-h-screen md:border-b-0 md:border-r">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-7 w-7 rounded-pill bg-primary" aria-hidden="true" />
          <span className="text-lg font-extrabold tracking-tight">aliado</span>
          <span className="rounded-pill bg-surface-2 px-2 font-mono text-xs tracking-widest text-ink-soft">
            ADMIN
          </span>
        </div>
        <nav aria-label="Secciones del panel" className="flex flex-col gap-4">
          {grupos.map((grupo) => (
            <div key={grupo} className="flex flex-col gap-1">
              <p className="px-3 font-mono text-xs uppercase tracking-widest text-ink-muted">{grupo}</p>
              {SECCIONES.filter((s) => s.grupo === grupo).map((s) => (
                <NavLink
                  key={s.ruta}
                  to={s.ruta}
                  className={({ isActive }) =>
                    `rounded-field px-3 py-2 text-sm font-semibold ${
                      isActive ? 'bg-primary text-primary-on' : 'text-ink-soft hover:bg-surface-2'
                    }`
                  }
                >
                  {s.nombre}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
