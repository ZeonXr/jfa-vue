<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { fetchInstance } from '@/utils/api'
import { computed, ref } from 'vue'

const visible = defineModel({ type: Boolean, default: true })

const configStore = useConfigStore()

const { host, username, password, token } = storeToRefs(configStore)

const BasicToken = computed(() => btoa(`${username.value}:${password.value}`))

const isFetching = ref(false)

async function login() {
  if (!host.value || !username.value || !password.value) return
  isFetching.value = true
  try {
    const { data } = await fetchInstance('/token/login', {
      headers: {
        authorization: `Basic ${BasicToken.value}`
      }
    }).json()
    token.value = data.value.token
    visible.value = false
  } catch (_) {
    token.value = ''
    visible.value = true
  } finally {
    isFetching.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    pt:root:class="!border-0 !bg-transparent w-full max-w-96"
    pt:mask:class="backdrop-blur-sm !pointer-events-auto"
  >
    <template #container>
      <form
        class="flex flex-col px-8 py-8 gap-6 rounded-2xl"
        style="
          background-image: radial-gradient(
            circle at left top,
            var(--p-primary-400),
            var(--p-primary-700)
          );
        "
        @submit.prevent="login"
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
            type="submit"
            class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"
            :disabled="isFetching"
            :loading="isFetching"
          />
        </div>
      </form>
    </template>
  </Dialog>
</template>
