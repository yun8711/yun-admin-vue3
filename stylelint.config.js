/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue/scss',
    'stylelint-config-clean-order',
  ],
  ignoreFiles: ['node_modules/**', 'dist/**', 'public/**', '**/*.min.css'],
  rules: {
    'selector-class-pattern': null,
  },
}
