import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import { get, isPlainObject, isString, merge } from 'lodash-es'

import { appRequestConfig, resolveRequestUrl } from '@/config/app'
// import 'element-plus/es/components/message/style/css'
import { getStoredLang } from '@/i18n'
import router from '@/router'
import { useUserStore } from '@/stores/user'

type RequestData = Record<string, unknown>

/** 请求扩展配置：在 axios 配置基础上增加模板项目通用能力。 */
export interface RequestConfig<D = RequestData> extends AxiosRequestConfig<D> {
  download?: boolean
  fileName?: string
  mimeType?: string
  resPath?: string
  errorPath?: string
  showError?: boolean
  abort?: boolean
}

type RequestInput<D = RequestData> = string | RequestConfig<D>
type RequestAbortable<T = unknown> = [Promise<T>, AbortController]

interface RequestFunction extends AxiosInstance {
  <T = unknown, D = RequestData>(config: RequestInput<D>): Promise<T> | RequestAbortable<T>
}

const baseURL = appRequestConfig.baseURL
const DEFAULT_RES_PATH = appRequestConfig.resPath
const DEFAULT_ERROR_PATH = appRequestConfig.errorPath

const defaultConfig: Omit<RequestConfig, 'url' | 'method' | 'data' | 'params'> = {
  timeout: 90000,
  download: false,
  fileName: '',
  mimeType: '',
  resPath: DEFAULT_RES_PATH,
  errorPath: DEFAULT_ERROR_PATH,
  showError: true,
  abort: false,
}

const instance = axios.create({
  baseURL,
  timeout: defaultConfig.timeout,
  paramsSerializer: {
    indexes: true,
  },
})

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
  if (!isPlainObject(data)) {
    return true
  }

  const value = data as Record<string, unknown>

  if (typeof value.success === 'boolean') {
    return value.success
  }

  if (typeof value.code === 'number' || typeof value.code === 'string') {
    return Number(value.code) === 0 || Number(value.code) === 200
  }

  return true
}

/** 统一错误提示出口，便于后续替换全局通知组件。 */
function showError(message?: string) {
  ElMessage.error(message || '请求失败')
}

/** 从响应对象中提取后端消息文案。 */
function pickMessage(value: unknown): string {
  if (isPlainObject(value)) {
    const msg =
      (value as Record<string, unknown>).errorMessage || (value as Record<string, unknown>).message
    if (typeof msg === 'string') {
      return msg
    }
  }

  return ''
}

/** 从 content-disposition 中解析下载文件名。 */
function parseFileName(disposition?: string, fallback?: string): string {
  if (!disposition) {
    return fallback || `download-${Date.now()}`
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
  if (plainMatch?.[1]) {
    return decodeURIComponent(plainMatch[1])
  }

  return fallback || `download-${Date.now()}`
}

/** 处理 blob 下载：创建临时链接并触发浏览器下载。 */
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

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/** 请求拦截：补齐 URL、注入 token、处理表单编码与下载类型。 */
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.url = resolveRequestUrl(config.url)

    const token = localStorage.getItem('token')
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)

      config.headers.set('Accept-Language', getStoredLang())
    }

    const contentType = readHeader(config, 'content-type')
    if (contentType.includes('application/x-www-form-urlencoded') && isPlainObject(config.data)) {
      config.data = new URLSearchParams(config.data as Record<string, string>).toString() as never
    }

    const customConfig = config as RequestConfig
    if (customConfig.download) {
      config.responseType = 'blob'
    }

    return config
  },
  (error: AxiosError) => {
    showError(error.message || '请求发送失败')
    return Promise.reject(error)
  }
)

/** 响应拦截：统一成功/失败结构、401 处理与超时提示。 */
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const customConfig = (response.config || {}) as RequestConfig

    if (customConfig.download || response.config.responseType === 'blob') {
      downloadBlob(response as AxiosResponse<Blob>, customConfig)
      return response.data
    }

    const data = response.data
    if (isSuccess(data)) {
      return get(response, customConfig.resPath || DEFAULT_RES_PATH)
    }

    const errorData = get(response, customConfig.errorPath || DEFAULT_ERROR_PATH)
    const errorMsg = pickMessage(errorData) || pickMessage(data) || '请求失败'

    if (customConfig.showError !== false) {
      showError(errorMsg)
    }

    return Promise.reject(errorData)
  },
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      if ((error.config as RequestConfig)?.showError !== false) {
        showError('请求超时')
      }
      return Promise.reject({ code: 'ECONNABORTED', message: '请求超时' })
    }

    const status = error.response?.status
    if (status === 401) {
      try {
        useUserStore().logout()
      } catch {
        localStorage.removeItem('token')
      }

      if (router.currentRoute.value.path !== '/login') {
        router.push('/')
      }
    }

    const errorData = get(error, (error.config as RequestConfig)?.errorPath || DEFAULT_ERROR_PATH)
    const errorMsg = pickMessage(error.response?.data) || error.message || '网络错误'

    if ((error.config as RequestConfig)?.showError !== false) {
      showError(errorMsg)
    }

    return Promise.reject(errorData || error)
  }
)

/** 最终导出请求方法：支持普通调用与可取消请求。 */
const request = ((config: RequestInput) => {
  const requestConfig = normalizeConfig(config)

  if (requestConfig.abort) {
    const controller = new AbortController()
    requestConfig.signal = controller.signal
    return [instance(requestConfig), controller]
  }

  return instance(requestConfig)
}) as RequestFunction

Object.assign(request, instance)

export default request
