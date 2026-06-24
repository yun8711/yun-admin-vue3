export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 代码格式（不影响功能）
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试相关
        'chore', // 构建/工具变动
        'build', // 构建系统
        'ci', // CI 配置
        'revert', // 回滚
      ],
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
}
