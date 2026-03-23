<!-- pages/index.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-row">
        <div>
          <div class="date-text">{{ todayText }}</div>
          <h1 class="greeting">Selamat <span>{{ greetingTime }}!</span></h1>
        </div>
        <div class="avatar">{{ initials }}</div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-val accent">{{ store.streakDays }}</div>
        <div class="stat-label">Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ store.sessionsThisWeek }}</div>
        <div class="stat-label">Sesi/Minggu</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ (store.totalVolumeKg / 1000).toFixed(1) }}t</div>
        <div class="stat-label">Total Vol</div>
      </div>
    </div>

    <!-- Day Selector -->
    <div class="section-label">Hari Training</div>
    <div class="day-scroll">
      <button
        v-for="(d, i) in DAYS_ID"
        :key="i"
        class="day-chip"
        :class="{ active: store.selectedDay === i + 1 }"
        @click="store.setSelectedDay(i + 1)"
      >{{ d }}</button>
    </div>

    <!-- Workout Type -->
    <div class="section-label" style="margin-top: 20px">Tipe Workout</div>
    <div class="type-grid">
      <button
        v-for="t in WORKOUT_TYPES"
        :key="t.id"
        class="type-card"
        :class="{ active: store.selectedTypeId === t.id }"
        @click="selectType(t)"
      >
        <span class="type-emoji">{{ t.emoji }}</span>
        <span class="type-name">{{ t.name }}</span>
        <span class="type-desc">{{ t.desc }}</span>
      </button>
    </div>

    <!-- Exercise List Header -->
    <div class="section-label" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; padding-right: 20px">
      <span>Latihan ({{ store.currentExercises.length }})</span>
      <div class="timer-chip" :class="{ running: timerRunning }" @click="toggleTimer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ timerDisplay }}
      </div>
    </div>

    <!-- Exercise Cards -->
    <ExerciseCard
      v-for="(ex, i) in store.currentExercises"
      :key="ex.id"
      :exercise="ex"
      :index="i"
      :pr="store.getPR(ex.id)"
    />

    <!-- Empty State -->
    <div v-if="store.currentExercises.length === 0" class="empty-state">
      <div class="empty-icon">🏋️</div>
      <h3>Belum ada latihan</h3>
      <p>Pilih tipe workout di atas atau tambah latihan manual</p>
    </div>

    <!-- Action Buttons -->
    <div class="action-row">
      <button class="btn-secondary" @click="showAddModal = true">+ Tambah Latihan</button>
      <button v-if="store.currentExercises.length > 0" class="btn-secondary danger" @click="clearAll">🗑 Clear</button>
    </div>

    <button
      v-if="store.currentExercises.length > 0"
      class="btn-primary"
      :disabled="finishing"
      @click="handleFinish"
    >
      {{ finishing ? '⏳ Menganalisis...' : '✅ Selesai & Analisis' }}
    </button>

    <!-- Add Exercise Modal -->
    <AddExerciseModal v-if="showAddModal" @close="showAddModal = false" />

    <!-- Finish Modal -->
    <FinishModal
      v-if="finishSession"
      :session="finishSession"
      @close="finishSession = null"
    />
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from '~/stores/workout'
import { DAYS_ID, WORKOUT_TYPES, MONTHS_ID } from '~/composables/useData'
import { useAI } from '~/composables/useAI'
import type { WorkoutSession } from '~/stores/workout'

const store = useWorkoutStore()
const { toast } = useToast()
const { analyzeWorkout } = useAI()

const showAddModal = ref(false)
const finishing = ref(false)
const finishSession = ref<WorkoutSession | null>(null)

// Timer
const timerRunning = ref(false)
const timerSeconds = ref(0)
const timerDisplay = ref('Rest')
let timerInt: ReturnType<typeof setInterval> | null = null

function toggleTimer() {
  if (timerRunning.value) {
    clearInterval(timerInt!)
    timerRunning.value = false
    timerSeconds.value = 0
    timerDisplay.value = 'Rest'
  } else {
    timerRunning.value = true
    timerInt = setInterval(() => {
      timerSeconds.value++
      const m = Math.floor(timerSeconds.value / 60).toString().padStart(2, '0')
      const s = (timerSeconds.value % 60).toString().padStart(2, '0')
      timerDisplay.value = `${m}:${s}`
      if (timerSeconds.value >= 180) {
        toast('Rest 3 menit selesai! Lanjut set!', 'success')
        toggleTimer()
      }
    }, 1000)
  }
}

onUnmounted(() => { if (timerInt) clearInterval(timerInt) })

// Header
const now = new Date()
const todayText = computed(() => {
  const d = new Date()
  return `${DAYS_ID[d.getDay() === 0 ? 6 : d.getDay() - 1]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
})
const greetingTime = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Pagi' : h < 15 ? 'Siang' : h < 18 ? 'Sore' : 'Malam'
})
const initials = computed(() => {
  if (!store.profile) return 'GT'
  return store.profile.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
})

function selectType(t: typeof WORKOUT_TYPES[0]) {
  store.setSelectedType(t.id)
  store.autoLoadExercises(t.suggestions)
}

function clearAll() {
  if (confirm('Hapus semua latihan dari sesi ini?')) {
    store.clearExercises()
    store.setSelectedType('')
  }
}

async function handleFinish() {
  if (store.currentExercises.length === 0) {
    toast('Tambahkan latihan dulu!', '')
    return
  }
  finishing.value = true
  store.startSession()

  const selectedType = WORKOUT_TYPES.find(t => t.id === store.selectedTypeId)
  const typeName = selectedType?.name ?? 'Custom Workout'
  const dayName = DAYS_ID[store.selectedDay - 1]

  try {
    const aiText = await analyzeWorkout(
      store.currentExercises,
      store.profile!,
      Math.round(store.currentExercises.reduce((a, ex) => a + ex.sets.reduce((b, s) => b + ((s.reps >= 6 && s.reps <= 12) ? 2 : 1), 0), 0) / Math.max(1, store.currentExercises.reduce((a, ex) => a + ex.sets.length, 0)) * 50),
      typeName,
      store.history
    )
    const session = store.finishWorkout(dayName, typeName, aiText)
    finishSession.value = session
  } finally {
    finishing.value = false
  }
}
</script>

<style scoped>
.page { background: var(--bg); min-height: 100vh; }
.header { padding: 52px 20px 16px; }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; }
.date-text { font-size: 13px; color: var(--text2); margin-bottom: 2px; }
.greeting { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
.greeting span { color: var(--accent); }
.avatar {
  width: 44px; height: 44px; border-radius: 50%; background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #0f1117;
  flex-shrink: 0;
}

.stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 0 20px; margin-bottom: 4px; }
.stat-card {
  background: var(--bg3); border-radius: var(--r); padding: 12px;
  border: 1px solid var(--border); text-align: center;
}
.stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
.stat-val.accent { color: var(--accent); }
.stat-label { font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

.section-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text3);
  margin: 20px 20px 10px;
}

.day-scroll { display: flex; gap: 8px; padding: 0 20px; overflow-x: auto; scrollbar-width: none; }
.day-chip {
  flex-shrink: 0; padding: 8px 16px; border-radius: 50px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  border: 1px solid var(--border); color: var(--text2);
  background: var(--bg3); transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.day-chip.active { background: var(--accent); color: #0f1117; border-color: var(--accent); font-weight: 700; }

.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 20px; }
.type-card {
  background: var(--bg3); border-radius: var(--r2); padding: 14px 12px;
  cursor: pointer; border: 1px solid var(--border); transition: all 0.2s;
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
  text-align: left;
}
.type-card.active { border-color: var(--accent); background: rgba(200, 241, 53, 0.07); }
.type-emoji { font-size: 22px; margin-bottom: 4px; }
.type-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: var(--text); }
.type-desc { font-size: 11px; color: var(--text2); }

.timer-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--bg3); border-radius: 50px; padding: 6px 12px;
  font-size: 12px; font-weight: 600; color: var(--text2);
  cursor: pointer; border: 1px solid var(--border); transition: all 0.2s;
}
.timer-chip.running { color: var(--accent); border-color: var(--accent); background: rgba(200,241,53,0.08); }

.empty-state { text-align: center; padding: 32px 20px; color: var(--text2); }
.empty-icon { font-size: 44px; margin-bottom: 10px; opacity: 0.4; }
.empty-state h3 { font-family: 'Syne', sans-serif; font-size: 16px; color: var(--text); margin-bottom: 6px; }
.empty-state p { font-size: 14px; }

.action-row { display: flex; gap: 10px; padding: 12px 20px 0; flex-wrap: wrap; }
.btn-secondary {
  background: var(--bg3); color: var(--text); border: 1px solid var(--border);
  border-radius: 50px; padding: 10px 18px;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
.btn-secondary.danger:hover { border-color: var(--red); color: var(--red); }

.btn-primary {
  background: var(--accent); color: #0f1117;
  border: none; border-radius: 50px; padding: 15px 24px;
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800;
  cursor: pointer; width: calc(100% - 40px);
  margin: 14px 20px 8px; display: block; transition: all 0.2s;
}
.btn-primary:hover { background: var(--accent2); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
