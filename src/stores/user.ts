import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
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
