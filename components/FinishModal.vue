<!-- components/FinishModal.vue -->
<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="sheet">
      <div class="handle"></div>
      <h3>🎉 Sesi Selesai!</h3>

      <!-- Stats summary -->
      <div class="stats-row">
        <div class="s-card">
          <div class="s-val accent">{{ session.totalVolume.toFixed(0) }}</div>
          <div class="s-label">Vol (kg)</div>
        </div>
        <div class="s-card">
          <div class="s-val">{{ session.totalSets }}</div>
          <div class="s-label">Total Set</div>
        </div>
        <div class="s-card">
          <div class="s-val">{{ session.totalReps }}</div>
          <div class="s-label">Total Reps</div>
        </div>
        <div class="s-card">
          <div class="s-val">{{ session.durationMinutes ?? '–' }}</div>
          <div class="s-label">Menit</div>
        </div>
      </div>

      <!-- Badges -->
      <div class="badges-row">
        <span class="badge" :class="hypClass">{{ hypEmoji }} {{ hypLabel }} ({{ session.hypScore }}%)</span>
        <span v-if="progressBadge" class="badge blue">{{ progressBadge }}</span>
      </div>

      <!-- AI Analysis -->
      <div class="ai-box">
        <div class="ai-title">🤖 AI Coach — Analisis Sesi</div>
        <div class="ai-body" v-html="formattedAI"></div>
      </div>

      <button class="btn-close" @click="$emit('close')">Tutup</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getHypLabel } from '~/composables/useData'
import { useWorkoutStore } from '~/stores/workout'
import type { WorkoutSession } from '~/stores/workout'

const props = defineProps<{ session: WorkoutSession }>()
defineEmits(['close'])

const store = useWorkoutStore()

const hyp = computed(() => getHypLabel(props.session.hypScore))
const hypClass = computed(() => props.session.hypScore >= 80 ? 'green' : props.session.hypScore >= 55 ? 'orange' : 'red')
const hypLabel = computed(() => hyp.value.label)
const hypEmoji = computed(() => hyp.value.emoji)

const progressBadge = computed(() => {
  const prev = store.history.find(h => h.typeName === props.session.typeName && h.id !== props.session.id)
  if (!prev) return '🆕 Sesi pertama!'
  const diff = props.session.totalVolume - prev.totalVolume
  if (diff > 0) return `📈 +${diff.toFixed(0)} kg vs sesi lalu`
  if (diff < 0) return `📉 ${diff.toFixed(0)} kg vs sesi lalu`
  return '= Sama dengan sesi lalu'
})

const formattedAI = computed(() =>
  props.session.aiAnalysis
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
)
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  z-index: 200; display: flex; align-items: flex-end;
}
.sheet {
  background: var(--bg2); border-radius: 24px 24px 0 0;
  padding: 12px 20px 40px; width: 100%; max-height: 92vh;
  overflow-y: auto; border-top: 1px solid var(--border);
}
.handle { width: 40px; height: 4px; background: var(--bg4); border-radius: 2px; margin: 0 auto 16px; }
h3 { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 14px; }

.stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.s-card { background: var(--bg3); border-radius: var(--r); padding: 10px 8px; border: 1px solid var(--border); text-align: center; }
.s-val { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; }
.s-val.accent { color: var(--accent); }
.s-label { font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

.badges-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 600;
}
.badge.green { background: rgba(74,222,128,0.15); color: var(--green); }
.badge.orange { background: rgba(255,140,66,0.15); color: var(--orange); }
.badge.red { background: rgba(255,77,77,0.15); color: var(--red); }
.badge.blue { background: rgba(77,168,255,0.15); color: var(--blue); }

.ai-box {
  background: rgba(200,241,53,0.04);
  border: 1px solid rgba(200,241,53,0.2);
  border-radius: var(--r2); padding: 14px 16px; margin-bottom: 16px;
}
.ai-title { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
.ai-body { font-size: 13px; color: var(--text); line-height: 1.65; }

.btn-close {
  background: var(--accent); color: #0f1117; border: none;
  border-radius: 50px; padding: 14px; width: 100%;
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; cursor: pointer;
}
</style>
