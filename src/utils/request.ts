import axios, { CanceledError, isCancel } from 'axios'
import type {
  AxiosError,
  AxiosResponse,
  GenericAbortSignal,
  InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import { get, isPlainObject, isString, merge } from 'lodash-es'

import { getStoredLang } from '@/languages/settings'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import type {
  RequestConfig,
  RequestData,
  RequestFunction,
  RequestInput,
  TrackedConfig,
} from '@/types/request'
import { resolveRequestUrl } from '@/utils/request-url'

import { requestConfig } from '../../vite.custom.ts'

const baseURL = requestConfig.baseURL
const DEFAULT_RES_PATH = requestConfig.resPath
const DEFAULT_ERROR_PATH = requestConfig.errorPath

const defaultConfig: Omit<RequestConfig, 'url' | 'method' | 'data' | 'params'> = {
  timeout: requestConfig.timeout,
  download: false,
  fileName: '',
  mimeType: '',
  resPath: DEFAULT_RES_PATH,
  errorPath: DEFAULT_ERROR_PATH,
  showError: true,
  abort: false,
  dedup: false,
}

/** 创建 Axios 实例。 */
const instance = axios.create({
  baseURL,
  timeout: defaultConfig.timeout,
  paramsSerializer: {
    indexes: true,
  },
})

const pending = new Set<AbortController>()
const inflight = new Map<string, number>()
let dedupSeq = 0

/** 中止当前仍在途的请求。路由切换时调用。 */
export function cancelPendingRequests() {
  const controllers = [...pending]
  pending.clear()
  inflight.clear()
  controllers.forEach(controller => controller.abort())
}

/** 外部 signal 中止时，同步中止内部 controller。 */
function bindSignal(controller: AbortController, signal?: GenericAbortSignal | null) {
  if (!signal) return
  if (signal.aborted) {
    controller.abort()
    return
  }
  signal.addEventListener?.('abort', () => controller.abort(), { once: true })
}

/** 请求结束后只移出登记，不主动 abort。 */
function finish(config?: InternalAxiosRequestConfig) {
  if (!config) return
  const tracked = config as TrackedConfig
  if (tracked.requestController) pending.delete(tracked.requestController)
  if (tracked.dedupKey && inflight.get(tracked.dedupKey) === tracked.dedupId) {
    inflight.delete(tracked.dedupKey)
  }
}

/** 相同 method、url、params、data 视为同一次请求。 */
function buildRequestKey(config: RequestConfig): string {
  const method = (config.method || 'get').toLowerCase()
  return [
    method,
    config.url || '',
    stableStringify(config.params),
    stableStringify(config.data),
  ].join('&')
}

/** 稳定化字符串化，避免因对象属性顺序不同导致请求重复。 */
function stableStringify(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'undefined'
  if (value instanceof URLSearchParams) return value.toString()
  if (value instanceof FormData) {
    const parts: string[] = []
    value.forEach((item, key) => {
      const content = item instanceof File ? `${item.name}:${item.size}` : String(item)
      parts.push(`${key}=${content}`)
    })
    return `FormData(${parts.join('&')})`
  }
  if (Array.isArray(value)) return `[${value.map(item => stableStringify(item)).join(',')}]`

  const record = value as Record<string, unknown>
  const body = Object.keys(record)
    .filter(key => record[key] !== undefined)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')
  return `{${body}}`
}

/** 将对象转换为 FormData。 */
function toFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => appendFormValue(formData, key, value))
  return formData
}

/** 将对象值添加到 FormData。 */
function appendFormValue(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return
  if (Array.isArray(value)) {
    value.forEach(item => appendFormValue(formData, key, item))
    return
  }
  if (value instanceof Blob) {
    formData.append(key, value)
    return
  }
  formData.append(key, String(value))
}

/** 兼容 AxiosHeaders / 普通对象 两种 headers 读取方式。 */
function readHeader(config: InternalAxiosRequestConfig, key: string): string {
  const headers = config.headers as Record<string, unknown> & {
    get?: (name: string) => string | undefined
  }

  if (typeof headers?.get === 'function') {
    return headers.get(key) || ''
  }

  return String(
    headers?.[key] || headers?.[key.toLowerCase()] || headers?.[key.toUpperCase()] || ''
  )
}

/** 统一归一化请求入参，支持 `request('/path')` 简写。 */
function normalizeConfig<D = RequestData>(config: RequestInput<D>): RequestConfig<D> {
  const requestConfig: RequestConfig<D> = {}

  if (isString(config)) {
    merge(requestConfig, defaultConfig, { url: config })
    return requestConfig
  }

  if (isPlainObject(config)) {
    merge(requestConfig, defaultConfig, config)
    return requestConfig
  }

  return merge(requestConfig, defaultConfig)
}

/** 兼容不同后端成功标记：`success=true` 或 `code in [0, 200]`。 */
function isSuccess(data: unknown): boolean {
  if (!isPlainObject(data)) return true

  const value = data as Record<string, unknown>
  if (typeof value.success === 'boolean') return value.success
  if (typeof value.code === 'number' || typeof value.code === 'string') {
    return Number(value.code) === 0 || Number(value.code) === 200
  }
  return true
}

/** 显示错误消息。 */
function showError(message?: string) {
  ElMessage.error(message || '请求失败')
}

/** 从响应数据中提取错误消息。 */
function pickMessage(value: unknown): string {
  if (!isPlainObject(value)) return ''
  const msg =
    (value as Record<string, unknown>).errorMessage || (value as Record<string, unknown>).message
  return typeof msg === 'string' ? msg : ''
}

/** 解析文件名。 */
function parseFileName(disposition?: string, fallback?: string): string {
  if (!disposition) return fallback || `download-${Date.now()}`

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1])

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
  if (plainMatch?.[1]) return decodeURIComponent(plainMatch[1])

  return fallback || `download-${Date.now()}`
}

/** 下载 Blob 文件。 */
function downloadBlob(response: AxiosResponse<Blob>, config: RequestConfig) {
  const mimeType = config.mimeType || response.data.type || 'application/octet-stream'
  const disposition = response.headers['content-disposition']
  const fileName = parseFileName(disposition, config.fileName)
  const blob = new Blob([response.data], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/** 保证每个请求都有可中止的 controller，并登记到 pending。 */
function trackController(config: TrackedConfig) {
  let controller = config.requestController
  if (!controller) {
    controller = new AbortController()
    bindSignal(controller, config.signal)
    config.signal = controller.signal
    config.requestController = controller
  }
  pending.add(controller)
}

/** 请求拦截：补齐 URL、防重、登记取消、注入头、处理表单与下载。 */
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tracked = config as TrackedConfig
    config.url = resolveRequestUrl(config.url)

    if (tracked.dedup) {
      const key = buildRequestKey(tracked)
      if (inflight.has(key)) {
        return Promise.reject(new CanceledError('重复请求已取消', config))
      }
      const id = ++dedupSeq
      inflight.set(key, id)
      tracked.dedupKey = key
      tracked.dedupId = id
    }

    trackController(tracked)

    const token = localStorage.getItem('token')
    if (token) config.headers.set('Authorization', `Bearer ${token}`)
    config.headers.set('Accept-Language', getStoredLang())

    const contentType = readHeader(config, 'content-type')
    if (contentType.includes('application/x-www-form-urlencoded') && isPlainObject(config.data)) {
      config.data = new URLSearchParams(config.data as Record<string, string>).toString() as never
    }
    if (contentType.includes('multipart/form-data')) {
      if (isPlainObject(config.data))
        config.data = toFormData(config.data as Record<string, unknown>)
      config.headers.delete('Content-Type')
    }
    if (tracked.download) config.responseType = 'blob'

    return config
  },
  (error: AxiosError) => {
    finish(error.config)
    if (isCancel(error)) return Promise.reject(error)
    showError(error.message || '请求发送失败')
    return Promise.reject(error)
  }
)

/** 响应拦截：拆包、下载、401、超时。取消与防重不弹错误。 */
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    finish(response.config)
    const customConfig = (response.config || {}) as RequestConfig

    if (customConfig.download || response.config.responseType === 'blob') {
      downloadBlob(response as AxiosResponse<Blob>, customConfig)
      return response.data
    }

    const data = response.data
    if (isSuccess(data)) return get(response, customConfig.resPath || DEFAULT_RES_PATH)

    const errorData = get(response, customConfig.errorPath || DEFAULT_ERROR_PATH)
    const errorMsg = pickMessage(errorData) || pickMessage(data) || '请求失败'
    if (customConfig.showError !== false) showError(errorMsg)
    return Promise.reject(errorData)
  },
  (error: AxiosError) => {
    finish(error.config)
    if (isCancel(error)) return Promise.reject(error)

    if (error.code === 'ECONNABORTED') {
      if ((error.config as RequestConfig | undefined)?.showError !== false) showError('请求超时')
      return Promise.reject({ code: 'ECONNABORTED', message: '请求超时' })
    }

    const status = error.response?.status
    if (status === 401) {
      try {
        useUserStore().logout()
      } catch {
        localStorage.removeItem('token')
      }
      if (router.currentRoute.value.path !== '/login') router.push('/')
    }

    const errorData = get(
      error,
      (error.config as RequestConfig | undefined)?.errorPath || DEFAULT_ERROR_PATH
    )
    const errorMsg = pickMessage(error.response?.data) || error.message || '网络错误'
    if ((error.config as RequestConfig | undefined)?.showError !== false) showError(errorMsg)
    return Promise.reject(errorData || error)
  }
)

/** 最终导出请求方法：支持普通调用与可取消请求。 */
const request = ((config: RequestInput) => {
  const requestConfig = normalizeConfig(config) as TrackedConfig

  if (requestConfig.abort) {
    const controller = new AbortController()
    bindSignal(controller, requestConfig.signal)
    requestConfig.signal = controller.signal
    requestConfig.requestController = controller
    return [instance(requestConfig), controller]
  }

  return instance(requestConfig)
}) as RequestFunction

Object.assign(request, instance)

export default request
