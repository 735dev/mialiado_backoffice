/**
 * Tokens del backoffice de Aliado. Los colores apuntan a las custom properties
 * de src/styles/tokens.css, tomadas de los prototipos (aliado_prototipos).
 * Los modificadores de opacidad (`bg-primary/50`) no funcionan sobre variables:
 * usar las variantes `-tint`.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: { DEFAULT: 'var(--surface)', 2: 'var(--surface-2)' },
        line: { DEFAULT: 'var(--line)', strong: 'var(--line-strong)' },
        ink: {
          DEFAULT: 'var(--text)',
          soft: 'var(--text-soft)',
          muted: 'var(--text-muted)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          on: 'var(--on-primary)',
          deep: 'var(--primary-deep)',
          tint: 'var(--primary-tint)',
        },
        warn: { DEFAULT: 'var(--warn)', tint: 'var(--warn-tint)' },
        err: { DEFAULT: 'var(--err)', deep: 'var(--err-deep)', tint: 'var(--err-tint)' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"Spline Sans Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      borderRadius: { field: '18px', card: '24px', panel: '32px', pill: '999px' },
      boxShadow: {
        e1: '0 1px 2px rgba(14,26,22,.04), 0 6px 16px -8px rgba(14,26,22,.10)',
        e2: '0 2px 4px rgba(14,26,22,.04), 0 14px 30px -12px rgba(14,26,22,.18)',
      },
    },
  },
  plugins: [],
};
