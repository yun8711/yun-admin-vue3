/**
 * 国际化语言切换 composable
 *
 * 封装 VoerkaI18n 语言切换、RTL 方向控制、yun-elp locale 字符串映射，
 * 提供单点语言管理入口。
 *
 * 注意：Element Plus locale 由 y-app-wrap 内部通过 getElementPlusLocale() 自行管理，
 * 本 composable 不直接操作 EL locale 对象，仅输出 yun-elp 可识别的 locale 字符串。
 */
import { computed, ref } from 'vue'

import { i18nScope } from '@/languages'
import {
  getLangDir,
  getStoredLang,
  LANG_STORAGE_KEY,
  LANGUAGES,
  type SupportedLang,
} from '@/languages/settings'

/**
 * SupportedLang → yun-elp locale 字符串映射
 * yun-elp 内部按此 key 查找 Element Plus locale 对象和自身组件翻译。
 */
const LANG_TO_ELP_LOCALE: Record<SupportedLang, string> = {
  'zh-CN': 'zh-cn',
  en: 'en',
  ja: 'ja',
  ar: 'ar',
}

// ---- 全局单例状态 ----

/** 当前语言码 */
const currentLang = ref<SupportedLang>(getStoredLang())

/** 当前语言的书写方向 */
const dir = ref<'ltr' | 'rtl'>(getLangDir(getStoredLang()))

// 初始化时同步 RTL 属性到 <html>（Element Plus 全局 RTL 样式依赖此属性）
document.documentElement.setAttribute('dir', dir.value)

/**
 * 切换语言
 * @param lang - 目标语言码
 */
async function changeLanguage(lang: SupportedLang): Promise<void> {
  // 1. 切换 VoerkaI18n 作用域
  await i18nScope.change(lang)

  // 2. 更新响应式状态
  currentLang.value = lang
  dir.value = getLangDir(lang)

  // 3. 设置 <html dir> 属性实现 RTL
  document.documentElement.setAttribute('dir', dir.value)

  // 4. 持久化语言选择
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // localStorage 不可用时忽略
  }
}

export function useLocale() {
  const activeLanguage = computed(() => currentLang.value)

  /** 当前 yun-elp 可识别的 locale 字符串，用于 App.vue y-app-wrap 的 :locale */
  const elLocaleString = computed(() => LANG_TO_ELP_LOCALE[currentLang.value])

  return {
    /** 当前语言码 */
    activeLanguage,
    /** yun-elp locale 字符串 */
    elLocaleString,
    /** 书写方向 ltr / rtl */
    dir,
    /** 切换语言 */
    changeLanguage,
    /** 支持的语言列表（含 dir 信息） */
    languages: LANGUAGES,
  }
}
