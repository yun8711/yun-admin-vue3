import { createPinia } from 'pinia'
import { createApp } from 'vue'

import 'uno.css'
import '@/assets/iconfont/iconfont.css'
import '@/styles/index.scss'
import 'yun-elp/themes/kd.scss'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
