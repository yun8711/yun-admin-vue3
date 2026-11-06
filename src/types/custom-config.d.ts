/** 多后端前缀。port 为空时使用 appConfig.host。 */
export interface ApiPrefixItem {
  prefix: string
  port?: string
}

/** 工程与开发服务器配置。 */
export interface AppConfig {
  readonly inQiankun: boolean
  readonly name: string
  readonly isProd: boolean
  readonly isDev: boolean
  /** 开发代理目标地址 */
  readonly host: string
  readonly port: number
  readonly base: string
  /** 浏览器标签页标题 */
  readonly title: string
  /** 为 true 时不请求后端菜单，全部异步路由可见 */
  readonly skipMenuAuth: boolean
}

/** 请求默认配置。apiPrefixes、devProxySuffix 同时供开发代理使用。 */
export interface RequestConfig {
  readonly baseURL: string
  /** 成功响应的取值路径 */
  readonly resPath: string
  /** 失败响应的取值路径 */
  readonly errorPath: string
  /** 超时时间，毫秒 */
  readonly timeout: number
  /** 无多前缀时追加的统一前缀，为空则不追加 */
  readonly apiPrefix: string
  readonly apiPrefixes: ApiPrefixItem[]
  /** 开发环境代理后缀，如 _dev */
  readonly devProxySuffix: string
}
