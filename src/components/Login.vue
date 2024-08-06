<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { fetchInstance } from '@/utils/api'

const visible = defineModel({ type: Boolean, default: true })

const configStore = useConfigStore()
// const visible = ref(true)

const { host, username, password, token } = storeToRefs(configStore)

const { isFetching, execute, onFetchResponse, onFetchError } = fetchInstance(
  '/token/login',
  {
    headers: {
      authorization: `Basic ${btoa(`${username.value}:${password.value}`)}`
    }
  },
  { immediate: false }
)
onFetchResponse(async (response) => {
  if (response.ok) {
    const resToken = await response.json()
    token.value = resToken.token
    visible.value = false
  }
})
onFetchError(() => {
  token.value = ''
  visible.value = true
})
function login() {
  if (!host.value || !username.value || !password.value) return
  execute()
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    pt:root:class="!border-0 !bg-transparent w-full max-w-96"
    pt:mask:class="backdrop-blur-sm !pointer-events-auto"
  >
    <template #container>
      <div
        class="flex flex-col px-8 py-8 gap-6 rounded-2xl"
        style="
          background-image: radial-gradient(
            circle at left top,
            var(--p-primary-400),
            var(--p-primary-700)
          );
        "
      >
        <h1 class="text-white text-center text-3xl">登录</h1>
        <div class="inline-flex flex-col gap-2">
          <label for="host" class="text-primary-50 font-semibold">主机地址</label>
          <InputText
            id="host"
            v-model.trim="host"
            class="!bg-white/20 !border-0 !px-4 !py-2 !text-primary-50 w-full"
          />
        </div>
        <div class="inline-flex flex-col gap-2">
          <label for="username" class="text-primary-50 font-semibold">用户名</label>
          <InputText
            id="username"
            v-model.trim="username"
            class="!bg-white/20 !border-0 !px-4 !py-2 !text-primary-50 w-full"
          />
        </div>
        <div class="inline-flex flex-col gap-2">
          <label for="password" class="text-primary-50 font-semibold">密码</label>
          <InputText
            id="password"
            v-model.trim="password"
            class="!bg-white/20 !border-0 !px-4 !py-2 !text-primary-50 w-full"
            type="password"
          />
        </div>
        <div class="flex items-center gap-4">
          <Button
            text
            label="登录"
            class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"
            :disabled="isFetching"
            :loading="isFetching"
            @click="login"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>
