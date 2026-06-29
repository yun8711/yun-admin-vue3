/**
 * VoerkaI18n 国际化运行时入口
 *
 * 创建 VoerkaI18nScope 并导出，供 main.ts 注册 Vue 插件使用。
 * 翻译消息映射以「源语言（中文）」作为 message key，各语言提供对应译文。
 */
import { type VoerkaI18nScopeOptions } from '@voerkai18n/runtime'
import { VoerkaI18nScope } from '@voerkai18n/runtime'

import arMessages from './messages/ar.json'
import enMessages from './messages/en.json'
import jaMessages from './messages/ja.json'
import zhCNMessages from './messages/zh-CN.json'

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

// 创建 VoerkaI18nScope，传入语言列表与各语言消息映射
const i18nScope = new VoerkaI18nScope({
  id: 'app',
  defaultLanguage: 'zh-CN',
  activeLanguage: getStoredLang(),
  languages: LANGUAGES.map(l => ({ name: l.name, title: l.title })),
  messages: {
    'zh-CN': zhCNMessages,
    en: enMessages,
    ja: jaMessages,
    ar: arMessages,
  },
  // paragraphs 为必需字段，本模板暂无段落级翻译需求
  paragraphs: {},
  // 启用 debug 模式便于开发调试
  debug: import.meta.env.DEV,
} as VoerkaI18nScopeOptions)

export default i18nScope
