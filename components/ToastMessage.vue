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
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  z-index: 999;
  white-space: nowrap;
  pointer-events: none;
}
.toast.success { border-color: var(--green); color: var(--green); }
.toast.error { border-color: var(--red); color: var(--red); }
.toast.accent { border-color: var(--accent); color: var(--accent); }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
</style>
