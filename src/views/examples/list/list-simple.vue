<template>
  <div class="page-with-header">
    <y-page-header />

    <div>
      <y-table-search
        :options="options"
        @search="autoSearchQuery"
        @reset="autoSearchReset"
        @change="autoSearchChange"
      />

      <y-table
        ref="yTableRef"
        :data="tableData"
        :loading="tableLoading"
        :pagination-props="paginationProps"
        class="mt-2"
        @pagination-change="tablePageChange"
        @selection-change="tableSelectionChange"
      >
        <y-column-text prop="collectName" label="采集名称" />
        <y-column-text prop="datasourceName" label="数据源" />
        <y-column-text prop="dbType" label="数据源类型" />
        <y-column-text prop="role" label="角色" />
        <y-column-text prop="status" label="状态" />
        <y-column-text prop="createTime" label="创建时间" />
        <y-column-op label="操作" :options="tableActions" />
      </y-table>
    </div>
  </div>
</template>

<script lang="ts" setup name="SimpleListPage">
import { ElInput } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ref, markRaw } from 'vue'

import { getList } from '@/api/example'
import { useTable } from '@/composables/useTable'

const yTableRef = ref()

const options = ref([
  {
    prop: 'keyword',
    label: '关键词',
    comp: markRaw(ElInput),
    innerAttrs: {
      clearable: true,
    },
  },
])

const {
  tableData,
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

const tableActions = [
  {
    prop: 'view',
    label: '手动采集',
    confirm: (_scope: unknown) => {
      ElMessage.success('This is a message.')
    },
  },
]
</script>
