import type { RouteRecordRaw } from 'vue-router'

import BasicLayout from '@/layouts/BasicLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'

// 固定路由：无需登录/权限，路由创建时即注册。
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: BlankLayout,
    meta: { noAuth: true },
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
    path: '/404',
    component: BlankLayout,
    meta: { noAuth: true },
    children: [
      {
        path: '',
        name: 'NotFound',
        component: () => import('@/views/error/404.vue'),
        meta: { title: '404', noAuth: true },
      },
    ],
  },
  {
    // 主布局根路由，动态路由通过 addRoute('Root', ...) 注入为子路由。
    path: '/',
    name: 'Root',
    component: BasicLayout,
  },
]

// 兜底路由：动态路由注入后追加到末尾，匹配未知路径重定向到 404。
export const finalRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFoundFallback',
  redirect: '/404',
  meta: { noAuth: true },
}
