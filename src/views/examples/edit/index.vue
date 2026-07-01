<template>
  <div class="page-with-header">
    <y-page-header title="编辑采集任务" />
    <!-- 表单区域 -->
    <y-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :span="12"
      :gutter="1"
      row-class="mt-4"
    >
      <y-form-item label="采集名称" prop="collectName">
        <div class="w-[316px]">
          <el-input v-model="formData.collectName" placeholder="请输入采集名称" maxlength="50" />
        </div>
      </y-form-item>
      <y-form-item label="数据源" prop="datasourceName">
        <div class="w-[316px]">
          <el-select
            v-model="formData.datasourceName"
            :options="datasourceOptions"
            placeholder="请选择数据源"
          />
        </div>
      </y-form-item>
      <y-form-item label="数据库类型" prop="dbType">
        <div class="w-[316px]">
          <el-select
            v-model="formData.dbType"
            :options="dbTypeOptions"
            placeholder="请选择数据源"
          />
        </div>
      </y-form-item>
      <y-form-item label="数据库名" prop="dbName">
        <el-input v-model="formData.dbName" style="width: 316px" placeholder="请输入数据库名" />
      </y-form-item>
      <y-form-item label="采集方式" prop="collectType">
        <y-group-select v-model="formData.collectType" :options="collectTypeOptions" />
      </y-form-item>
      <y-form-item label="优先级" prop="priority">
        <el-radio-group v-model="formData.priority">
          <el-radio v-for="item in priorityOptions" :key="item.value" :label="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </y-form-item>
      <y-form-item label="运行环境" prop="envType">
        <el-select
          v-model="formData.envType"
          :options="envTypeOptions"
          placeholder="请选择运行环境"
          style="width: 316px"
        />
      </y-form-item>
      <y-form-item label="CRON 表达式" prop="cronExpression" :span="12">
        <el-input
          v-model="formData.cronExpression"
          style="width: 316px"
          placeholder="例：0 0 2 * * ?"
        />
      </y-form-item>
      <y-form-item label="超时时间(秒)" prop="timeout" :span="12">
        <el-input-number
          v-model="formData.timeout"
          :min="0"
          :max="86400"
          :step="60"
          controls-position="right"
          class="w-full"
        />
      </y-form-item>
      <y-form-item label="重试次数" prop="retryCount" :span="12">
        <el-input-number
          v-model="formData.retryCount"
          :min="0"
          :max="10"
          controls-position="right"
          class="w-full"
        />
      </y-form-item>
      <y-form-item label="分片数量" prop="shardCount" :span="12">
        <el-input-number
          v-model="formData.shardCount"
          :min="1"
          :max="32"
          controls-position="right"
          class="w-full"
        />
      </y-form-item>
      <!-- 备注占整行 -->
      <y-form-item label="备注" prop="remark" :span="24">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="200"
          show-word-limit
        />
      </y-form-item>
    </y-form>
    <!-- 表格表单演示：关联数据源 -->
    <y-part-title title="关联数据源" class="mt-6 mb-4" />
    <div class="flex gap-4 mb-4">
      <el-button type="primary" @click="handleAddRow">新增行</el-button>
      <el-button @click="handleClearTable">清空</el-button>
    </div>
    <y-table :data="tableData" :show-footer="false">
      <el-table-column type="index" label="序号" width="60" />
      <y-column-form prop="datasourceName" label="数据源" width="220">
        <template #default="{ row }">
          <el-select
            v-model="row.datasourceName"
            :options="datasourceOptions"
            placeholder="请选择"
          />
        </template>
      </y-column-form>
      <y-column-form prop="dbName" label="数据库名" width="180">
        <template #default="{ row }">
          <el-input v-model="row.dbName" placeholder="请输入" />
        </template>
      </y-column-form>
      <y-column-form prop="collectType" label="采集方式" width="260">
        <template #default="{ row }">
          <y-group-select v-model="row.collectType" :options="collectTypeOptions" />
        </template>
      </y-column-form>
      <y-column-form prop="remark" label="备注" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.remark" placeholder="备注" />
        </template>
      </y-column-form>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ $index }">
          <el-button type="danger" link @click="handleDeleteRow($index)">删除</el-button>
        </template>
      </el-table-column>
    </y-table>
    <!-- 底部操作栏 -->
    <y-page-footer :left="sidebarWidth" style="gap: 10px">
      <y-button model="debounce" type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </y-button>
      <el-button @click="handleReset">重置</el-button>
      <el-button type="info" @click="handleCancel">取消</el-button>
    </y-page-footer>
  </div>
</template>

<script setup lang="ts" name="ExampleFormPage">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getDetail } from '@/api/example'
import { injectSidebarWidth } from '@/composables/useSidebarWidth'
const router = useRouter()
const sidebarWidth = injectSidebarWidth()

// ========== 表单引用 ==========
const formRef = ref<FormInstance>()
const submitting = ref(false)

// ========== 表单数据 ==========
interface EditFormData {
  collectName: string
  datasourceName: string
  dbType: string
  dbName: string
  collectType: string
  priority: string
  envType: string
  cronExpression: string
  timeout: number | undefined
  retryCount: number | undefined
  shardCount: number | undefined
  remark: string
}
const formData = reactive<EditFormData>({
  collectName: '',
  datasourceName: '',
  dbType: '',
  dbName: '',
  collectType: '定时',
  priority: 'MEDIUM',
  envType: '',
  cronExpression: '',
  timeout: undefined,
  retryCount: undefined,
  shardCount: undefined,
  remark: '',
})

// ========== 表单校验规则 ==========
const formRules: FormRules = {
  collectName: [
    { required: true, message: '请输入采集名称', trigger: 'blur' },
    { max: 50, message: '采集名称不超过 50 个字符', trigger: 'blur' },
  ],
  datasourceName: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  dbType: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  dbName: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
  collectType: [{ required: true, message: '请选择采集方式', trigger: 'change' }],
  envType: [{ required: true, message: '请选择运行环境', trigger: 'change' }],
}

// ========== 下拉选项 ==========
const datasourceOptions = [
  { value: 'mysql_74_3309', label: 'mysql_74_3309' },
  { value: 'kafka_prod_cluster', label: 'kafka_prod_cluster' },
  { value: 'hdfs_logs_namenode', label: 'hdfs_logs_namenode' },
  { value: 'clickhouse_bi', label: 'clickhouse_bi' },
]
const dbTypeOptions = [
  { value: 'MySQL', label: 'MySQL' },
  { value: 'Kafka', label: 'Kafka' },
  { value: 'HDFS', label: 'HDFS' },
  { value: 'ClickHouse', label: 'ClickHouse' },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'Oracle', label: 'Oracle' },
]
const collectTypeOptions = [
  { value: '定时', label: '定时' },
  { value: '实时', label: '实时' },
  { value: '手动', label: '手动' },
]
const priorityOptions = [
  { value: 'HIGH', label: '高' },
  { value: 'MEDIUM', label: '中' },
  { value: 'LOW', label: '低' },
]
const envTypeOptions = [
  { value: '开发环境', label: '开发环境' },
  { value: '测试环境', label: '测试环境' },
  { value: '预发环境', label: '预发环境' },
  { value: '生产环境', label: '生产环境' },
]

// ========== 表格数据 ==========
interface TableRow {
  datasourceName: string
  dbName: string
  collectType: string
  remark: string
}
const tableData = reactive<TableRow[]>([
  {
    datasourceName: 'mysql_74_3309',
    dbName: 'nc_test',
    collectType: '定时',
    remark: '每日凌晨同步',
  },
  { datasourceName: 'clickhouse_bi', dbName: 'user_profile', collectType: '实时', remark: '' },
])
function handleAddRow() {
  tableData.push({ datasourceName: '', dbName: '', collectType: '定时', remark: '' })
}
function handleDeleteRow(index: number) {
  tableData.splice(index, 1)
}
function handleClearTable() {
  tableData.splice(0)
}

// ========== 事件处理 ==========
function handleSubmit() {
  if (!formRef.value) return
  formRef.value.validate(valid => {
    if (!valid) {
      ElMessage.warning('请检查表单填写')
      return
    }
    submitting.value = true
    // 模拟提交
    setTimeout(() => {
      submitting.value = false
      ElMessage.success('保存成功')
      router.push({ name: 'ExampleCrud' })
    }, 800)
  })
}
function handleReset() {
  formRef.value?.resetFields()
  ElMessage.info('已重置')
}
function handleCancel() {
  router.push({ name: 'ExampleCrud' })
}

// ========== 初始化：加载编辑数据 ==========
function loadEditData() {
  getDetail().then(res => {
    // 只取表单需要的字段
    const fields: (keyof EditFormData)[] = [
      'collectName',
      'datasourceName',
      'dbType',
      'dbName',
      'collectType',
      'priority',
      'envType',
      'cronExpression',
      'timeout',
      'retryCount',
      'shardCount',
      'remark',
    ]
    fields.forEach(key => {
      if (res[key] !== undefined) {
        ;(formData as Record<string, unknown>)[key] = res[key]
      }
    })
  })
}
loadEditData()
</script>
