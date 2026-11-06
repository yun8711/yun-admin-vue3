import type { AxiosInstance, AxiosRequestConfig } from 'axios'

export type RequestData = Record<string, unknown>

/** 单次请求配置：在 axios 配置上增加下载、拆包、取消和防重。 */
export interface RequestConfig<D = RequestData> extends AxiosRequestConfig<D> {
  download?: boolean
  fileName?: string
  mimeType?: string
  resPath?: string
  errorPath?: string
  showError?: boolean
  /** 为 true 时返回 `[promise, controller]`，由调用方取消这一次请求。 */
  abort?: boolean
  /** 为 true 时，相同请求仍在途则取消后一次，不弹错误。 */
  dedup?: boolean
}

export interface TrackedConfig<D = RequestData> extends RequestConfig<D> {
  requestController?: AbortController
  dedupKey?: string
  dedupId?: number
}

export type RequestInput<D = RequestData> = string | RequestConfig<D>
export type RequestAbortable<T = unknown> = [Promise<T>, AbortController]

export interface RequestFunction extends AxiosInstance {
  <T = unknown, D = RequestData>(config: RequestInput<D>): Promise<T> | RequestAbortable<T>
}
