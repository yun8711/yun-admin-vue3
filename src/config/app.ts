import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

export interface AppRequestConfig {
  baseURL: string
  resPath: string
  errorPath: string
  readonly inQiankun: boolean
  apiPrefix: string
  apiPrefixes: string[]
  devProxySuffix: string
}

/** 单个代理前缀条目，供 vite.config.ts 生成代理规则 */
export interface PrefixEntry {
  /** 标准化后的前缀，如 'rhea'（不含前导 /） */
  prefix: string
  /** 独立端口号，空字符串表示使用默认 target 端口 */
  port: string
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

/**
 * 解析多后端前缀条目（含可选端口），供 vite.config.ts 生成多前缀代理。
 * 格式：前缀[:端口]，逗号分隔，如 /rhea,/daas,/indicator:8015
 */
export function parsePrefixEntries(raw: string | undefined): PrefixEntry[] {
  if (!raw) return []
  return raw.split(',').reduce<PrefixEntry[]>((entries, item) => {
    const trimmed = item.trim()
    if (!trimmed) return entries

    const [prefix, port = ''] = trimmed.split(':')
    const normalized = normalizePrefix(prefix)
    if (!normalized) return entries

    // 去掉前导 / 作为 key，vite proxy 和 resolveRequestUrl 均基于此格式
    entries.push({ prefix: normalized.slice(1), port: port.trim() })
    return entries
  }, [])
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

/** 运行时判断是否处于 qiankun 子应用环境（每次访问即时代取值）。 */
function getQiankunRuntimeFlag(): boolean {
  return typeof qiankunWindow !== 'undefined' && qiankunWindow.__POWERED_BY_QIANKUN__ === true
}

/** 运行时请求配置入口，统一读取 Vite 环境变量。 */
export const appRequestConfig: AppRequestConfig = {
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  resPath: import.meta.env.VITE_APP_RES_PATH || 'data',
  errorPath: import.meta.env.VITE_APP_ERROR_PATH || 'data',
  // getter：每次访问实时检测 qiankun 运行时标志
  get inQiankun() {
    return getQiankunRuntimeFlag()
  },
  apiPrefix: normalizePrefix(import.meta.env.VITE_APP_API_PREFIX || ''),
  apiPrefixes: parsePrefixes(import.meta.env.VITE_APP_API_PREFIXES),
  devProxySuffix: import.meta.env.VITE_APP_DEV_PROXY_SUFFIX || '_dev',
}

/**
 * 按配置的多前缀策略解析请求 URL。
 * - 绝对 URL 保持不变；
 * - 缺少前缀时自动补默认前缀；
 * - 开发环境按规则追加代理后缀（如 '/rhea' -> '/rhea_dev'）。
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
