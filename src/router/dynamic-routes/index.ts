import type { RouteRecordRaw } from 'vue-router'

import exampleRoutes from './example'
import homrRoutes from './home'
import modelRoutes from './model'

export const asyncRoutes: RouteRecordRaw[] = [exampleRoutes, homrRoutes, modelRoutes]
