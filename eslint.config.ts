import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import autoImportGlobals from './.eslintrc-auto-import.json'

export default tseslint.config(
  // 全局忽略
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/*.config.{ts,js,mjs,cjs}',
      'public/**',
      'src/i18n/**',
      'src/languages/**',
      'pnpm-lock.yaml',
      '*.d.ts',
    ],
  },
  // 基础 JS 规则
  js.configs.recommended,
  // TypeScript 规则
  ...tseslint.configs.recommended,
  // Vue 3 推荐规则（包含 essential + strongly-recommended + 社区最佳实践）
  ...pluginVue.configs['flat/recommended'],
  // 通用配置（Vue 文件的 parser 由 pluginVue 单独处理）
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...(autoImportGlobals as { globals: Record<string, boolean> }).globals,
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      // _ 前缀变量/参数视为有意未使用，不报 unused-vars
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Vue 模板中同样忽略 _ 前缀的未使用变量（如 slot props 重命名）
      'vue/no-unused-vars': ['error', { ignorePattern: '^_' }],
      // Vue 单文件组件块顺序：template -> script -> style
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      // 允许 v-html（Element Plus 等组件库可能使用）
      'vue/no-v-html': 'off',
      // 允许多词组件名例外：index、404 等路由/页面组件
      'vue/multi-word-component-names': ['error', { ignores: ['index', '404', 'default'] }],
      // 单行内容不强制换行（与 oxfmt 格式化风格兼容）
      'vue/singleline-html-element-content-newline': 'off',
      // 交给 oxfmt 决定属性换行，避免与 eslint 规则冲突
      'vue/max-attributes-per-line': 'off',
    },
  },
  // TS/TSX 文件：TypeScript 解析器
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        extraFileExtensions: ['.vue'],
      },
    },
  },
  // Vue 文件：script 块使用 TypeScript 解析器（vue-eslint-parser 由 pluginVue 配置）
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
  }
)
