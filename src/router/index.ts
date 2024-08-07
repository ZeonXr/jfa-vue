import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home/index.vue'

// declare module 'vue-router' {
//   interface RouteMeta {
//     requiredLogin?: boolean
//   }
// }

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// router.afterEach(() => {
//   const layoutStore = useLayoutStore()
//   if (layoutStore.screen_size === 'sm' || layoutStore.screen_size === 'md') {
//     if (layoutStore.sidebar_expand) {
//       layoutStore.toggleSidebar(false)
//     }
//   }
//   if (layoutStore.audioview_expand) {
//     layoutStore.toggleAudioview(false)
//   }
// })
// router.beforeEach(async (to) => {
//   if (to.matched.some((route) => route.meta.requiredLogin)) {
//     const authStore = useAuthStore()
//     await authStore.logging
//     if (authStore.isLogin) {
//       return true
//     } else {
//       return { name: 'login', state: { toPath: to.fullPath } }
//     }
//   }
//   return true
// })

export default router
