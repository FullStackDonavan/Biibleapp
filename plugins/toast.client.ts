// plugins/toast.client.ts
import Toast, { type PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  const options: PluginOptions = {
    // You can add your options here
  }

  nuxtApp.vueApp.use(Toast, options)
})
