import { createFetch } from '@vueuse/core'
import { useConfigStore } from '@/stores/config'

export const fetchInstance = createFetch({
  options: {
    beforeFetch({ url, options }) {
      const configStore = useConfigStore()
      // url = `/api?url=${configStore.host}${url}`
      url = `${import.meta.env.VITE_PROXY_PREFIX}${import.meta.env.VITE_JFA_API_URL}${url}`

      if (configStore.token !== '') {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${configStore.token}`
        }
      }
      return { url }
    }
  }
})
