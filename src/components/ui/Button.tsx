import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

const estilos: Record<Variante, string> = {
  primario: 'bg-primary text-primary-on shadow-e1',
  secundario: 'bg-surface text-ink ring-1 ring-inset ring-line-strong',
};

export default function Button({ variante = 'primario', className = '', ...props }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex h-14 items-center justify-center gap-2 rounded-pill px-6 font-bold disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    />
  );
}
