<script setup lang="ts">
import { useRouteParams } from '@vueuse/router'
import { fetchInstance } from '@/utils/api'
import { computed, ref, reactive, watch } from 'vue'
import { useDateFormat } from '@vueuse/core'
import type { Rules } from 'async-validator'
import { useAsyncValidator } from '@vueuse/integrations/useAsyncValidator'
import { useToast } from 'primevue/usetoast'
import jq from 'jquery'

const code = useRouteParams('code')
const toast = useToast()

const { data: inviteDom, error } = fetchInstance<string>(`/invite/${code.value}`, {
  refetch: true
})
  .get()
  .text()

const htmlDoc = computed(() => jq(inviteDom.value!))

const htmlval = computed(() => {
  const embyHost = htmlDoc.value.find('#create-success-button').attr('href')
  const email = htmlDoc.value
    .find('div.flex-initial .col.aside')
    .text()
    .replace('需要帮助，请发邮件到', '')
  const userExpiry = htmlDoc.value.text()
  const userExpiryObj = {
    userExpiryMonths: 0,
    userExpiryDays: 0,
    userExpiryHours: 0,
    userExpiryMinutes: 0
  }
  for (const key in userExpiryObj) {
    const reg = new RegExp(`window\\.${key}\\s*=\\s*(\\d+)\\s*;`)
    const match = userExpiry.match(reg)
    if (match) {
      ;(userExpiryObj as Record<string, number>)[key] = parseInt(match[1])
    }
  }

  const userExpiryDate = (() => {
    const date = new Date()
    date.setMonth(date.getMonth() + userExpiryObj.userExpiryMonths)
    date.setDate(date.getDate() + userExpiryObj.userExpiryDays)
    date.setHours(date.getHours() + userExpiryObj.userExpiryHours)
    date.setMinutes(date.getMinutes() + userExpiryObj.userExpiryMinutes)
    return useDateFormat(date, 'YYYY-MM-DD HH:mm:ss').value
  })()

  return {
    embyHost,
    email,
    ...userExpiryObj,
    userExpiryDate
  }
})

const formData = ref({
  code: code.value,
  username: '',
  email: '',
  password: ''
})

const rules: Rules = {
  username: {
    type: 'string',
    required: true
  },
  email: [
    {
      type: 'email',
      required: true
    }
  ],
  password: {
    type: 'string',
    required: true
  }
}

const {
  pass,
  errorFields,
  execute: valida
} = useAsyncValidator(formData, rules, {
  immediate: false
})

const rePwd = (() => {
  const rePassword = ref('')
  const invalid = ref(true)

  const valida = () => {
    invalid.value = rePassword.value === formData.value.password
    return invalid.value
  }

  watch(rePassword, () => {
    invalid.value = true
  })

  return reactive({
    rePassword,
    invalid,
    valida
  })
})()

const success = ref(false)

const newUserIng = ref(false)

async function newUser() {
  newUserIng.value = true
  if (!((await valida()).pass && rePwd.valida())) {
    newUserIng.value = false
    return
  }
  try {
    const { response } = await fetchInstance('/newUser', {
      method: 'POST',
      body: JSON.stringify(formData.value)
    })
    const resData = await response.value?.json()
    if ('error' in resData) {
      throw resData.error
    }
    if (Object.keys(resData).every((key) => resData[key])) {
      success.value = true
    } else {
      throw 'errorUnknown'
    }
  } catch (error) {
    console.log(error)
    switch (error) {
      case 'errorInvalidCode':
        toast.add({ severity: 'error', summary: '注册失败', detail: '邀请码无效', life: 3000 })
        break
      case 'errorUserExists':
        toast.add({ severity: 'error', summary: '注册失败', detail: '用户名已存在', life: 3000 })
        break
      case 'errorEmailLinked':
        toast.add({ severity: 'error', summary: '注册失败', detail: '邮箱已被注册', life: 3000 })
        break
      default:
        toast.add({ severity: 'error', summary: '注册失败', detail: error, life: 3000 })
        break
    }
  } finally {
    newUserIng.value = false
  }
}

const downloadLink = [
  {
    title: '苹果TV/手机/平板',
    info: '操作视频教程',
    icon: 'logos--apple',
    link: 'https://www.emby123.cn:5001/sharing/ufj2abtDo'
  },
  {
    title: '安卓电视/手机/投影',
    info: '操作教程及软件下载',
    icon: 'logos--android-icon',
    link: 'https://www.emby123.cn:5001/sharing/kWC9KW4WQ'
  },
  {
    title: 'MacOS苹果电脑',
    info: '不支持INFUSE点这里',
    icon: 'logos--apple',
    link: 'https://www.emby123.cn:5001/sharing/dz6pPCKYr'
  },
  {
    title: 'Windows电脑',
    info: '操作教程及软件下载',
    icon: 'logos--microsoft-windows-icon',
    link: 'https://www.emby123.cn:5001/sharing/TcPN0FQPx'
  }
]
</script>

<template>
  <div class="invite">
    <div
      v-if="error"
      class="fixed inset-0 w-full h-full flex justify-center items-center overflow-hidden"
    >
      <div class="max-w-96 h-fit rounded-xl p-3" style="background-color: #282828">
        <h1 class="font-bold text-3xl">邀请码无效</h1>
        <h1 class="mb-2">邀请码可能不正确，或者已过期。</h1>
        <p>如需要帮助，请发邮件到 ashan0927@outlook.com</p>
      </div>
    </div>
    <main v-else class="mx-auto" style="max-width: 800px">
      <div class="my-4 p-4 overflow-hidden rounded-xl" style="background-color: #282828">
        <div class="flex items-center justify-between mb-4">
          <img src="@/assets/images/emby.png" class="h-10" />
          <h1 class="font-bold text-2xl">教程及软件下载</h1>
        </div>
        <div class="grid sm:grid-cols-2 gap-4 grid-cols-1">
          <a
            v-for="item in downloadLink"
            :key="item.title"
            :href="item.link"
            target="_blank"
            class="cursor-pointer bg-white/10 hover:bg-white/20 rounded-xl flex-1 h-16 flex justify-between items-center p-3"
          >
            <span class="h-full aspect-square overflow-hidden">
              <i :class="`pi icon-[${item.icon}] block h-full w-full`"></i>
            </span>
            <div class="iconify mdi-light--home text-blue-600 text-right">
              <h1 class="text-primary-50">{{ item.title }}</h1>
              <p class="text-white text-sm text-white/50">{{ item.info }}</p>
            </div>
          </a>
        </div>
      </div>
      <form
        class="my-4 p-4 w-full overflow-hidden rounded-xl"
        style="background-color: #282828"
        @submit.prevent="newUser"
      >
        <h1 class="flex justify-between items-center">
          <span class="font-bold text-2xl">创建用户</span>
          <span class="p-2 text-sm rounded-md bg-orange-600">
            账号有效期:
            <span class="font-bold">
              {{
                (htmlval.userExpiryMonths ? htmlval.userExpiryMonths + ' 月' : '') +
                (htmlval.userExpiryDays ? htmlval.userExpiryDays + ' 天' : '') +
                (htmlval.userExpiryHours ? htmlval.userExpiryHours + ' 小时' : '') +
                (htmlval.userExpiryMinutes ? htmlval.userExpiryMinutes + ' 分钟' : '')
              }}
            </span>
          </span>
        </h1>
        <section class="p-4 flex flex-col">
          <!-- 用户名 -->
          <div class="mb-3">
            <label for="用户名" class="text-primary-50">用户名</label>
            <InputText
              id="用户名"
              v-model.trim="formData.username"
              placeholder="用户名"
              class="mt-1 !bg-white/10 !px-4 !py-2 !text-primary-50 w-full"
              :invalid="!!errorFields?.username"
            />
            <div class="flex items-center h-5">
              <i v-show="errorFields?.username" class="text-red-400 text-sm">用户名不能为空</i>
            </div>
          </div>
          <!-- 电子邮箱 -->
          <div class="mb-3">
            <label for="电子邮箱" class="text-primary-50">电子邮箱</label>
            <InputText
              id="电子邮箱"
              v-model.trim="formData.email"
              placeholder="电子邮箱"
              class="mt-1 !bg-white/10 !px-4 !py-2 !text-primary-50 w-full"
              :invalid="!!errorFields?.email"
            />
            <div class="flex items-center h-5">
              <i v-show="errorFields?.email" class="text-red-400 text-sm">邮箱格式不正确</i>
            </div>
          </div>
          <!-- 密码 -->
          <div class="mb-3">
            <label for="密码" class="text-primary-50">密码</label>
            <InputText
              id="密码"
              v-model.lazy="formData.password"
              placeholder="密码"
              type="password"
              class="mt-1 !bg-white/10 !px-4 !py-2 !text-primary-50 w-full"
              :invalid="!!errorFields?.password"
            />
            <div class="flex items-center h-5">
              <i v-show="errorFields?.password" class="text-red-400 text-sm">密码不能为空</i>
            </div>
          </div>
          <!-- 确认密码 -->
          <div class="mb-3">
            <label for="确认密码" class="text-primary-50">确认密码</label>
            <InputText
              id="确认密码"
              v-model.lazy="rePwd.rePassword"
              placeholder="确认密码"
              type="rePassword"
              class="mt-1 !bg-white/10 !px-4 !py-2 !text-primary-50 w-full"
              :invalid="!rePwd.invalid"
            />
            <div class="flex items-center h-5">
              <i v-show="!rePwd.invalid" class="text-red-400 text-sm">两次密码不一致</i>
            </div>
          </div>
        </section>
        <div class="btn-box">
          <Button
            type="submit"
            label="创建账户"
            severity="info"
            sec
            class="newAccBtn w-full"
            :loading="newUserIng"
            :disabled="!pass"
          />
        </div>
      </form>
    </main>
    <div
      v-if="success"
      class="fixed inset-0 w-full h-full flex justify-center items-center overflow-hidden"
      style="background-color: #101010"
    >
      <div class="max-w-96 h-fit rounded-xl p-3" style="background-color: #282828">
        <h1 class="font-bold text-3xl">成功！</h1>
        <h1 class="mb-2">你的账户已成功创建！！</h1>
        <p class="h-24 text-wrap">
          点击继续按钮，将会跳转到Emby登录 <br />
          Emby地址: {{ htmlval.embyHost }}
        </p>
        <Button
          label="继续"
          as="a"
          :href="htmlval.embyHost"
          target="_blank"
          class="w-full btn-emby"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.btn-box {
  ::v-deep(.newAccBtn) {
    .p-button-label {
      @apply font-bold text-white;
    }
  }
}
.btn-emby {
  ::v-deep(.p-button-label) {
    @apply text-white text-2xl;
  }
}
</style>
