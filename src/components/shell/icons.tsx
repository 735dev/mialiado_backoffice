import {
  Bell,
  ChartColumn,
  House,
  LayoutGrid,
  LifeBuoy,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Tag,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Iconos del menu por nombre (campo `icono` de src/lib/secciones.ts). */
export const NAV_ICONS: Record<string, LucideIcon> = {
  home: House,
  store: Store,
  users: Users,
  tag: Tag,
  bolt: Zap,
  wallet: Wallet,
  chart: ChartColumn,
  bell: Bell,
  life: LifeBuoy,
  sliders: SlidersHorizontal,
  grid: LayoutGrid,
  shield: ShieldCheck,
  scroll: ScrollText,
};

/** Mascota Ali del prototipo (logo del menu). */
export function AliLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="flex-none">
      <defs>
        <radialGradient id="aliG" cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor="#6BFFBA" />
          <stop offset=".55" stopColor="#22F797" />
          <stop offset="1" stopColor="#12D985" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#aliG)" />
      <ellipse cx="38" cy="52" rx="16" ry="17.5" fill="#fff" stroke="#10243A" strokeWidth="3.5" />
      <ellipse cx="39" cy="49" rx="10.5" ry="12" fill="#10243A" />
      <ellipse cx="82" cy="52" rx="16" ry="17.5" fill="#fff" stroke="#10243A" strokeWidth="3.5" />
      <ellipse cx="83" cy="49" rx="10.5" ry="12" fill="#10243A" />
      <path d="M26 30q12 -9 24 0" fill="none" stroke="#10243A" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M70 30q12 -9 24 0" fill="none" stroke="#10243A" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="60" cy="88" rx="5" ry="6.5" fill="#10243A" />
    </svg>
  );
}
