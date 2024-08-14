import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore(
  'config',
  () => {
    // const host = ref('')

    const username = ref('')

    const password = ref('')

    const token = ref('')

    //Auth base64
    // const auth = computed(() => btoa(`${username.value}:${password.value}`))

    // const isLogin = computed(() => account.value !== '' && password.value !== '')

    return {
      // host,
      username,
      password,
      token

      // isLogin
    }
  },
  {
    persist: true
  }
)
