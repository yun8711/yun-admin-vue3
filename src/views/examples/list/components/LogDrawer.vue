<template>
  <y-drawer v-model="visible" title="运行日志" size="600px" confirm-text="关闭">
    <!-- 任务基本信息 -->
    <div class="pb-4 text-14 text-gray-500">
      数据源：{{ row?.datasourceName }}｜数据库：{{ row?.dbName }}
    </div>

    <!-- 日志列表 -->
    <y-table :data="logData" size="small" :pagination-props="{ total: logData.length }">
      <y-column-text prop="time" label="时间" width="170" />
      <y-column-filter prop="status" label="状态" width="100" :config="statusConfigMap" no-filter />
      <y-column-text prop="message" label="日志内容" min-width="240" />
    </y-table>
  </y-drawer>
</template>

<script setup lang="ts" name="LogDrawer">
defineOptions({ name: 'LogDrawer' })

// ========== Props & Emits ==========

const props = defineProps<{
  /** v-model 控制抽屉显隐 */
  modelValue: boolean
  /** 当前行数据，用于展示任务基本信息 */
  row: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

/** 双向绑定：内部 visible 与外部 modelValue 同步 */
const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// ========== 状态映射 ==========

const statusConfigMap = [
  { value: 'SUCCESS', text: '成功', color: '#52c41a', bgColor: '#f0f9eb' },
  { value: 'RUNNING', text: '运行中', color: '#1677ff', bgColor: '#e6f7ff' },
  { value: 'FAILED', text: '失败', color: '#ff4d4f', bgColor: '#ffeef0' },
  { value: 'PENDING', text: '等待中', color: '#faad14', bgColor: '#fffbe6' },
]

// ========== 日志数据 ==========

interface LogItem {
  time: string
  status: string
  message: string
}

const logData = ref<LogItem[]>([])

/** 抽屉打开时加载模拟日志数据 */
watch(visible, val => {
  if (val) {
    // 模拟日志数据（实际项目应调用接口获取）
    logData.value = [
      { time: '2026-07-01 02:00:00', status: 'SUCCESS', message: '任务触发成功' },
      { time: '2026-07-01 02:05:23', status: 'RUNNING', message: '全量数据抽取完成，共 12,580 条' },
      { time: '2026-07-01 02:08:10', status: 'FAILED', message: '数据写入 ODS 层完成' },
      { time: '2026-07-01 02:08:15', status: 'PENDING', message: 'DQC 校验通过，任务结束' },
    ]
  }
})
</script>
