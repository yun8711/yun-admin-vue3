import { requestConfig } from '../../vite.custom.ts'

/** 将前缀标准化为 '/xxx' 形式。 */
function normalizePrefix(prefix: string): string {
  const trimmed = prefix.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/** 获取 URL 的第一个路径片段，例如 '/rhea/user/list' -> '/rhea'。 */
function getFirstPathSegment(url: string): string {
  const path = url.startsWith('/') ? url : `/${url}`
  const segments = path.split('/').filter(Boolean)
  if (!segments.length) return ''
  return `/${segments[0]}`
}

const apiPrefixes = requestConfig.apiPrefixes
  .map(item => normalizePrefix(item.prefix))
  .filter(Boolean)
const apiPrefix = normalizePrefix(requestConfig.apiPrefix)

/**
 * 按 requestConfig 解析请求 URL。
 * 绝对地址保持不变；缺少前缀时补第一个前缀；开发环境追加代理后缀。
 */
export function resolveRequestUrl(rawUrl?: string): string | undefined {
  if (!rawUrl || isAbsoluteUrl(rawUrl)) return rawUrl

  if (!apiPrefixes.length) {
    return apiPrefix ? `${apiPrefix}${rawUrl}` : rawUrl
  }

  let url = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  const currentPrefix = getFirstPathSegment(url)
  if (!apiPrefixes.includes(currentPrefix)) {
    url = `${apiPrefixes[0]}${url}`
  }

  if (import.meta.env.DEV && requestConfig.devProxySuffix) {
    const matchedPrefix = getFirstPathSegment(url)
    url = url.replace(matchedPrefix, `${matchedPrefix}${requestConfig.devProxySuffix}`)
  }

  return apiPrefix ? `${apiPrefix}${url}` : url
}
