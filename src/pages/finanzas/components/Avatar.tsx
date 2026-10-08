import { initials } from '../utils/format';

/** Logo del comercio o, sin logo, sus iniciales sobre `primary-tint`. */
export function Avatar({ name, logoUrl, size = 36 }: { name: string; logoUrl: string | null; size?: number }) {
  if (logoUrl) return <img src={logoUrl} alt="" width={size} height={size} className="flex-none rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center rounded-full bg-primary-tint text-xs font-extrabold text-primary-deep"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );
}
