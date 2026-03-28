<template>
  <div>
    <VitePwaManifest />

    <OnboardScreen v-if="!store.isOnboarded" />
    
    <div v-else class="app-shell">
      <NuxtPage />
      <AppNav @openCamera="showCamera = true" />
    </div>
    
    <ToastMessage />
    
    <CameraModal v-if="showCamera" @close="showCamera = false" />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useNetwork } from '@vueuse/core'
import { useWorkoutStore } from '~/stores/workout'
import { useToast } from '~/composables/useToast'

const store = useWorkoutStore()
const showCamera = ref(false)
const hasShownOfflineToast = ref(false)

// Inisialisasi fitur deteksi Online/Offline & Toast
const { isOnline } = useNetwork()
const { toast } = useToast()

onMounted(() => {
  store.init()

  // 1. Cek saat aplikasi pertama kali dibuka / di-refresh
  if (!isOnline.value && !hasShownOfflineToast.value) {
    toast("Mode Offline Aktif. Pencatatan jalan terus, tapi AI Coach sedang tidur. 📡", "accent")
    hasShownOfflineToast.value = true
  }
})

// 2. Pantau terus-menerus perubahan sinyal secara Real-Time
watch(isOnline, (online) => {
  if (!online) {
    // Sinyal tiba-tiba hilang
    if (hasShownOfflineToast.value === false) {
      toast("Koneksi terputus. Beralih ke mode Offline. 📡", "error")
      hasShownOfflineToast.value = true
    }
  } else {
    // Sinyal kembali tersambung
    toast("Koneksi kembali! Fitur AI sudah bisa digunakan. 🌐", "success")
    hasShownOfflineToast.value = false
  }
})
</script>

<style>
.app-shell {
  min-height: 100vh;
  padding-bottom: calc(var(--nav-height) + var(--safe-bottom));
}
</style>