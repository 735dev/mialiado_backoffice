import { type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

// Prototipo B01. Pendiente: llamar al login del backend y al segundo factor.
export default function LoginPage() {
  const navigate = useNavigate();

  function entrar(e: FormEvent) {
    e.preventDefault();
    navigate('/resumen');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={entrar} className="flex w-full max-w-md flex-col gap-5 rounded-panel bg-surface p-8 shadow-e2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Panel de Aliado</h1>
          <p className="mt-2 text-ink-muted">Entra con tu cuenta del equipo.</p>
        </div>
        <label className="flex flex-col gap-2 text-sm font-semibold text-ink-soft" htmlFor="correo">
          Correo del equipo
          <input id="correo" type="email" required className="h-14 rounded-field border border-line-strong bg-surface px-4 text-base text-ink" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-ink-soft" htmlFor="clave">
          Contraseña
          <input id="clave" type="password" required className="h-14 rounded-field border border-line-strong bg-surface px-4 text-base text-ink" />
        </label>
        <Button type="submit">Entrar</Button>
      </form>
    </div>
  );
}
