import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import BasicLayout from '@/layouts/BasicLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录', noAuth: true },
      },
    ],
  },
  {
    path: '/',
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', noAuth: true },
  },
]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

export default router
