import { request } from '@/utils'

// 获取用户信息
export function getUserInfo() {
  return request.get('/user/info')
}
