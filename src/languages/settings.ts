/**
 * 国际化辅助配置（不会被 voerkai18n compile 覆盖）
 *
 * 包含语言列表、方向检测、localStorage 读写等辅助函数，
 * 与 CLI 生成的 index.ts 中的 scope 配合使用。
 */

/** 支持的语言列表（含书写方向 dir） */
export const LANGUAGES = [
  { name: 'zh-CN', title: '中文', dir: 'ltr' },
  { name: 'en', title: 'English', dir: 'ltr' },
  { name: 'ja', title: '日本語', dir: 'ltr' },
  { name: 'ar', title: 'العربية', dir: 'rtl' },
] as const

export type SupportedLang = (typeof LANGUAGES)[number]['name']

/** 获取语言的 dir 属性 */
export function getLangDir(lang: string): 'ltr' | 'rtl' {
  return LANGUAGES.find(l => l.name === lang)?.dir ?? 'ltr'
}

/** localStorage 存储键 */
export const LANG_STORAGE_KEY = 'app-locale'

/** 从 localStorage 读取已保存的语言偏好，默认 zh-CN */
export function getStoredLang(): SupportedLang {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored && LANGUAGES.some(l => l.name === stored)) {
      return stored as SupportedLang
    }
  } catch {
    // localStorage 不可用时忽略
  }
  return 'zh-CN'
}
