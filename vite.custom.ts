/**
 * 项目配置入口。构建和运行时需要改的项都写在这里。
 */

import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

import packageJson from './package.json' with { type: 'json' }
import type { AppConfig, RequestConfig } from './src/types/custom-config'

const projectName = packageJson.name
const nodeEnv =
  import.meta.env?.MODE ||
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV

export const appConfig: AppConfig = {
  inQiankun: !!qiankunWindow.__POWERED_BY_QIANKUN__,
  isProd: nodeEnv === 'production',
  isDev: nodeEnv === 'development',
  // 后端API地址
  host: 'http://192.168.12.195',
  name: projectName,
  // 前端项目端口
  port: 8026,
  // 前端项目入口，线上线下保持一致
  base: `/subapp/${projectName}/`,
  // 浏览器标签页标题
  title: 'Yun Admin',
  // 开发环境跳过菜单权限，生产环境按后端菜单过滤
  skipMenuAuth: nodeEnv !== 'production',
}

export const requestConfig: RequestConfig = {
  // 后端API前缀
  baseURL: '/api',
  // 后端API返回数据路径
  resPath: 'data',
  // 后端API错误数据路径
  errorPath: 'data',
  // 后端API请求超时时间
  timeout: 90000,
  // 后端API前缀
  apiPrefix: '',
  // 后端API前缀列表
  apiPrefixes: [
    { prefix: '/rhea' },
    { prefix: '/daas' },
    { prefix: '/indicator' },
    { prefix: '/poseidon' },
    { prefix: '/label' },
  ],
  // 开发环境代理后缀
  devProxySuffix: '_dev',
}
