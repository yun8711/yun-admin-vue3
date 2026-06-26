import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 恢复 token，保证刷新后登录态不丢失（路由守卫依赖它）。
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>('')

  function setToken(val: string) {
    token.value = val
    localStorage.setItem('token', val)
  }

  function setUsername(val: string) {
    username.value = val
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
  }

  return { token, username, setToken, setUsername, logout }
})
