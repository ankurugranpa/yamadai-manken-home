import js from '@eslint/js'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url))

export default tseslint.config([
  {
    ignores: ['dist'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    plugins: {
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // AI生成コードで混入しがちな「とりあえず」の回避
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': false,
          minimumDescriptionLength: 5,
        },
      ],

      // 型/値importを分けて意図を明確化
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // 非同期の事故（握りつぶし/誤用）を型情報で防ぐ
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',

      // 未使用の検出はTS版を使用（JS版は誤検知しやすい）
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // 基本的な品質ガード（クラッシュ/デバッグ残しを防ぐ）
      'no-duplicate-imports': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',

      // React/JSXの基本事故防止
      'react/jsx-key': 'error',
      'react/no-unknown-property': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-no-useless-fragment': 'warn',

      // React 17+（new JSX transform）では不要
      'react/react-in-jsx-scope': 'off',

      // ログは残しても良いが、増えすぎを抑制
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['vite.config.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
])
