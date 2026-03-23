<!-- components/ExerciseCard.vue -->
<template>
  <div class="ex-card">
    <div class="ex-header">
      <div class="ex-info">
        <div class="ex-name">
          {{ exercise.name }}
          <span v-if="isNewPR" class="pr-badge">🏆 PR!</span>
        </div>
        <div class="ex-muscle">{{ exercise.muscle }}</div>
      </div>
      <div class="ex-meta">
        <span class="ex-vol">{{ totalVolume.toFixed(0) }} kg</span>
        <button class="btn-remove" @click="store.removeExercise(index)">×</button>
      </div>
    </div>

    <!-- Tips -->
    <div v-if="showTips" class="ex-tips">💡 {{ exerciseTips }}</div>

    <!-- Sets header -->
    <div class="sets-header">
      <span style="width: 24px"></span>
      <span class="sh-label">Reps</span>
      <span class="sh-label">Berat (kg)</span>
      <span class="sh-label" style="text-align: right">Vol</span>
    </div>

    <!-- Set rows -->
    <div v-for="(set, si) in exercise.sets" :key="si" class="set-row">
      <span class="set-num">{{ si + 1 }}</span>
      <input
        class="set-input"
        type="number"
        placeholder="Reps"
        :value="set.reps || ''"
        min="1" max="200" step="1"
        @input="updateSet(si, 'reps', $event)"
      />
      <input
        class="set-input"
        type="number"
        placeholder="kg"
        :value="set.weight || ''"
        min="0" max="500" step="0.5"
        @input="updateSet(si, 'weight', $event)"
      />
      <div class="set-vol-del">
        <span class="set-vol-num" :class="getRepClass(set.reps)">
          {{ (set.reps * set.weight).toFixed(0) }}
        </span>
        <button class="btn-del-set" @click="store.removeSet(index, si)">−</button>
      </div>
    </div>

    <button class="btn-add-set" @click="store.addSet(index)">+ Set</button>

    <div class="ex-footer">
      <span class="hyp-indicator" :class="hypClass">{{ hypLabel }}</span>
      <button class="tips-toggle" @click="showTips = !showTips">
        {{ showTips ? 'Tutup tips' : '💡 Tips' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from '~/stores/workout'
import { EXERCISES_DB } from '~/composables/useData'
import type { WorkoutExercise, PersonalRecord } from '~/stores/workout'

const props = defineProps<{
  exercise: WorkoutExercise
  index: number
  pr: PersonalRecord | null
}>()

const store = useWorkoutStore()
const showTips = ref(false)

const exerciseTips = computed(() =>
  EXERCISES_DB.find(e => e.id === props.exercise.id)?.tips ?? ''
)

const totalVolume = computed(() =>
  props.exercise.sets.reduce((a, s) => a + (s.reps || 0) * (s.weight || 0), 0)
)

const isNewPR = computed(() =>
  props.pr !== null && totalVolume.value > props.pr.volume
)

const setsInZone = computed(() =>
  props.exercise.sets.filter(s => s.reps >= 6 && s.reps <= 12).length
)

const hypClass = computed(() => {
  const ratio = setsInZone.value / Math.max(1, props.exercise.sets.length)
  if (ratio >= 0.7) return 'good'
  if (ratio >= 0.4) return 'ok'
  return 'poor'
})

const hypLabel = computed(() => {
  const ratio = setsInZone.value / Math.max(1, props.exercise.sets.length)
  if (ratio >= 0.7) return `✓ ${setsInZone.value}/${props.exercise.sets.length} hyp zone`
  if (ratio >= 0.4) return `⚠ ${setsInZone.value}/${props.exercise.sets.length} hyp zone`
  return `✗ ${setsInZone.value}/${props.exercise.sets.length} hyp zone`
})

function getRepClass(reps: number) {
  if (reps >= 6 && reps <= 12) return 'vol-good'
  if (reps >= 13 && reps <= 20) return 'vol-ok'
  return ''
}

function updateSet(si: number, field: 'reps' | 'weight', e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value) || 0
  store.updateSet(props.index, si, field, val)
}
</script>

<style scoped>
.ex-card {
  background: var(--bg2);
  border-radius: var(--r2);
  padding: 14px 16px;
  margin: 0 20px 12px;
  border: 1px solid var(--border);
}
.ex-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.ex-name {
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
.ex-muscle { font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
.ex-meta { display: flex; align-items: center; gap: 8px; }
.ex-vol { font-size: 13px; color: var(--text2); font-weight: 500; }
.btn-remove {
  background: none; border: none; color: var(--text3);
  font-size: 20px; cursor: pointer; padding: 0 4px; line-height: 1;
  transition: color 0.2s;
}
.btn-remove:hover { color: var(--red); }
.pr-badge {
  font-size: 10px; background: rgba(200,241,53,0.15);
  color: var(--accent); padding: 2px 8px; border-radius: 50px;
  font-family: 'DM Sans', sans-serif; font-weight: 600;
}

.ex-tips {
  background: rgba(255,255,255,0.04); border-radius: 8px;
  padding: 8px 12px; font-size: 12px; color: var(--text2);
  margin-bottom: 10px; line-height: 1.5;
}

.sets-header {
  display: grid; grid-template-columns: 24px 1fr 1fr 80px;
  gap: 6px; margin-bottom: 4px;
}
.sh-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.06em; text-align: center; }

.set-row {
  display: grid; grid-template-columns: 24px 1fr 1fr 80px;
  gap: 6px; align-items: center; margin-bottom: 5px;
}
.set-num { font-size: 12px; color: var(--text3); font-weight: 600; text-align: center; }
.set-input {
  background: var(--bg4); border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 6px; color: var(--text);
  font-size: 14px; font-family: 'DM Sans', sans-serif;
  width: 100%; text-align: center; transition: border-color 0.2s;
}
.set-input:focus { outline: none; border-color: var(--accent); }

.set-vol-del { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
.set-vol-num { font-size: 11px; color: var(--text3); font-weight: 500; min-width: 36px; text-align: right; }
.set-vol-num.vol-good { color: var(--green); }
.set-vol-num.vol-ok { color: var(--orange); }
.btn-del-set {
  background: none; border: none; color: var(--text3);
  font-size: 16px; cursor: pointer; padding: 2px 4px; line-height: 1;
  transition: color 0.2s;
}
.btn-del-set:hover { color: var(--red); }

.btn-add-set {
  background: rgba(200,241,53,0.07); border: 1px dashed rgba(200,241,53,0.3);
  border-radius: 8px; padding: 7px; color: var(--accent);
  font-size: 12px; font-weight: 600; cursor: pointer;
  width: 100%; margin-top: 6px; font-family: 'DM Sans', sans-serif;
  transition: background 0.2s;
}
.btn-add-set:hover { background: rgba(200,241,53,0.14); }

.ex-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);
}
.hyp-indicator { font-size: 11px; font-weight: 600; }
.hyp-indicator.good { color: var(--green); }
.hyp-indicator.ok { color: var(--orange); }
.hyp-indicator.poor { color: var(--red); }
.tips-toggle {
  font-size: 11px; color: var(--text3); background: none;
  border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: color 0.2s;
}
.tips-toggle:hover { color: var(--text2); }
</style>
