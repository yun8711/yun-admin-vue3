/**
 * qiankun 子应用全局状态通信封装
 *
 * 参考 rhea-fe/src/actions.js 模式：
 * - 单例存储主应用注入的 onGlobalStateChange / setGlobalState
 * - 独立运行时使用空实现，不抛出错误
 * - 提供 sendMessage / receiveMessage / hasProperty 工具函数
 */

/** qiankun 全局状态对象类型 */
export interface QiankunGlobalState {
  message?: {
    from: string
    to: string
    data: Record<string, unknown>
  }
  [key: string]: unknown
}

/** qiankun 注入的 actions 接口 */
export interface QiankunActions {
  onGlobalStateChange: (
    callback: (state: QiankunGlobalState) => void,
    fireImmediately?: boolean
  ) => void
  setGlobalState: (state: Partial<QiankunGlobalState>) => void
}

const hasOwn = Object.prototype.hasOwnProperty

/** 独立运行 warning 仅打印一次 */
let _warnedOutsideQiankun = false

/** 空实现，独立运行时兜底 */
const emptyAction = (): void => {
  if (!_warnedOutsideQiankun) {
    console.warn('[qiankun] 当前不在 qiankun 子应用环境中，actions 为空操作')
    _warnedOutsideQiankun = true
  }
}

/** 单例 actions 存储 */
const actions: QiankunActions = {
  onGlobalStateChange: emptyAction,
  setGlobalState: emptyAction,
}

/**
 * 注入 qiankun 生命周期 props 中的 actions
 * 应在 mount() 生命周期中调用
 */
export function setQiankunActions(props: Record<string, unknown>): void {
  if (
    typeof props?.onGlobalStateChange === 'function' &&
    typeof props?.setGlobalState === 'function'
  ) {
    actions.onGlobalStateChange = props.onGlobalStateChange as QiankunActions['onGlobalStateChange']
    actions.setGlobalState = props.setGlobalState as QiankunActions['setGlobalState']
  }
}

/**
 * 监听主应用下发的全局状态变更
 * @param callback - 状态变更回调
 * @param fireImmediately - 是否立即以当前状态执行一次回调
 */
export function onGlobalStateChange(
  callback: (state: QiankunGlobalState) => void,
  fireImmediately?: boolean
): void {
  actions.onGlobalStateChange(callback, fireImmediately)
}

/**
 * 向主应用发送全局状态更新
 * @param state - 要更新的状态片段
 */
export function setGlobalState(state: Partial<QiankunGlobalState>): void {
  actions.setGlobalState(state)
}

/**
 * 清理消息，将 message 字段重置为空
 */
export function cleanMessage(): void {
  actions.setGlobalState({
    message: { from: '', to: '', data: {} },
  })
}

/**
 * 向主应用发送消息
 * @param data - 消息数据体
 * @param from - 发送方标识，默认 'sub'
 * @param to - 接收方标识，默认 'sol'
 */
export function sendMessage(data: Record<string, unknown> = {}, from = 'sub', to = 'sol'): void {
  actions.setGlobalState({
    message: { from, to, data },
  })
}

/**
 * 从主应用下发的消息中提取指定字段
 * @param state - onGlobalStateChange 回调中的 state
 * @param key - 要提取的字段名或字段名数组
 */
export function receiveMessage(state: QiankunGlobalState, key: string): unknown | null
export function receiveMessage(
  state: QiankunGlobalState,
  key: string[]
): Record<string, unknown | null>
export function receiveMessage(
  state: QiankunGlobalState,
  key: string | string[]
): unknown | null | Record<string, unknown | null> {
  if (state.message?.from !== 'sol' || state.message?.to !== 'sub') return null

  if (typeof key === 'string') {
    return state.message?.data?.[key] ?? null
  }

  if (Array.isArray(key)) {
    const result: Record<string, unknown | null> = {}
    const messageData = state.message?.data || {}
    for (const k of key) {
      result[k] = hasOwn.call(messageData, k) ? messageData[k] : null
    }
    return result
  }

  return null
}

/**
 * 判断主应用下发的消息中是否包含指定字段
 * @param state - onGlobalStateChange 回调中的 state
 * @param key - 字段名
 */
export function hasProperty(state: QiankunGlobalState, key: string): boolean {
  return hasOwn.call(state.message?.data || {}, key)
}
