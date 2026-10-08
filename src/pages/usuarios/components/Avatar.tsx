import { cn } from '@/lib/utils/cn';
import { initials } from '../format';

/** Iniciales sobre fondo tintado; usa la foto cuando existe. */
export function Avatar({ name, src, size = 40, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  if (src) return <img src={src} alt="" width={size} height={size} className={cn('flex-none rounded-full object-cover', className)} style={{ width: size, height: size }} />;
  return (
    <span
      aria-hidden="true"
      className={cn('flex flex-none items-center justify-center rounded-full bg-warn-tint font-extrabold text-warn', className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {initials(name)}
    </span>
  );
}
