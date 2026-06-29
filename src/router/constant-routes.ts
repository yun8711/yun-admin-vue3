import type { RouteRecordRaw } from 'vue-router'

import { SKIP_MENU_AUTH } from '@/config/menu'
import BasicLayout from '@/layouts/BasicLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'

/** 初始兜底路由 name，动态路由生成后会被 finalRoute 替换 */
export const CATCH_ALL_NAME = '__catch_all__'

// 固定路由：无需登录/权限，路由创建时即注册。
export const constantRoutes: RouteRecordRaw[] = [
  // 跳过菜单权限时不注册登录页，子应用由主应用统一认证
  ...(!SKIP_MENU_AUTH
    ? [
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
        } as RouteRecordRaw,
      ]
    : []),
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
  // 初始兜底：动态路由未生成前，未知路径静默重定向到 /，
  // 避免 app.use(router) 时 Vue Router 对未匹配路径报 warning。
  {
    path: '/:pathMatch(.*)*',
    name: CATCH_ALL_NAME,
    redirect: '/',
    meta: { noAuth: true },
  },
]

// 最终兜底路由：动态路由注入后替换初始兜底，未知路径重定向到 404。
export const finalRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFoundFallback',
  redirect: '/404',
  meta: { noAuth: true },
}
