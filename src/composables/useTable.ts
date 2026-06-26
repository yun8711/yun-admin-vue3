import type { PaginationProps } from 'element-plus'
import { get, isEmpty } from 'lodash-es'
import { computed, reactive, ref, onBeforeUnmount, type ComputedRef, type Ref } from 'vue'

// ============================================================
// useTable - Vue 3 表格页通用组合式函数，适配 y-table-search + y-table 组合。
//
// 特性：
// - y-table-search：通过 @change/@search/@reset 对接防抖查询、搜索、重置
// - y-table：通过 @pagination-change 对接分页，通过 ref 调用 clearSelection/clearSort/clearFilter
// - 支持分页 / 无限滚动两种模式
// - 内置空值格式化、批量操作辅助、删除后翻页补偿
//
// 使用示例：
// ```vue
// <script lang="ts" setup>
// const yTableRef = ref()
// const { tableData, tableLoading, paginationProps,
//         autoSearchChange, autoSearchReset, autoSearchQuery,
//         tablePageChange, tableSelectionChange
//       } = useTable({ queryApi: getList, tableRef: yTableRef })
//
// function onChange(formData) { autoSearchChange(formData) }
// function onSearch(formData) { autoSearchQuery() }
// function onReset(formData) { autoSearchReset(formData) }
// </script>
// ```
// ============================================================

// ---- 工具函数（模块级，避免每次调用 recreate）----

/** 空值格式化：value || '-' */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function emptyFormatter(value: any): string {
  return value || '-'
}

// ---- 类型定义 ----

export interface PageConf {
  pageSize: number
  currentPage: number
  total: number
  hasNext: boolean
}
// queryApi 接收任意参数、返回任意结构，使用 any 是合理的逃逸出口
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryApi = (...args: any[]) => Promise<any>

export interface UseTableOptions {
  /** 查询接口函数，参数由 queryParamsHandle 处理后传入 */
  queryApi: QueryApi
  /** 是否分页查询，默认 true */
  isPaging?: boolean
  /** 是否无限滚动，默认 false（y-table 不内置支持，需自行实现滚动加载） */
  infinite?: boolean
  /** 接口返回数据中表格记录的字段名，默认 'records' */
  recordsField?: string
  /** 接口返回数据中总条数的字段名，默认 'total' */
  totalField?: string
  /** 首次搜索变化时是否自动查询，默认 true */
  autoInitQuery?: boolean
  /** 搜索防抖时间（毫秒），默认 500 */
  autoSearchDebounceTime?: number
  /** 调试模式，默认 false */
  debug?: boolean
  /** y-table 组件的模板引用，用于 tableReset 调用 clearSelection/clearSort/clearFilter */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableRef?: Ref<any>
  /**
   * 查询参数处理钩子
   * @param defaultParams - 默认整理的查询参数
   * @returns 返回数组则作为 queryApi 的展开参数；返回 false 则取消本次查询
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryParamsHandle?: (defaultParams: Record<string, any>) => any[] | false
  /** 查询结果返回后的额外处理钩子 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryResultHandle?: (res: any, params: any[]) => void
  /** 查询重置时的额外处理钩子（queryList(isReset=true) 时触发） */
  queryResetHandle?: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseTableReturn<T = any> {
  // -- 状态 -------------------------------------------------
  tableData: Ref<T[]>
  tableLoading: Ref<boolean>
  tableSelectData: Ref<T[]>
  tableFilterParams: Ref<Record<string, unknown>>
  tableSortParams: Ref<Record<string, unknown>>
  autoSearchParams: Ref<Record<string, unknown>>
  autoInitQuery: boolean
  pageConf: PageConf
  selectNum: ComputedRef<number>
  /** y-table :pagination-props 可直接绑定的分页配置 */
  paginationProps: ComputedRef<PaginationProps>

  // -- 查询相关 -----------------------------------------------
  queryList: (isReset?: boolean) => void
  /** 对接 y-table-search @change，搜索项变化时防抖查询 */
  autoSearchChange: (obj: Record<string, unknown>) => void
  /** 对接 y-table-search @reset，重置搜索参数并查询 */
  autoSearchReset: (obj?: Record<string, unknown>) => void
  /** 对接 y-table-search @search，立即查询 */
  autoSearchQuery: () => void

  // -- 表格事件 -----------------------------------------------
  /** 对接 y-table @pagination-change ({ currentPage, pageSize }) */
  tablePageChange: (obj: { currentPage: number; pageSize: number }) => void
  /** 对接 el-table @filter-change */
  tableFilterChange: (filters: Record<string, unknown>) => void
  /** 对接 el-table @sort-change */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableSortChange: (sort: { column: any; prop: string; order: string }) => void
  /** 对接 el-table @selection-change */
  tableSelectionChange: (selection: T[]) => void
  /**
   * 重置表格状态（多选/排序/筛选）
   * 需要传入 tableRef 选项
   * @param arr - 要重置的状态，默认 'all'（全部重置）
   */
  tableReset: (arr?: string[] | 'all') => void

  // -- 分页辅助 -----------------------------------------------
  /** 删除后翻页补偿：当删除条数 >= 当前页条数时回退一页 */
  delPagingHandle: (delNum: number) => void

  // -- 工具方法 -----------------------------------------------
  /** 空值格式化：value || '-' */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emptyFormatter: (value: any) => string
  /** 批量操作 - 获取符合条件的选中数量 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBatchNumber: (attrPath?: string, attrValue?: any) => number
  /** 批量操作 - 判断按钮是否禁用 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBatchDisabled: (attrPath?: string, attrValue?: any) => boolean
  /** 批量操作 - 获取按钮文案后缀 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBatchText: (attrPath?: string, attrValue?: any) => string
}

/**
 * 创建表格页组合式函数
 *
 * @param options - 配置选项（仅 queryApi 必填）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTable<T = any>(options: UseTableOptions): UseTableReturn<T> {
  const {
    queryApi,
    isPaging = true,
    infinite = false,
    recordsField = 'records',
    totalField = 'total',
    autoInitQuery = true,
    autoSearchDebounceTime = 500,
    debug = false,
    tableRef,
    queryParamsHandle: customQueryParamsHandle,
    queryResultHandle: customQueryResultHandle,
    queryResetHandle: customQueryResetHandle,
  } = options

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugLog = (...args: any[]) => {
    if (debug) {
      // eslint-disable-next-line no-console
      console.log('[useTable]', ...args)
    }
  }

  // ==================== 状态 ====================

  const tableData = ref<T[]>([]) as Ref<T[]>
  const tableLoading = ref(false)
  const tableSelectData = ref<T[]>([]) as Ref<T[]>
  const tableFilterParams = ref<Record<string, unknown>>({})
  const tableSortParams = ref<Record<string, unknown>>({})
  const autoSearchParams = ref<Record<string, unknown>>({})

  const pageConf = reactive<PageConf>({
    pageSize: infinite ? 20 : 10,
    currentPage: 1,
    total: 0,
    hasNext: true,
  })

  /** y-table :pagination-props 直接绑定。
   *  通过 unknown 转 PaginationProps 以兼容 Element Plus 的 ExtractPropTypes 严格类型，
   *  运行时仅传递 currentPage/pageSize/total，其余属性由 el-pagination 使用内置默认值。
   */
  const paginationProps = computed(
    () =>
      ({
        currentPage: pageConf.currentPage,
        pageSize: pageConf.pageSize,
        total: pageConf.total,
      }) as unknown as PaginationProps
  )

  const selectNum = computed(() => tableSelectData.value.length || 0)

  // ==================== 防抖 ====================

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let debounceReady = false

  function debouncedQueryList(isReset: boolean) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      doQueryList(isReset)
    }, autoSearchDebounceTime)
  }

  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  // ==================== 搜索参数 ====================

  const autoSearchCount = ref(0)

  /** 更新 autoSearchParams：值为空时删除对应 key */
  function mergeSearchParams(obj: Record<string, unknown>) {
    Object.keys(obj).forEach(key => {
      if (obj[key] || !isEmpty(obj[key])) {
        autoSearchParams.value[key] = obj[key]
      } else {
        delete autoSearchParams.value[key]
      }
    })
  }

  // ==================== 钩子函数 ====================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function queryParamsHandle(defaultParams: Record<string, any>): any[] | false {
    if (customQueryParamsHandle) {
      return customQueryParamsHandle(defaultParams)
    }
    return [defaultParams]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function queryResultHandle(res: any, params: any[]) {
    customQueryResultHandle?.(res, params)
  }

  function queryResetHandle() {
    customQueryResetHandle?.()
  }

  // ==================== 核心查询 ====================

  /** 执行实际查询逻辑 */
  function doQueryList(isReset: boolean) {
    debugLog('queryList', isReset)
    if (tableLoading.value) return

    // 重置分页数据
    if (isReset) {
      pageConf.currentPage = 1
      pageConf.total = 0
      pageConf.hasNext = true
      tableData.value = []
      tableReset(['selection'])
    }

    // 自定义重置钩子
    queryResetHandle()

    // 无限滚动：没有下一页则终止
    if (infinite && !pageConf.hasNext) return

    // 整理查询参数
    const defaultParams: Record<string, unknown> = {
      ...autoSearchParams.value,
      ...tableFilterParams.value,
    }

    if (isPaging) {
      defaultParams.current = pageConf.currentPage
      defaultParams.size = pageConf.pageSize
    }

    // 调用参数处理钩子
    const queryParams = queryParamsHandle(defaultParams)
    debugLog('queryParams', queryParams)
    if (queryParams === false) return

    const params = Array.isArray(queryParams) ? queryParams : [queryParams]

    // 发起请求
    tableLoading.value = true

    queryApi(...params)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        if (infinite) {
          tableData.value = [...tableData.value, ...(res?.[recordsField] || [])]
          pageConf.total = res?.[totalField] || 0
          if ('hasNext' in (res as Record<string, unknown>)) {
            pageConf.hasNext = (res as Record<string, unknown>).hasNext as boolean
            if (pageConf.hasNext) {
              pageConf.currentPage += 1
            }
          } else {
            pageConf.hasNext = (res?.[recordsField]?.length ?? 0) >= pageConf.pageSize
          }
        } else {
          tableData.value = res?.[recordsField] || []
          pageConf.total = res?.[totalField] || 0
          queryResultHandle(res, params)
          queryPagingHandle(res, params)
        }
      })
      .finally(() => {
        tableLoading.value = false
      })
  }

  /** 对外暴露的 queryList：实际调用 doQueryList */
  function queryList(isReset = false) {
    doQueryList(isReset)
  }

  // ==================== 分页补偿 ====================

  /**
   * 查询后分页补偿：当前页无数据时回退到最后一页
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function queryPagingHandle(_res: any, _params: any[]) {
    if (infinite) return
    if (pageConf.currentPage !== 1 && tableData.value.length === 0) {
      const totalPage = Math.ceil(pageConf.total / pageConf.pageSize) || 1
      pageConf.currentPage = Math.max(totalPage, 1)
      queryList()
    }
  }

  /**
   * 删除后分页补偿：删除条数 >= 当前页条数时回退一页
   * @param delNum - 删除条数
   */
  function delPagingHandle(delNum: number) {
    const curPageLength = tableData.value.length
    if (delNum >= curPageLength) {
      pageConf.currentPage = Math.max(pageConf.currentPage - 1, 1)
    }
  }

  // ==================== 搜索事件 ====================

  function autoSearchChange(obj: Record<string, unknown>) {
    debugLog('autoSearchChange', autoSearchCount.value, obj)
    mergeSearchParams(obj)

    // 首次变化时自动查询（可关闭）
    if (autoInitQuery && autoSearchCount.value === 0) {
      queryList(true)
    }
    autoSearchCount.value++

    // 首次调用仅初始化防抖，第二次及之后走防抖查询
    if (!debounceReady) {
      debounceReady = true
      return
    }
    debouncedQueryList(true)
  }

  function autoSearchReset(obj?: Record<string, unknown>) {
    debugLog('autoSearchReset', obj)
    if (obj) {
      autoSearchParams.value = {}
    }
    // 重置表格状态
    tableReset()
    autoSearchCount.value = 0
  }

  function autoSearchQuery() {
    debugLog('autoSearchQuery')
    // 重置防抖标记，确保下次 change 重新走首次逻辑
    debounceReady = false
    queryList(true)
  }

  // ==================== 表格事件 ====================

  function tablePageChange(obj: { currentPage: number; pageSize: number }) {
    Object.assign(pageConf, obj)
    queryList()
  }

  function tableFilterChange(filters: Record<string, unknown>) {
    Object.keys(filters).forEach(key => {
      tableFilterParams.value[key] = filters[key]
    })
    queryList(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function tableSortChange({ column, prop, order }: { column: any; prop: string; order: string }) {
    if (order) {
      tableSortParams.value = { column, prop, order }
    } else {
      tableSortParams.value = {}
    }
    queryList(true)
  }

  function tableSelectionChange(selection: T[]) {
    tableSelectData.value = selection
  }

  /**
   * 重置表格状态
   * 依赖 tableRef 选项传入 y-table 组件的模板引用
   */
  function tableReset(arr: string[] | 'all' = 'all') {
    const table = tableRef?.value
    if (!table) return

    const array = arr === 'all' ? ['selection', 'sort', 'filter'] : arr

    if (array.includes('selection')) {
      table.clearSelection?.()
      tableSelectData.value = []
    }

    if (array.includes('sort')) {
      table.clearSort?.()
      tableSortParams.value = {}
    }

    if (array.includes('filter')) {
      table.clearFilter?.()
      tableFilterParams.value = {}
    }
  }

  // ==================== 批量操作工具 ====================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getBatchNumber(attrPath?: string, attrValue?: any): number {
    if (!attrPath) {
      return tableSelectData.value.length
    }
    if (!tableSelectData.value.length) return 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tableSelectData.value.filter((item: any) => {
      if (Array.isArray(attrValue)) {
        return attrValue.includes(get(item, attrPath as string))
      }
      return get(item, attrPath as string) === attrValue
    }).length
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getBatchDisabled(attrPath?: string, attrValue?: any): boolean {
    return getBatchNumber(attrPath, attrValue) === 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getBatchText(attrPath?: string, attrValue?: any): string {
    const num = getBatchNumber(attrPath, attrValue)
    return num > 0 ? `(${num})` : ''
  }

  // ==================== 导出 ====================

  return {
    tableData,
    tableLoading,
    tableSelectData,
    tableFilterParams,
    tableSortParams,
    autoSearchParams,
    autoInitQuery,
    pageConf,
    selectNum,
    paginationProps,

    queryList,
    autoSearchChange,
    autoSearchReset,
    autoSearchQuery,

    tablePageChange,
    tableFilterChange,
    tableSortChange,
    tableSelectionChange,
    tableReset,

    delPagingHandle,

    emptyFormatter,
    getBatchNumber,
    getBatchDisabled,
    getBatchText,
  }
}
