<script setup lang="ts">
import Login from '@/components/Login.vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { fetchInstance } from '@/utils/api'
import { computed, ref, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
import { useClipboard } from '@vueuse/core'
import { useConfirm } from 'primevue/useconfirm'

const configStore = useConfigStore()
const { host } = storeToRefs(configStore)

const arropt = Array.from({ length: 31 }, (_, k) => ({ label: k + '', value: k }))

const formData = ref({
  months: 0,
  days: 0,
  hours: 0,
  minutes: 30,
  'user-expiry': true,
  'user-months': 1,
  'user-days': 0,
  'user-hours': 0,
  'user-minutes': 0,
  'multiple-uses': false,
  'no-limit': false,
  'remaining-uses': 1,
  'send-to': '',
  profile: 'vip模版',
  label: '',
  user_label: ''
})

const { data, execute: refresh } = fetchInstance('/invites', {
  refetch: true,
  immediate: false
})
  .get()
  .json()
const invites = computed(() => data.value?.invites || [])
const profiles = computed(() => {
  const defaultProfiles = [
    {
      label: '没有个人资料',
      value: ''
    }
  ]
  const arrProfiles = (data.value?.profiles || []).map((item: string) => ({
    label: item,
    value: item
  }))
  return defaultProfiles.concat(arrProfiles)
})

const loging = ref(true)

const interval = ref<number | null>(null)

watch(loging, (value) => {
  if (!value) {
    refresh()
    interval.value = setInterval(() => {
      refresh()
    }, 1000 * 30)
  } else {
    clearInterval(interval.value?.valueOf())
  }
})

const countInvite = ref(1)
const createInviteIng = ref(false)
async function createInvite() {
  createInviteIng.value = true
  const invteArr = []
  for (let i = 0; i < countInvite.value; i++) {
    invteArr.push(
      fetchInstance('/invites')
        .post({
          ...formData.value
        })
        .json()
    )
  }
  await Promise.all(invteArr)
  await refresh()
  createInviteIng.value = false
}

const { copy } = useClipboard()

function copyItem(code: string) {
  copy(host.value + '/invite/' + code)
}

function copyAll() {
  copy(invites.value.map((item: any) => host.value + '/invite/' + item.code).join('\n'))
}

function deleteItem(code: string) {
  fetchInstance('/invites').delete({
    code: code
  })
  refresh()
}

const confirm = useConfirm()

const deleteAllIng = ref(false)

async function deleteAll() {
  deleteAllIng.value = true
  confirm.require({
    message: '是否删除全部邀请链接?',
    header: '删除全部',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: '取消',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: '确定删除',
      severity: 'danger',
      icon: 'pi pi-trash'
    },
    accept: async () => {
      const delArr = []
      for (const item of invites.value) {
        delArr.push(
          fetchInstance('/invites').delete({
            code: item.code
          })
        )
      }
      await Promise.all(delArr)
      await refresh()
      deleteAllIng.value = false
    },
    reject: () => {
      deleteAllIng.value = false
    }
  })
}

const selectedInvites = ref([])

function selectAll() {
  if (selectedInvites.value.length > 0) {
    selectedInvites.value = []
  } else {
    selectedInvites.value = invites.value.map((_: any, index: any) => index)
  }
}

const deleteSelectedIng = ref(false)

async function deleteSelected() {
  deleteSelectedIng.value = true
  const delArr = selectedInvites.value.map((index: any) =>
    fetchInstance('/invites').delete({
      code: invites.value[index].code
    })
  )
  await Promise.all(delArr)
  await refresh()
  selectedInvites.value = []
  deleteSelectedIng.value = false
}

function copySelected() {
  copy(
    selectedInvites.value
      .map((index: any) => host.value + '/invite/' + invites.value[index].code)
      .join('\n')
  )
}
</script>

<template>
  <main class="jfa-vue mx-auto" style="max-width: 1080px">
    <div class="my-4 p-2 w-full overflow-hidden rounded-xl" style="background-color: #282828">
      <h1 class="m-2 text-2xl font-bold">创建</h1>
      <section class="flex flex-wrap gap-4 w-full overflow-hidden p-4">
        <div
          class="flex-1 flex-shrink overflow-hidden border border-white/10 p-3 rounded-md min-w-60"
        >
          <h2 class="border-b border-white/10 pb-1.5 mb-1">邀请时长</h2>
          <div class="flex gap-2 mb-3">
            <div class="flex-1 overflow-hidden">
              <label for="月" class="text-primary-50">月</label>
              <Select
                id="月"
                v-model="formData.months"
                :options="arropt"
                option-label="label"
                option-value="value"
                class="!bg-white/10 border-0 !px-1. !py-0.5 text-primary-50 w-full"
              />
            </div>
            <div class="flex-1 overflow-hidden">
              <label for="日" class="text-primary-50">日</label>
              <Select
                id="日"
                v-model="formData.days"
                :options="arropt"
                option-label="label"
                option-value="value"
                class="!bg-white/10 border-0 !px-1.5 !py-0.5 text-primary-50 w-full"
              />
            </div>
          </div>
          <div class="flex gap-2 mb-3">
            <div class="flex-1 overflow-hidden">
              <label for="小时" class="text-primary-50">小时</label>
              <Select
                id="小时"
                v-model="formData.hours"
                :options="arropt"
                option-label="label"
                option-value="value"
                class="!bg-white/10 border-0 !px-1.5 !py-0.5 text-primary-50 w-full"
              />
            </div>
            <div class="flex-1 overflow-hidden">
              <label for="分钟" class="text-primary-50">分钟</label>
              <Select
                id="分钟"
                v-model="formData.minutes"
                :options="arropt"
                option-label="label"
                option-value="value"
                class="!bg-white/10 border-0 !px-1.5 !py-0.5 text-primary-50 w-full"
              />
            </div>
          </div>
          <div class="border-b border-white/10 pb-1.5 mb-1 justify-between flex items-center">
            <span>用户到期</span>
            <span class="flex items-center">
              <span class="mr-1">启用到期</span>
              <ToggleSwitch v-model="formData['user-expiry']" />
            </span>
          </div>
          <div class="user-expiry" :class="{ disabled: !formData['user-expiry'] }">
            <div class="flex gap-2 mb-3">
              <div class="flex-1 overflow-hidden">
                <label for="x月" class="text-primary-50">月</label>
                <Select
                  id="x月"
                  v-model="formData['user-months']"
                  :options="arropt"
                  option-label="label"
                  option-value="value"
                  class="!bg-white/10 border-0 !px-1. !py-0.5 text-primary-50 w-full"
                />
              </div>
              <div class="flex-1 overflow-hidden">
                <label for="x日" class="text-primary-50">日</label>
                <Select
                  id="x日"
                  v-model="formData['user-days']"
                  :options="arropt"
                  option-label="label"
                  option-value="value"
                  class="!bg-white/10 border-0 !px-1.5 !py-0.5 text-primary-50 w-full"
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 overflow-hidden">
                <label for="x小时" class="text-primary-50">小时</label>
                <Select
                  id="x小时"
                  v-model="formData['user-hours']"
                  :options="arropt"
                  option-label="label"
                  option-value="value"
                  class="!bg-white/10 border-0 !px-1.5 !py-0.5 text-primary-50 w-full"
                />
              </div>
              <div class="flex-1 overflow-hidden">
                <label for="x分钟" class="text-primary-50">分钟</label>
                <Select
                  id="x分钟"
                  v-model="formData['user-minutes']"
                  :options="arropt"
                  option-label="label"
                  option-value="value"
                  class="!bg-white/10 border-0 !px-1.5 !py-0.5 text-primary-50 w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex-1 flex-shrink overflow-hidden border border-white/10 p-3 rounded-md min-w-60"
        >
          <div class="mb-3">
            <label for="标签" class="text-primary-50">标签</label>
            <InputText
              id="标签"
              v-model="formData.label"
              class="!bg-white/10 !px-4 !py-2 !text-primary-50 w-full"
            />
          </div>
          <div class="mb-3">
            <label for="用户标签" class="text-primary-50">用户标签</label>
            <InputText
              id="用户标签"
              v-model="formData.user_label"
              class="!bg-white/10 !px-4 !py-2 !text-primary-50 w-full"
            />
          </div>
          <div class="mb-3">
            <label for="使用次数" class="text-primary-50">使用次数</label>
            <div class="flex">
              <InputNumber
                id="使用次数"
                v-model="formData['remaining-uses']"
                class="remaining-uses"
                fluid
                show-buttons
                :min="1"
                :disabled="formData['no-limit']"
              />
              <Button
                icon="icon-[ion--infinite]"
                aria-label="infinite"
                class="!text-white !rounded-l-none !border-transparent hover:!border-emerald-400"
                :class="{
                  '!bg-white/10': !formData['no-limit'],
                  '!bg-emerald-500': formData['no-limit']
                }"
                @click="formData['no-limit'] = !formData['no-limit']"
              />
            </div>
            <!-- <InputNumber id="使用次数" class="remaining-uses" v-model="formData['remaining-uses']" inputId="integeronly"
              fluid showButtons :min="1" /> -->
          </div>
          <div class="mb-3">
            <label for="个人资料" class="text-primary-50">个人资料</label>
            <!-- <InputText id="个人资料" v-model="formData.label" class="!bg-white/10 !px-4 !py-2 !text-primary-50 w-full" /> -->
            <Select
              id="个人资料"
              v-model="formData.profile"
              :options="profiles"
              option-label="label"
              option-value="value"
              class="!bg-white/10 border-0 !px-1.5 !py-0.5 text-primary-50 w-full"
            />
          </div>
          <div>
            <label for="发送到" class="text-primary-50">发送到</label>
            <InputText
              id="发送到"
              v-model="formData['send-to']"
              class="!bg-white/10 !px-4 !py-2 !text-primary-50 w-full"
            />
          </div>
        </div>
      </section>
      <div class="flex p-4 pt-2 btn-box">
        <div class="flex justify-center items-center bg-white/20 rounded-l-md px-2.5">批量次数</div>
        <InputNumber
          v-model="countInvite"
          class="flex-1 rounded-r-none text-center"
          fluid
          show-buttons
          :min="1"
        />
        <Button
          class="flex-1 !rounded-l-none"
          label="创建"
          :disabled="createInviteIng"
          :loading="createInviteIng"
          @click="createInvite"
        />
      </div>
    </div>
    <div class="my-4 p-2 w-full overflow-hidden rounded-xl" style="background-color: #282828">
      <div class="m-2 text-2xl font-bold flex justify-between">
        <h1>
          <span>邀请</span>
          <span class="text-xl mr-2">({{ invites.length }})</span>
          <Button
            type="button"
            label="刷新"
            icon="pi pi-refresh"
            class="!p-0 !px-2 mr-2"
            @click="refresh"
          />
          <Button
            type="button"
            label="全选"
            icon="pi pi-check"
            class="!p-0 !px-2"
            @click="selectAll"
          />
        </h1>
        <div>
          <Button
            v-show="selectedInvites.length"
            type="button"
            :label="`复制(${selectedInvites.length})`"
            icon="pi pi-copy"
            class="!p-0 !px-2 mr-2"
            :disabled="!selectedInvites.length"
            @click="copySelected"
          />
          <Button
            v-show="selectedInvites.length"
            type="button"
            :label="`删除(${selectedInvites.length})`"
            severity="danger"
            icon="pi pi-trash"
            class="!p-0 !px-2 mr-2"
            :disabled="deleteSelectedIng"
            :loading="deleteSelectedIng"
            @click="deleteSelected"
          />
          <Button
            type="button"
            label="复制全部"
            icon="pi pi-copy"
            class="!p-0 !px-2 mr-2"
            @click="copyAll"
          />
          <Button
            type="button"
            label="删除全部"
            severity="danger"
            icon="pi pi-trash"
            class="!p-0 !px-2"
            :disabled="deleteAllIng"
            :loading="deleteAllIng"
            @click="deleteAll"
          />
        </div>
      </div>
      <ul
        class="flex flex-col m-4 p-3 gap-2 overflow-hidden border border-white/10 max-h-96 overflow-y-auto rounded-md"
      >
        <li
          v-for="(item, index) in invites"
          :key="item.code"
          class="flex-shrink-0 bg-white/10 rounded-md flex justify-between items-center h-10 overflow-hidden"
        >
          <Checkbox
            v-model="selectedInvites"
            :input-id="item.code"
            name="selectedInvites"
            :value="index"
            class="ml-2"
          />
          <div class="flex-1 flex px-2 overflow-hidden">
            <a
              class="flex-1 cursor-pointer hover:underline text-ellipsis overflow-hidden"
              :href="host + '/invite/' + item.code"
              target="_blank"
            >
              {{ item.code }}
            </a>
            <span class="flex-shrink-0">
              {{
                (item.months ? item.months + '月' : '') +
                (item.days ? item.days + '日' : '') +
                (item.hours ? item.hours + '时' : '') +
                (item.minutes ? item.minutes + '分' : '') +
                ' 到期'
              }}
            </span>
          </div>
          <Button
            type="button"
            label="复制"
            severity="info"
            icon="pi pi-copy"
            class="h-full !p-0 !px-2 !rounded-r-none flex-shrink-0"
            @click="copyItem(item.code)"
          />
          <Button
            type="button"
            label="删除"
            severity="danger"
            icon="pi pi-trash"
            class="h-full !p-0 !px-2 !rounded-l-none flex-shrink-0"
            @click="deleteItem(item.code)"
          />
        </li>
      </ul>
    </div>
  </main>
  <ConfirmDialog :draggable="false" />
  <Login v-model="loging" />
</template>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  background-color: #101010;
  overflow-y: auto;
}
</style>

<style lang="scss">
.jfa-vue {
  .remaining-uses {
    .p-inputnumber {
      @apply rounded-r-none;
    }

    .p-inputnumber-input {
      @apply bg-white/10 px-4 py-2 text-primary-50 text-center rounded-r-none;

      &[disabled] {
        @apply bg-black/10 cursor-not-allowed text-white/50;

        + .p-inputnumber-button-group .p-inputnumber-button {
          @apply bg-black/10 cursor-not-allowed;
        }
      }
    }
  }

  .btn-box {
    .p-inputnumber {
      @apply rounded-none;
    }

    .p-inputnumber-input {
      @apply bg-white/10 px-4 py-2 text-primary-50 w-full text-center rounded-none;
    }
  }

  .user-expiry.disabled {
    position: relative;
    overflow: hidden;

    &::after {
      content: '不设置到期时间';
      position: absolute;
      @apply inset-0 w-full h-full flex items-center justify-center bg-black/10 backdrop-blur-sm z-10;
    }
  }
}
</style>
