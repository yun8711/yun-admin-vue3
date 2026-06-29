module.exports = {
  // 工程入口文件夹
  entry: 'src',
  // 默认语言
  defaultLanguage: 'zh-CN',
  // 激活语言（运行时生效）
  activeLanguage: 'zh-CN',
  // 支持的语言列表
  languages: [
    { name: 'zh-CN', title: '中文', default: true },
    { name: 'en', title: 'English' },
    { name: 'ja', title: '日本語' },
    { name: 'ar', title: 'العربية' },
  ],
  // 翻译文件输出目录（相对于 entry）
  // 实际输出到 src/i18n/
  langDir: 'i18n',
  // 命名空间配置（可选，暂不启用）
  // namespaces: {},
  // 是否启用 TypeScript 类型生成
  typescript: true,
}
