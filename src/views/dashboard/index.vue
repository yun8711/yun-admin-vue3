<template>
  <div class="dashboard">
    <y-page-header>
      <template #extra>
        <el-tag type="success" effect="dark">yun-elp 1.2.2 接入成功</el-tag>
      </template>
      <template #right>
        <y-button type="primary">新建任务</y-button>
      </template>
    </y-page-header>

    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <span>访问量</span>
          </template>
          <div class="text-2xl font-bold text-primary">1,234</div>
          <div class="text-gray-500 text-sm mt-1">今日访问</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <span>用户数</span>
          </template>
          <div class="text-2xl font-bold text-success">567</div>
          <div class="text-gray-500 text-sm mt-1">总用户</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <span>订单数</span>
          </template>
          <div class="text-2xl font-bold text-warning">89</div>
          <div class="text-gray-500 text-sm mt-1">待处理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <span>消息</span>
          </template>
          <div class="text-2xl font-bold text-info">12</div>
          <div class="text-gray-500 text-sm mt-1">未读消息</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-4" shadow="never">
      <y-part-title title="组件库接入验证">
        <template #right>
          <y-button plain>查看组件文档</y-button>
        </template>
      </y-part-title>
      <div class="mt-3 text-sm text-gray-500">
        当前模板项目已切换为 npm 发布版 `yun-elp@1.2.2`，启用了 `YunElpResolver` 按需导入和
        `kd.scss` 主题注入。
      </div>
    </el-card>

    <el-card class="mt-4" shadow="never">
      <y-part-title title="UnoCSS 图标集合验证" />
      <div class="mt-3 flex items-center gap-6 text-sm text-gray-500">
        <div class="inline-flex items-center gap-2">
          <i class="i-fill-logo text-24 text-primary" />
          <span>`&lt;i class=\"i-fill-logo text-24 text-primary\" /&gt;`</span>
        </div>
        <div class="inline-flex items-center gap-2">
          <i class="i-icon-card text-18 text-success" />
          <span>`&lt;i class=\"i-icon-card text-18 text-success\" /&gt;`</span>
        </div>
        <div class="inline-flex items-center gap-2">
          <i class="i-ep-folder-opened text-18 text-warning" />
          <span>`&lt;i class=\"i-ep-folder-opened text-18 text-warning\" /&gt;`</span>
        </div>
        <div class="inline-flex items-center gap-2">
          <i class="iconfont icon-menu-fold text-18 text-info" />
          <span>`&lt;i class=\"iconfont icon-menu-fold text-18 text-info\" /&gt;`</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts"></script>
