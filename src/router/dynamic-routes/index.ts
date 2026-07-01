import type { RouteRecordRaw } from 'vue-router'

import exampleRoutes from './example'
import homeRoutes from './home'
import modelRoutes from './model'

export const asyncRoutes: RouteRecordRaw[] = [exampleRoutes, homeRoutes, modelRoutes]
