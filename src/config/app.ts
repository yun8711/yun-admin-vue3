export interface AppRequestConfig {
  baseURL: string
  resPath: string
  errorPath: string
  inQiankun: boolean
  apiPrefix: string
  apiPrefixes: string[]
  devProxySuffix: string
}

/** 将前缀标准化为 '/xxx' 形式，避免拼接 URL 时出现格式不一致。 */
function normalizePrefix(prefix: string): string {
  const trimmed = prefix.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/** 将环境变量里的逗号分隔前缀解析为标准化前缀数组。 */
function parsePrefixes(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split(',').map(normalizePrefix).filter(Boolean)
}

/** 判断是否为绝对 http(s) 地址。 */
function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/** 获取 URL 的第一个路径片段作为前缀，例如 '/rhea/user/list' -> '/rhea'。 */
function getFirstPathSegment(url: string): string {
  const path = url.startsWith('/') ? url : `/${url}`
  const segments = path.split('/').filter(Boolean)
  if (!segments.length) return ''
  return `/${segments[0]}`
}

/** 运行时判断是否处于 qiankun 子应用环境。 */
function getQiankunRuntimeFlag(): boolean {
  if (typeof window === 'undefined') return false
  return (window as unknown as Record<string, unknown>)['__POWERED_BY_QIANKUN__'] === true
}

/** 运行时请求配置入口，统一读取 Vite 环境变量。 */
export const appRequestConfig: AppRequestConfig = {
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  resPath: import.meta.env.VITE_APP_RES_PATH || 'data',
  errorPath: import.meta.env.VITE_APP_ERROR_PATH || 'data',
  inQiankun: getQiankunRuntimeFlag(),
  apiPrefix: normalizePrefix(import.meta.env.VITE_APP_API_PREFIX || ''),
  apiPrefixes: parsePrefixes(import.meta.env.VITE_APP_API_PREFIXES),
  devProxySuffix: import.meta.env.VITE_APP_DEV_PROXY_SUFFIX || '2',
}

/**
 * 按配置的多前缀策略解析请求 URL。
 * - 绝对 URL 保持不变；
 * - 缺少前缀时自动补默认前缀；
 * - 开发环境按规则追加代理后缀（如 '/rhea' -> '/rhea2'）。
 */
export function resolveRequestUrl(rawUrl?: string): string | undefined {
  if (!rawUrl || isAbsoluteUrl(rawUrl)) return rawUrl

  const prefixes = appRequestConfig.apiPrefixes
  if (!prefixes.length) {
    return appRequestConfig.apiPrefix ? `${appRequestConfig.apiPrefix}${rawUrl}` : rawUrl
  }

  let url = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  const currentPrefix = getFirstPathSegment(url)
  if (!prefixes.includes(currentPrefix)) {
    url = `${prefixes[0]}${url}`
  }

  if (import.meta.env.DEV && appRequestConfig.devProxySuffix) {
    const matchedPrefix = getFirstPathSegment(url)
    url = url.replace(matchedPrefix, `${matchedPrefix}${appRequestConfig.devProxySuffix}`)
  }

  return appRequestConfig.apiPrefix ? `${appRequestConfig.apiPrefix}${url}` : url
}
