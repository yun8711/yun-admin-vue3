import fs from 'node:fs'

import eslint from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'
// import vueParser from "vue-eslint-parser"
import globals from 'globals'
import tseslint from 'typescript-eslint'

let autoImportGlobals: Record<string, 'readonly'> = {}
try {
  autoImportGlobals =
    JSON.parse(fs.readFileSync('./.eslintrc-auto-import.json', 'utf-8')).globals || {}
} catch (error) {
  console.warn('Could not load auto-import globals', error)
}

export default defineConfig(
  // 全局忽略
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.min.*',
      '**/auto-imports.d.ts',
      '**/components.d.ts',
      '**/*.d.ts',
    ],
  },
  // 基础 JS 规则
  eslint.configs.recommended,
  // TypeScript 规则
  ...tseslint.configs.recommended,
  // Vue 3 推荐规则（包含 essential + strongly-recommended + 社区最佳实践）
  ...pluginVue.configs['flat/recommended'],

  // 通用配置，对js/ts/vue 文件通用配置
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
        ...autoImportGlobals,
        __APP_INFO__: 'readonly',
        // ...(autoImportGlobals as { globals: Record<string, boolean> }).globals,
      },
    },
    plugins: {
      // Vue 文件的 parser 由 pluginVue 单独处理
      vue: pluginVue,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // 基础规则，由eslint/js提供
      'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
      'no-debugger': 'error',

      // ES6规则
      'prefer-const': 'error',
      // 不允许使用var，只能使用let或const
      'no-var': 'error',
      // 要求使用简洁方式声明对象字面量，https://eslint.org/docs/latest/rules/object-shorthand
      'object-shorthand': 'error',

      // 通用最佳实践
      // 文件空行：文件内最多一行空行，且不允许在文件开头或结尾有空行
      'no-multiple-empty-lines': ['warn', { max: 1, maxBOF: 0, maxEOF: 0 }],
    },
  },

  // TS类文件，由typescript-eslint处理
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      // 使用typescript-eslint的parser，也就是@typescript-eslint/typescript-estree
      parser: tseslint.parser,
      // 解析器配置项
      parserOptions: {
        // 使用最新的ECMAScript版本
        ecmaVersion: 'latest',
        // 使用module类型
        sourceType: 'module',
      },
    },
    rules: {
      // 不允许any类型：警告
      '@typescript-eslint/no-explicit-any': 'warn',
      // 禁止空函数：关闭
      '@typescript-eslint/no-empty-function': 'off',
      // 禁止空对象：关闭
      '@typescript-eslint/no-empty-object-type': 'off',
      // 禁止ts注释：关闭
      '@typescript-eslint/ban-ts-comment': 'off',
      // 禁止非空断言：关闭
      '@typescript-eslint/no-non-null-assertion': 'off',
      // _ 前缀变量/参数视为有意未使用，不报 unused-vars
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // 禁止未使用表达式：警告
      '@typescript-eslint/no-unused-expressions': 'warn',
      // 强制类型导入风格：错误
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },

  // Vue 文件：script 块使用 TypeScript 解析器（vue-eslint-parser 由 pluginVue 配置）
  {
    files: ['**/*.vue'],
    languageOptions: {
      // 默认使用vue-eslint-parser，负责拆开sfc
      // parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // 指定 <script> 用哪个解析器，typescript-eslint 的 parser
        parser: tseslint.parser,
        // 额外支持的文件扩展名，用于识别 .vue 文件
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // eslint-plugin-vue规则，参见： https://eslint.vuejs.org/rules/
      // 模板中未使用的变量。忽略 _ 前缀的未使用变量，如 slot props 重命名
      'vue/no-unused-vars': ['error', { ignorePattern: '^_' }],
      // Vue 单文件组件块顺序：template -> script -> style
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      // 禁止使用 v-html
      'vue/no-v-html': 'off',
      // 要求组件名称始终为多词
      'vue/multi-word-component-names': 'off',
      // 要求显式声明 emits
      'vue/require-explicit-emits': 'error',
      // 单行元素内容之前和之后进行换行。不强制换行（与 oxfmt 格式化风格兼容）
      'vue/singleline-html-element-content-newline': 'off',
      // 强制标签自闭合
      'vue/html-self-closing': [
        'error',
        {
          html: {
            // img、input、br 这类空元素必须自闭合
            void: 'always',
            // div、span 这类普通元素不能自闭合
            normal: 'any',
            // 没有内容的组件必须自闭合
            component: 'always',
          },
          // 空的 SVG 元素必须自闭合
          svg: 'always',
          // 空的 MathML 元素必须自闭合
          math: 'always',
        },
      ],
      // 每行最多属性数量。单行时一行最多个，多行时每行1个，
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 10,
          multiline: {
            max: 1,
          },
        },
      ],
      // 禁止块中的行数超过指定数量：错误
      'vue/max-lines-per-block': ['error', { template: 500, script: 500, style: 300 }],
      // 禁止使用指定的HTML元素：错误
      'vue/no-restricted-html-elements': [
        'error',
        { element: 'el-dialog', message: '请使用 y-dialog' },
        { element: 'ElDialog', message: '请使用 y-dialog' },
        { element: 'el-drawer', message: '请使用 y-drawer' },
        { element: 'ElDrawer', message: '请使用 y-drawer' },
        { element: 'el-table', message: '请使用 y-table' },
        { element: 'ElTable', message: '请使用 y-table' },
      ],
    },
  },

  // d.ts 文件：禁用与ts冲突的规则
  {
    files: ['**/*.d.ts'],
    rules: {
      // 不允许any类型：当前关闭
      '@typescript-eslint/no-explicit-any': 'off',
      // 不允许未使用变量：当前关闭
      '@typescript-eslint/no-unused-vars': 'off',
    },
  }
)
