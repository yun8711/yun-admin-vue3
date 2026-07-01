<template>
  <div class="page-with-header">
    <!-- 页面标题：title 默认取自 route.meta.title -->
    <y-page-header title="详情展示" />

    <!--
        ② y-desc：描述列表（水平三列）。
        config 数组中每项通过 path 指定数据字段名，label 指定展示文案。
        format 用于数据格式化，如数字千分位、时间转换等。
      -->
    <y-part-title title="基本信息" class="mt-2 mb-4" />
    <y-desc :config="basicInfoConfig" :data="detailData" :column="3" />

    <!-- y-group-select 三 tab 切换演示 -->
    <div class="mt-6">
      <y-group-select v-model="activeTab" :options="tabOptions" />
      <div class="mt-4">
        <!-- 配置详情 tab -->
        <y-desc
          v-if="activeTab === 'config'"
          :config="configInfoConfig"
          :data="detailData"
          :column="3"
        />
        <!-- 元数据 tab -->
        <y-desc
          v-else-if="activeTab === 'meta'"
          :config="metaInfoConfig"
          :data="detailData"
          :column="3"
        >
          <template #status-content="{ content }">
            <span class="flex items-center gap-1">
              <span
                class="inline-block w-2 h-2 rounded-full"
                :style="{ backgroundColor: statusColorMap[content as string] || '#999' }"
              />
              {{ statusTextMap[content as string] || content || '-' }}
            </span>
          </template>
        </y-desc>
        <!-- 运行日志 tab（演示数据） -->
        <y-desc v-else :config="logTabConfig" :data="detailData" :column="3" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ExampleDetailPage">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import type { DescItem } from 'yun-elp'

import { getDetail } from '@/api/example'
// ========== 详情数据类型 ==========
interface DetailData extends Record<string, unknown> {
  id?: string
  collectName?: string
  datasourceName?: string
  dbType?: string
  dbName?: string
  status?: string
  priority?: string
  envType?: string
  remark?: string
  collectType?: string
  lastCollectTime?: string
  collectCount?: number
  cronExpression?: string
  timeout?: number
  retryCount?: number
  retryInterval?: number
  shardCount?: number
  createTime?: string
  creator?: string
  updateTime?: string
  updater?: string
}

// ========== 数据 ==========

const detailLoading = ref(false)
const detailData = reactive<DetailData>({})

// ========== 常量映射 ==========

const statusColorMap: Record<string, string> = {
  SUCCESS: '#52c41a',
  RUNNING: '#1677ff',
  FAILED: '#ff4d4f',
  PENDING: '#faad14',
}

const statusTextMap: Record<string, string> = {
  SUCCESS: '成功',
  RUNNING: '运行中',
  FAILED: '失败',
  PENDING: '等待中',
}

const priorityTextMap: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
}

// ========== 基本信息 config ==========

/**
 * y-desc DescItem 配置说明：
 * - path  —— 从 data 中取值的字段名（支持 lodash get 路径，如 'a.b.c'）
 * - label —— 展示的标签文本
 * - content —— 静态内容（设置后不再从 data 取值）
 * - format —— 对取到的 value 做格式化
 * - span —— 列跨度，默认 1（设为 'column' 则占满整行）
 * - noTooltip —— 禁用文本溢出 tooltip
 */
const basicInfoConfig = [
  { path: 'collectName', label: '采集名称' },
  { path: 'datasourceName', label: '数据源' },
  { path: 'dbType', label: '数据库类型' },
  { path: 'dbName', label: '数据库名' },
  { path: 'envType', label: '运行环境' },
  { path: 'collectType', label: '采集方式' },
  {
    path: 'collectCount',
    label: '采集数量',
    contentAlign: 'right',
    format: (val: number) => {
      if (val == null || val === 0) return '-'
      if (val >= 10000) return `${(val / 10000).toFixed(1)} 万`
      return val.toLocaleString()
    },
  },
  { path: 'lastCollectTime', label: '上次采集' },
  { label: '所属项目', content: '数据中台-离线数仓' },
] as DescItem[]

// ========== y-group-select 演示 ==========

/** 当前选中 tab 对应的 value */
const activeTab = ref('config')

/** y-group-select 选项列表，每个 option.value 对应一个 tab */
const tabOptions = [
  { value: 'config', label: '配置详情' },
  { value: 'meta', label: '元数据' },
  { value: 'log', label: '运行日志' },
]

// ========== 配置详情 config ==========

const configInfoConfig = [
  { path: 'cronExpression', label: 'CRON 表达式' },
  {
    path: 'timeout',
    label: '超时时间',
    format: (val: number) => (val ? `${val} 秒` : '-'),
  },
  {
    path: 'retryCount',
    label: '重试次数',
    format: (val: number) => (val != null ? `${val} 次` : '不重试'),
  },
  {
    path: 'retryInterval',
    label: '重试间隔',
    format: (val: number) => (val ? `${val} 秒` : '-'),
  },
  { path: 'shardCount', label: '分片数量' },
] as DescItem[]

// ========== 元数据 config ==========

/**
 * prop 字段为具名插槽提供前缀：`[prop]-content` / `[prop]-label`。
 * 状态列通过 slot#status-content 自定义渲染（颜色圆点 + 标签）。
 */
const metaInfoConfig = [
  { path: 'createTime', label: '创建时间' },
  { path: 'creator', label: '创建人' },
  { path: 'updateTime', label: '更新时间' },
  { path: 'updater', label: '更新人' },
  { path: 'status', label: '当前状态', prop: 'status' },
  {
    path: 'priority',
    label: '优先级',
    format: (val: string) => priorityTextMap[val] || val || '-',
  },
] as DescItem[]

// ========== 运行日志 tab config（演示占位） ==========

const logTabConfig = [
  { path: 'remark', label: '备注信息', span: 'column' },
  { label: '最近日志', content: '暂无运行日志', span: 'column' },
] as DescItem[]

// ========== 初始化 ==========

function loadDetail() {
  detailLoading.value = true
  getDetail()
    .then(res => {
      Object.assign(detailData, res)
    })
    .catch(() => {
      ElMessage.error('加载详情失败')
    })
    .finally(() => {
      detailLoading.value = false
    })
}

loadDetail()
</script>
