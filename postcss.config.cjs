/**
 * PostCSS 配置
 *
 * 集成 postcss-rtlcss 实现构建期 CSS RTL 自动转换：
 * - 自动将 left/right/margin-left 等物理属性生成为 [dir="rtl"] 对应规则
 * - 覆盖项目源码及第三方库（element-plus、yun-elp）的所有 CSS
 * - mode: "combined" 将所有 RTL 规则内联到同一 CSS 文件中
 */
module.exports = {
  plugins: {
    'postcss-rtlcss': {
      mode: 'combined',
    },
  },
}
