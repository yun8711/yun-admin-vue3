import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

const baseURL = import.meta.env.VITE_APP_BASE_API || '/api'

const request = axios.create({ baseURL, timeout: 10000 })

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: 从 store 或 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    // 根据实际后端约定调整
    if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    return data
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
