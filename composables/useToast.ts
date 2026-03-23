// composables/useToast.ts
const toastState = reactive({
  show: false,
  message: '',
  type: '' as 'success' | 'error' | 'accent' | '',
  timer: null as ReturnType<typeof setTimeout> | null,
})

export function useToast() {
  function toast(message: string, type: 'success' | 'error' | 'accent' | '' = '') {
    if (toastState.timer) clearTimeout(toastState.timer)
    toastState.message = message
    toastState.type = type
    toastState.show = true
    toastState.timer = setTimeout(() => {
      toastState.show = false
    }, 2800)
  }

  return { toast, toastState }
}
