import { ref } from 'vue'

/** 语言切换后自增，供模板里的 t() 建立响应式依赖。 */
export const i18nRevision = ref(0)
