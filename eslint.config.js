import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

// Reglas de arquitectura (ver ARCHITECTURE.md). Tambien las vigila src/architecture.test.ts.
const FEATURES = [
  'acceso', 'auditoria', 'categorias', 'comercios', 'equipo', 'finanzas', 'impulsos', 'niveles',
  'notificaciones', 'promociones', 'reportes', 'resumen', 'soporte', 'usuarios',
];

// Cada feature (src/pages/<feature>) no puede importar a otra. Lo comun va en components/, lib/ o providers/.
const crossFeatureOverrides = FEATURES.map((feature) => ({
  files: [`src/pages/${feature}/**/*.{ts,tsx}`],
  ignores: ['**/*.test.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: FEATURES.filter((f) => f !== feature).flatMap((f) => [`@/pages/${f}`, `@/pages/${f}/*`]),
            message: 'Una feature no importa a otra. Si es compartido, sube a components/, lib/ o providers/.',
          },
          { group: ['axios'], message: 'Todo HTTP pasa por apiAxios (via providers/).' },
        ],
      },
    ],
  },
}));

export default tseslint.config(
  { ignores: ['dist', 'dist-verify', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'max-lines': ['error', { max: 1000, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', 15],
      'no-alert': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-globals': ['error', { name: 'localStorage', message: 'Usa el store (redux-persist), no localStorage directo.' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  { files: ['*.config.{js,mjs}'], languageOptions: { globals: { ...globals.node } } },
  ...crossFeatureOverrides,
  {
    files: ['src/components/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['axios'], message: 'Todo HTTP pasa por apiAxios (via providers/).' }] }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**', '*.config.{ts,js}'],
    rules: { 'no-restricted-globals': 'off', 'max-lines-per-function': 'off' },
  },
);
