<!-- app.vue -->
<template>
  <div>
    <!-- Onboarding -->
    <OnboardScreen v-if="!store.isOnboarded" />

    <!-- Main App -->
    <div v-else class="app-shell">
      <NuxtPage />
      <AppNav />
    </div>

    <!-- Global Toast -->
    <ToastMessage />
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from '~/stores/workout'

const store = useWorkoutStore()

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
