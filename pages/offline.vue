<!-- pages/offline.vue -->
<template>
  <div class="offline-page">
    <div class="offline-content">
      <div class="offline-icon">📡</div>
      <h1 class="offline-title">Offline Mode</h1>
      <p class="offline-message">
        Kamu sedang offline, tapi jangan khawatir! Data latihan kamu tetap tersimpan dan bisa digunakan normal.
      </p>
      <p class="offline-submessage">
        AI Coach sedang tidur, tapi semua fitur pencatatan berjalan lancar. 🌙
      </p>

      <div class="offline-features">
        <div class="feature-item">
          <span class="feature-icon">✅</span>
          <span>Pencatatan latihan</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">✅</span>
          <span>History & progress</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">✅</span>
          <span>Data tersimpan lokal</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">⏸️</span>
          <span>AI Coach (butuh internet)</span>
        </div>
      </div>

      <button class="btn-retry" @click="retryConnection">
        Coba Lagi 🔄
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNetwork } from '@vueuse/core'

const { isOnline } = useNetwork()

function retryConnection() {
  if (isOnline.value) {
    // Jika sudah online, redirect ke home
    navigateTo('/')
  } else {
    // Jika masih offline, refresh halaman
    window.location.reload()
  }
}

// Auto redirect jika koneksi kembali
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
  background: var(--bg);
  padding: 20px;
}

.offline-content {
  text-align: center;
  max-width: 400px;
  padding: 40px 20px;
  background: var(--bg2);
  border-radius: 20px;
  border: 1px solid var(--border);
}

.offline-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.offline-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.offline-message {
  color: var(--text);
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.offline-submessage {
  color: var(--text2);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 30px;
}

.offline-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text2);
}

.feature-icon {
  font-size: 16px;
  min-width: 20px;
}

.btn-retry {
  background: var(--accent);
  color: #0f1117;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-retry:active {
  transform: translateY(0);
}
</style>