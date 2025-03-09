<script setup lang="ts">
import Login from './Login.vue'
import { fetchInstance } from '@/utils/api'
import { computed, ref, watch } from 'vue'
import { useClipboard, useBrowserLocation, useDateFormat } from '@vueuse/core'
import { useConfirm } from 'primevue/useconfirm'
import type { ValuesType } from 'utility-types'
import { FilterMatchMode } from '@primevue/core/api'
import { mkConfig, generateCsv, download } from 'export-to-csv'

const location = useBrowserLocation()

const arropt = Array.from({ length: 31 }, (_, k) => ({ label: k + '', value: k }))
const optHours = Array.from({ length: 24 }, (_, k) => ({ label: k + '', value: k }))
const optMinutes = Array.from({ length: 60 }, (_, k) => ({ label: k + '', value: k }))

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

const { data: fetchData, execute: refresh } = fetchInstance('/invites', {
  refetch: true,
  immediate: false
})
  .get()
  .json<{
    profiles: string[]
    invites?: (typeof formData.value & { code: string; created: number })[]
  }>()

const invites = computed(() => {
  return (
    fetchData.value?.invites?.map((item) => {
      let expiryTime = ''
      if (item['user-expiry']) {
        expiryTime = ['user-months', 'user-days', 'user-hours', 'user-minutes']
          .map((key) => (((item as any)[key] ?? 0) + '').padStart(2, '0'))
          .join('-')
      } else {
        expiryTime = '99-99-99-99'
      }
      const inviteTime = ['months', 'days', 'hours', 'minutes']
        .map((key) => (((item as any)[key] ?? 0) + '').padStart(2, '0'))
        .join('-')

      const createdDate = useDateFormat(new Date(item.created * 1000), 'YYYY-MM-DD HH:mm:ss').value

      return {
        ...item,
        inviteUrl: location.value.origin + '/#/invite/' + item.code,
        expiryTime,
        inviteTime,
        createdDate
      }
    }) || []
  )
})

function formatExpiryTime(str: string): string {
  if (str === '99-99-99-99') {
    return '永久有效'
  }
  const timeArr = str.split('-')
  const suffixArr = ['月', '天', '时', '分']
  const resArr = []
  for (let i = 0; i < timeArr.length; i++) {
    if (timeArr[i] !== '00') {
      resArr.push(parseInt(timeArr[i]) + suffixArr[i])
    }
  }

  return resArr.join('-')
}

const profiles = computed(() => {
  const defaultProfiles = [
    {
      label: '没有个人资料',
      value: ''
    }
  ]
  const arrProfiles = (fetchData.value?.profiles || []).map((item: string) => ({
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

const { copy } = useClipboard({ legacy: true })

function copyItem(item: ValuesType<typeof invites.value>) {
  copy(item.inviteUrl)
}

function copyAll() {
  copy(invites.value.map((item) => item.inviteUrl).join('\n'))
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
    },
    onHide: () => {
      deleteAllIng.value = false
    }
  })
}

const selectedInvites = ref<typeof invites.value>([])

// function selectAll() {
//   if (selectedInvites.value.length > 0) {
//     selectedInvites.value = []
//   } else {
//     selectedInvites.value = invites.value
//   }
// }

const deleteSelectedIng = ref(false)

async function deleteSelected() {
  deleteSelectedIng.value = true
  const delArr = selectedInvites.value.map((item) =>
    fetchInstance('/invites').delete({
      code: item.code
    })
  )
  await Promise.all(delArr)
  await refresh()
  selectedInvites.value = []
  deleteSelectedIng.value = false
}

function copySelected() {
  copy(selectedInvites.value.map((item) => item.inviteUrl).join('\n'))
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

function exportCSV({ selectionOnly }: { selectionOnly?: boolean }) {
  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
    filename: useDateFormat(new Date(), 'YYYY-MM-DD_HH-mm-ss').value
  })
  let csv
  if (selectionOnly) {
    csv = generateCsv(csvConfig)(selectedInvites.value)
  } else {
    csv = generateCsv(csvConfig)(invites.value)
  }
  download(csvConfig)(csv)
}
</script>

<template>
  <main class="jfa-vue mx-auto" style="max-width: 1200px">
    <form
      class="my-4 p-2 w-full overflow-hidden rounded-xl"
      style="background-color: #282828"
      @submit.prevent="createInvite"
    >
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
                :options="optHours"
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
                :options="optMinutes"
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
          class="flex-1 rounded-r-none text-center batchTimes"
          fluid
          show-buttons
          :min="1"
        />
        <Button
          type="submit"
          class="flex-1 !rounded-l-none"
          label="创建"
          :loading="createInviteIng"
        />
      </div>
    </form>
    <div
      v-if="invites.length !== 0"
      class="flex flex-col mt-4 p-4 gap-2 w-full overflow-hidden rounded-xl h-screen max-h-screen box-border"
      style="background-color: #282828"
    >
      <div class="text-2xl font-bold flex justify-between items-center">
        <h1 class="flex flex-wrap gap-2">
          <span>邀请</span>
          <span class="text-xl">({{ invites.length }})</span>
          <Button type="button" icon="pi pi-refresh" class="!p-0 !px-2 mr-2" @click="refresh()" />
          <Button
            icon="pi pi-external-link"
            label="导出全部"
            class="!p-0 !px-2"
            @click="exportCSV({ selectionOnly: false })"
          />
          <Button
            v-show="selectedInvites.length"
            icon="pi pi-external-link"
            :label="`导出(${selectedInvites.length})`"
            class="!p-0 !px-2"
            @click="exportCSV({ selectionOnly: true })"
          />
          <!-- <Button
            type="button"
            label="全选"
            icon="pi pi-check"
            class="!p-0 !px-2"
            @click="selectAll"
          /> -->
        </h1>
        <div class="flex flex-wrap gap-2 justify-end">
          <Button
            v-show="selectedInvites.length"
            type="button"
            :label="`复制(${selectedInvites.length})`"
            icon="pi pi-copy"
            class="!p-0 !px-2"
            :disabled="!selectedInvites.length"
            @click="copySelected"
          />
          <Button
            v-show="selectedInvites.length"
            type="button"
            :label="`删除(${selectedInvites.length})`"
            severity="danger"
            icon="pi pi-trash"
            class="!p-0 !px-2"
            :loading="deleteSelectedIng"
            @click="deleteSelected"
          />
          <Button
            type="button"
            label="复制全部"
            icon="pi pi-copy"
            class="!p-0 !px-2"
            @click="copyAll"
          />
          <Button
            type="button"
            label="删除全部"
            severity="danger"
            icon="pi pi-trash"
            class="!p-0 !px-2"
            :loading="deleteAllIng"
            @click="deleteAll"
          />
        </div>
      </div>
      <!-- <div class="text-2xl font-bold flex justify-between items-center">
        <h1>
          <span class="mr-4">搜索</span>
          <InputText
            v-model.lazy="filters['global'].value"
            class="!bg-white/10 !px-4 !h-full !text-primary-50"
            placeholder="搜索 如：‘1月’"
          />
        </h1>
        <div>
          <Button icon="pi pi-external-link" label="导出" class="!p-0 !px-2" @click="exportCSV" />
        </div>
      </div> -->
      <!-- <ul
        class="flex-1 flex flex-col m-4 p-3 gap-2 border border-white/10 overflow-y-auto rounded-md"
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
            <RouterLink
              class="flex-1 cursor-pointer hover:underline text-ellipsis overflow-hidden"
              :to="`/invite/${item.code}`"
              target="_blank"
            >
              {{ item.code }}
            </RouterLink>

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
      </ul> -->
      <DataTable
        v-model:selection="selectedInvites"
        v-model:filters="filters"
        :value="invites"
        scrollable
        scroll-height="flex"
        removable-sort
        data-key="code"
        class="flex-1 border border-white/10 rounded-md h-full overflow-y-auto"
        style="background: var(--p-datatable-header-cell-background)"
      >
        <Column selection-mode="multiple" header-style="width: 3rem" />
        <Column field="code" class="min-w-24 overflow-hidden" header="邀请码">
          <template #body="{ data }: { data: ValuesType<typeof invites.value> }">
            <RouterLink
              :to="`/invite/${data.code}`"
              target="_blank"
              class="cursor-pointer hover:underline"
            >
              {{ data.code }}
            </RouterLink>
          </template>
        </Column>
        <Column field="expiryTime" class="min-w-24" header="账号有效期" sortable>
          <template #body="{ data }: { data: ValuesType<typeof invites.value> }">
            {{ formatExpiryTime(data.expiryTime) }}
          </template>
        </Column>
        <Column field="inviteTime" class="min-w-24" header="邀请有效期" sortable>
          <template #body="{ data }: { data: ValuesType<typeof invites.value> }">
            {{ formatExpiryTime(data.inviteTime) }}
          </template>
        </Column>
        <Column field="createdDate" class="min-w-24" header="创建时间" sortable />
        <Column :exportable="false" frozen align-frozen="right" class="min-w-32 !text-right">
          <template #body="{ data }: { data: ValuesType<typeof invites.value> }">
            <Button icon="pi pi-copy" outlined rounded class="mr-2" @click="copyItem(data)" />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="deleteItem(data.code)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </main>
  <Login v-model="loging" />
</template>

<style scoped lang="scss">
.jfa-vue {
  ::v-deep(.remaining-uses),
  ::v-deep(.batchTimes) {
    .p-inputnumber-input {
      @apply bg-white/10 px-4 py-2 text-primary-50 text-center;
      &[disabled] {
        @apply bg-black/10 cursor-not-allowed text-white/50;

        + .p-inputnumber-button-group .p-inputnumber-button {
          @apply bg-black/10 cursor-not-allowed;
        }
      }
    }
  }
  ::v-deep(.remaining-uses) {
    .p-inputnumber-input {
      @apply rounded-r-none;
    }
  }

  ::v-deep(.batchTimes) {
    .p-inputnumber-input {
      @apply rounded-none;
    }
  }

  //   .p-inputnumber-input {
  //     @apply bg-white/10 px-4 py-2 text-primary-50 w-full text-center rounded-none;
  //   }
  // }

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
