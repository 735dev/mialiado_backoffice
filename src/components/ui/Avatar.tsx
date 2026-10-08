import { cn } from '@/lib/utils/cn';
import { avatarTone, initials } from '@/lib/utils/format';

interface AvatarProps {
  name: string;
  /** Foto o logo; sin ella se pintan las iniciales. */
  src?: string | null;
  size?: number;
  /** `auto` = color estable por nombre (paleta de pasteles); o un tono fijo. */
  tone?: 'auto' | 'primary' | 'warn';
  className?: string;
}

const TONO_FIJO = { primary: 'bg-primary-tint text-primary-deep', warn: 'bg-warn-tint text-warn' } as const;

/** Iniciales sobre fondo tintado, o la foto cuando existe. Decorativo (el nombre ya esta en el texto contiguo). */
export function Avatar({ name, src, size = 40, tone = 'auto', className }: AvatarProps) {
  if (src) return <img src={src} alt="" width={size} height={size} className={cn('flex-none rounded-full object-cover', className)} style={{ width: size, height: size }} />;
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.34)) }}
      className={cn('flex flex-none items-center justify-center rounded-full font-extrabold', tone === 'auto' ? avatarTone(name) : TONO_FIJO[tone], className)}
    >
      {initials(name)}
    </span>
  );
}
