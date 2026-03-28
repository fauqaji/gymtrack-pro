<template>
  <div class="offline-page">
    <div class="content">
      <img src="/icon-192.png" alt="GymTrack Pro" class="logo" />
      <div class="offline-icon">📡</div>
      <h1>You're offline</h1>
      <p>Data masih bisa dibaca. Navigasi ke halaman utama akan berjalan bila koneksi kembali.</p>
      <button @click="retry" class="btn">Coba Lagi</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNetwork } from '@vueuse/core'

const { isOnline } = useNetwork()

function retry() {
  if (isOnline.value) {
    navigateTo('/')
  } else {
    window.location.reload()
  }
}

watch(isOnline, (online) => {
  if (online) {
    navigateTo('/')
  }
})
</script>

<style scoped>
.offline-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg);
}
.content {
  text-align: center;
  max-width: 360px;
  width: 100%;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 26px;
}
.logo {
  width: 68px;
  margin-bottom: 12px;
}
.offline-icon {
  font-size: 40px;
  margin-bottom: 10px;
}
h1 {
  margin: 0;
  font-size: 24px;
  margin-bottom: 10px;
}
p {
  margin: 0;
  color: var(--text2);
  margin-bottom: 20px;
}
.btn {
  padding: 11px 18px;
  border-radius: 12px;
  background: var(--accent);
  border: none;
  color: #0f1117;
  font-weight: 700;
  cursor: pointer;
}
</style>