<!-- components/ToastMessage.vue -->
<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toastState.show" class="toast" :class="toastState.type">
        {{ toastState.message }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { toastState } = useToast()
</script>

<style scoped>
.toast {
  position: fixed;
  /* Menggunakan env() agar aman dari poni HP (notch), ditambah jarak default */
  top: calc(env(safe-area-inset-top, 0px) + 40px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg3);
  border: 1px solid var(--border);
  /* Ubah border-radius agar tetap bagus saat teksnya menjadi 2 baris */
  border-radius: 20px;
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 600;
  z-index: 999;
  pointer-events: none;

  /* 👇 PERBAIKAN AGAR TIDAK BABLAS 👇 */
  width: max-content;
  max-width: 90vw; /* Maksimal lebar 90% dari layar HP */
  text-align: center;
  line-height: 1.4;
  /* white-space: nowrap; <-- BARIS INI DIHAPUS */
}
.toast.success {
  border-color: var(--green);
  color: var(--green);
}
.toast.error {
  border-color: var(--red);
  color: var(--red);
}
.toast.accent {
  border-color: var(--accent);
  color: var(--accent);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>
