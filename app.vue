<!-- app.vue -->
<template>
  <div>
    <!-- Onboarding -->
    <OnboardScreen v-if="!store.isOnboarded" />
    <!-- Main App -->
    <div v-else class="app-shell">
      <NuxtPage />
      <AppNav @openCamera="showCamera = true" />
    </div>
    <!-- Global Toast -->
    <ToastMessage />
    <!-- Camera Modal -->
    <CameraModal v-if="showCamera" @close="showCamera = false" />
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from '~/stores/workout'

const store = useWorkoutStore()
const showCamera = ref(false)

onMounted(() => {
  store.init()
})
</script>

<style>
.app-shell {
  min-height: 100vh;
  padding-bottom: calc(var(--nav-height) + var(--safe-bottom));
}
</style>