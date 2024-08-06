import { createFetch } from '@vueuse/core'
import { useConfigStore } from '@/stores/config'

export const fetchInstance = createFetch({
  options: {
    beforeFetch({ url, options }) {
      const configStore = useConfigStore()
      // url = `/api?url=${configStore.host}${url}`
      url = `/_proxy_/${configStore.host}${url}`

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
