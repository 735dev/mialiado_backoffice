import { cn } from '@/lib/utils/cn';

export function Spinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      role="status"
      aria-label="loading"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('animate-spin', className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
