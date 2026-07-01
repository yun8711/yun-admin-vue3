<template>
  <div class="page">
    <div>
      <!-- 搜索区域 -->
      <y-table-search
        :options="searchOptions"
        @search="autoSearchQuery"
        @reset="autoSearchReset"
        @change="autoSearchChange"
      >
        <template #right>
          <el-button type="danger" :disabled="selectNum === 0" @click="handleBatchDelete">
            批量删除{{ selectNum > 0 ? ` (${selectNum})` : '' }}
          </el-button>
          <el-button type="primary" @click="toCreate">新增</el-button>
        </template>
      </y-table-search>

      <!-- 表格：集中演示 y-column-xxx 各类组件 -->
      <y-table
        ref="yTableRef"
        :data="tableData"
        :loading="tableLoading"
        :pagination-props="paginationProps"
        class="mt-2"
        @pagination-change="tablePageChange"
        @selection-change="tableSelectionChange"
      >
        <!-- ① y-column-select：多选列（checkbox），支持 selectable / disabledTip -->
        <y-column-select :selectable="selectableRow" :disabled-tip="disabledTipHandler" />

        <!-- ② y-column-text：link 模式，点击跳转详情 -->
        <y-column-text prop="collectName" label="采集名称" min-width="180" link @click="toDetail" />

        <!-- ③ y-column-text：普通列 + formatter -->
        <y-column-text
          prop="collectCount"
          label="采集数量"
          align="right"
          :formatter="formatCount"
        />

        <!-- ④ y-column-filter：状态列（彩色标签 + 表头筛选 + 状态圆点） -->
        <y-column-filter prop="status" label="状态" :config="statusConfig" />

        <!-- ⑤ y-column-filter：仅筛选 + 文本映射，无状态圆点 -->
        <y-column-filter
          prop="collectType"
          label="采集方式"
          :no-status="true"
          :config="collectTypeConfig"
        />

        <!-- ⑥ y-column-filter：无筛选 / 无状态圆点，仅文本映射带颜色 -->
        <y-column-filter
          prop="priority"
          label="优先级"
          :no-status="true"
          :no-filter="true"
          :config="priorityConfig"
        />

        <!-- ⑦ y-column-text：日期列 -->
        <y-column-text prop="lastCollectTime" label="上次采集时间" min-width="170" />

        <!-- ⑧ y-column-op：操作列 -->
        <y-column-op label="操作" width="180px" :options="tableActions" />

        <!-- ⑨ y-column-text：兜底说明列 -->
        <y-column-text prop="envType" label="环境" />
      </y-table>
    </div>

    <!-- 运行日志抽屉 -->
    <log-drawer v-model="drawerVisible" :row="logRow" />
  </div>
</template>

<script lang="ts" setup name="SimpleListPage">
defineOptions({ name: 'SimpleListPage' })
import { ElInput } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import type { ColumnOpItemType } from 'yun-elp'

import { getList } from '@/api/example'
import { useTable } from '@/composables/useTable'
import LogDrawer from '@/views/examples/list/components/index.vue'

const router = useRouter()
const yTableRef = ref()

// ========== 搜索配置 ==========

const searchOptions = ref([
  {
    prop: 'keyword',
    label: '关键词',
    comp: markRaw(ElInput),
    innerAttrs: { clearable: true, placeholder: '搜索采集名称/数据源' },
  },
])

// ========== useTable 组合式函数 ==========

const {
  tableData,
  tableSelectData,
  selectNum,
  tableLoading,
  paginationProps,
  autoSearchChange,
  autoSearchReset,
  autoSearchQuery,
  tablePageChange,
  tableSelectionChange,
} = useTable({
  queryApi: getList,
  tableRef: yTableRef,
  queryParamsHandle(defaultParams) {
    return [{ ...defaultParams, customField: 'value' }]
  },
})

// ========== ① y-column-select 配置 ==========

/** 控制哪些行可勾选 */
function selectableRow(row: Record<string, unknown>): boolean {
  return row.status !== 'RUNNING'
}

/** 不可选行的提示文案 */
function disabledTipHandler(scope: { row: Record<string, unknown> }): string {
  return scope.row.status === 'RUNNING' ? '运行中任务不可选' : ''
}

// ========== ③ y-column-text formatter ==========

function formatCount(value: number): string {
  if (value == null) return '-'
  if (value === 0) return '-'
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
  return value.toLocaleString()
}

// ========== ④⑤⑥ y-column-filter 状态配置 ==========

/**
 * config 格式：{ text, value, color?, bgColor? }
 * color / bgColor 控制文字色和背景色，用于状态标签展示
 */
const statusConfig = [
  { text: '成功', value: 'SUCCESS', color: '#52c41a', bgColor: '#f6ffed' },
  { text: '运行中', value: 'RUNNING', color: '#1677ff', bgColor: '#e6f4ff' },
  { text: '失败', value: 'FAILED', color: '#ff4d4f', bgColor: '#fff2f0' },
  { text: '等待中', value: 'PENDING', color: '#faad14', bgColor: '#fffbe6' },
]

/** noStatus: 不显示颜色圆点，仅表头筛选 + 文本映射 */
const collectTypeConfig = [
  { text: '定时', value: '定时' },
  { text: '实时', value: '实时' },
  { text: '手动', value: '手动' },
]

/** noStatus + noFilter: 纯文本映射（只做 value → text 转换） */
const priorityConfig = [
  { text: '高', value: 'HIGH', color: '#ff4d4f' },
  { text: '中', value: 'MEDIUM', color: '#faad14' },
  { text: '低', value: 'LOW', color: '#8c8c8c' },
]

// ========== ⑧ y-column-op 操作列 ==========

/**
 * options 中每项的 scope.row 为当前行数据。
 * disabled 返回 boolean 控制按钮是否置灰。
 */
const tableActions: ColumnOpItemType[] = [
  {
    prop: 'collect',
    label: '手动采集',
    confirm: (scope: { row: Record<string, unknown> }) => {
      ElMessage.success(`已触发采集: ${scope.row.collectName}`)
    },
  },
  {
    prop: 'disableDemo',
    label: '禁用示例',
    // 运行中的任务此按钮置灰
    disabled: (scope: { row: Record<string, unknown> }) => {
      if (scope.row.status === 'RUNNING') {
        return [true, '运行状态不可操作']
      } else {
        return false
      }
    },
    confirm: () => {
      ElMessage('已执行')
    },
  },
  {
    prop: 'delete',
    label: '删除',
    dropdown: true,
    popover: true,
    popProps: {
      popContent: '是否确认删除该数据？',
    },
    confirm: _scope => {
      ElMessage('已删除')
    },
  },
  {
    prop: 'log',
    label: '运行日志',
    dropdown: true,
    confirm: (scope: { row: Record<string, unknown> }) => {
      handleShowLog(scope.row)
    },
  },
]

// ========== 运行日志抽屉 ==========

const drawerVisible = ref(false)
const logRow = ref<Record<string, unknown> | null>(null)

function handleShowLog(row: Record<string, unknown>) {
  logRow.value = row
  drawerVisible.value = true
}

// ========== 事件处理 ==========

function toDetail(row?: Record<string, unknown>): void {
  router.push({ name: 'ExampleDetail', query: { id: (row?.id ?? '') as string } })
}

function toCreate(): void {
  router.push({ name: 'ExampleForm' })
}

/** 批量删除：确认后模拟删除选中行 */
function handleBatchDelete() {
  const names = tableSelectData.value
    .map((row: Record<string, unknown>) => row.collectName)
    .join('、')
  ElMessageBox.confirm(`确定删除以下 ${selectNum.value} 条记录吗？\n${names}`, '批量删除确认', {
    type: 'warning',
    confirmButtonText: '确定删除',
  })
    .then(() => {
      ElMessage.success(`已删除 ${selectNum.value} 条记录`)
    })
    .catch(() => {})
}
</script>
