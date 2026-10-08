import { cn } from '@/lib/utils/cn';
import { iniciales, tonoAvatar } from '../utils/avatar';

export function Avatar({ nombre, size = 40, className }: { nombre: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn('flex flex-none items-center justify-center rounded-full text-sm font-extrabold', tonoAvatar(nombre), className)}
    >
      {iniciales(nombre)}
    </span>
  );
}
