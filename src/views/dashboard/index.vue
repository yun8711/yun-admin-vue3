<template>
  <div class="dashboard">
    <h1 class="text-xl font-bold mb-4">欢迎使用 Yun Admin</h1>
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
  </div>
</template>

<script setup lang="ts"></script>
