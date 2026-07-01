<template>
  <y-drawer v-model="visible" title="运行日志" size="600px" confirm-text="关闭">
    <!-- 任务基本信息 -->
    <div class="pb-4 text-14 text-gray-500">
      数据源：{{ row?.datasourceName }}｜数据库：{{ row?.dbName }}
    </div>

    <!-- 日志列表 -->
    <el-table :data="logData" size="small" border>
      <el-table-column prop="time" label="时间" width="170" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row: logRow }">
          <span class="inline-flex items-center gap-1">
            <span
              class="inline-block w-2 h-2 rounded-full"
              :style="{ backgroundColor: statusColorMap[logRow.status] || '#999' }"
            />
            {{ statusTextMap[logRow.status] || logRow.status }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="日志内容" min-width="240" show-overflow-tooltip />
    </el-table>

    <!-- <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template> -->
  </y-drawer>
</template>

<script setup lang="ts" name="LogDrawer">
import { computed, ref, watch } from 'vue'

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
      { time: '2026-07-01 02:05:23', status: 'SUCCESS', message: '全量数据抽取完成，共 12,580 条' },
      { time: '2026-07-01 02:08:10', status: 'SUCCESS', message: '数据写入 ODS 层完成' },
      { time: '2026-07-01 02:08:15', status: 'SUCCESS', message: 'DQC 校验通过，任务结束' },
    ]
  }
})
</script>
