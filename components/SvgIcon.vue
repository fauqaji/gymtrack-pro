<template>
  <span
    v-if="name"
    class="svg-icon"
    :style="{
      maskImage: `url('/${name}.svg')`,
      WebkitMaskImage: `url('/${name}.svg')`,
      width: size + 'px',
      height: size + 'px',
      background: color,
      // Tidak bisa tebalkan fill dari luar, 
      // tapi bisa scale sedikit lebih besar untuk kesan bold:
      minWidth: size + 'px',
    }"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  name: string
  size?: number
  color?: string
}>(), {
  size: 22,
  color: 'var(--accent)',
})
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  flex-shrink: 0;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}
</style>