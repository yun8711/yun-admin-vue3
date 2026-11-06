import { t as translate } from '@/languages'
import { i18nRevision } from '@/languages/revision'

/**
 * 模板可用的翻译函数。
 * 直接使用 languages/index 的 t() 不会读取响应式数据，子组件稳定插槽不会随语言刷新。
 */
export function t(message: string, ...args: unknown[]): string {
  void i18nRevision.value
  return translate(message, ...args)
}
