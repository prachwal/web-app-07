import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import vitestPlugin from '@vitest/eslint-plugin';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'artifacts/**',
      'dist/**',
      'node_modules/**',
      '.tsbuild/**',
      '*.config.js',
      '.github/**',
      '.vscode/**',
      'artifacts/**',
    ],
  },

  // TypeScript base — type-aware rules for src/
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React plugin — use flat.recommended for ESLint 10 compatibility
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: { version: '19.0' },
    },
  },

  // React Hooks — use recommended-latest for v7 (has plugins + rules shape)
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules:
      reactHooksPlugin.configs['recommended-latest']?.rules ??
      reactHooksPlugin.configs.recommended?.rules ??
      {},
  },

  // Allow _-prefixed unused variables (conventional "intentionally unused")
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // JSX Accessibility
  jsxA11yPlugin.flatConfigs.strict,

  // TSDoc — enforces JSDoc/TSDoc on exported symbols
  {
    plugins: {
      tsdoc: tsdocPlugin,
    },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },

  // Vitest — only for test files
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...(vitestPlugin.configs?.recommended?.rules ?? {}),
    },
  },
);
