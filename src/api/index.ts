import { request } from '@/utils'

// 登录
export function login(data: { username: string; password: string }) {
  return request.post('/auth/login', data)
}

// 登出
export function logout() {
  return request.post('/auth/logout')
}

// 获取用户信息
export function getUserInfo() {
  return request.get('/user/info')
}
