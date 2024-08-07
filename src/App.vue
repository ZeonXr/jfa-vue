<script setup lang="ts"></script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
  <ConfirmDialog :draggable="false" />
  <Toast />
</template>

<style lang="scss">
html,
body,
#app {
  width: 100%;
  height: 100%;
  background-color: #101010;
  overflow: hidden;
}
#app {
  overflow-y: auto;
}
</style>
