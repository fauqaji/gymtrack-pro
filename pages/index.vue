<!-- pages/index.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-row">
        <div>
          <div class="date-text">{{ todayText }}</div>
          <h1 class="greeting">
            Selamat <span>{{ greetingTime }}!</span>
          </h1>
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
        <div class="stat-val">
          {{ (store.totalVolumeKg / 1000).toFixed(1) }}t
        </div>
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
      >
        {{ d }}
      </button>
    </div>

    <!-- Workout Type -->
    <div class="section-label" style="margin-top: 20px">Tipe Workout</div>
    <div class="dropdown-wrap">
      <button
        class="dropdown-btn"
        :class="{ 'active-btn': store.selectedTypeId }"
        @click="showTypeDropdown = !showTypeDropdown"
      >
        <span
          v-if="store.selectedTypeId"
          style="display: flex; align-items: center; gap: 8px"
        >
          <SvgIcon :name="selectedTypeIcon" :size="20" color="var(--text)" />
          {{ selectedTypeName }}
        </span>
        <span v-else class="placeholder">Pilih tipe workout...</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          :style="{
            transform: showTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div class="dropdown-list" v-if="showTypeDropdown">
        <button
          v-for="t in WORKOUT_TYPES"
          :key="t.id"
          class="dropdown-item"
          :class="{ active: store.selectedTypeId === t.id }"
          @click="
            selectType(t);
            showTypeDropdown = false;
          "
        >
          <SvgIcon :name="t.icon" :size="36" color="var(--text2)" />
          <span class="di-info">
            <span class="di-name">{{ t.name }}</span>
            <span class="di-desc">{{ t.desc }}</span>
          </span>
        </button>
      </div>
    </div>

    <div
      class="section-label"
      style="
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 20px;
      "
      v-if="store.customTemplates.length > 0"
    >
      Daily
    </div>
    <div class="type-grid" v-if="store.customTemplates.length > 0">
      <div
        v-for="tpl in store.customTemplates"
        :key="tpl.id"
        class="type-card"
        :class="{ active: store.selectedTypeId === tpl.id }"
        @click="selectCustomTemplate(tpl)"
      >
        <SvgIcon name="daily" :size="22" />
        <span class="type-name">{{ tpl.name }}</span>
        <span class="type-desc">{{ tpl.suggestions.length }} Latihan</span>
      </div>
    </div>

    <!-- Exercise List Header -->
    <div
      class="section-label"
      id="exercise-section"
      style="
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 20px;
      "
    >
      <span>Latihan ({{ store.currentExercises.length }})</span>
      <div
        class="timer-chip"
        :class="{ running: timerRunning }"
        @click="toggleTimer"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
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
      <img
        v-if="emptyIconPath"
        :src="emptyIconPath"
        class="empty-icon"
        alt="Belum ada latihan"
      />
      <h3>Belum ada latihan</h3>
      <p>Pilih tipe workout di atas atau tambah latihan manual</p>
    </div>

    <!-- Action Buttons -->
    <div class="action-row">
      <button class="btn-secondary" @click="showAddModal = true">
        + Tambah Latihan
      </button>
      <button
        v-if="store.currentExercises.length > 0"
        class="btn-secondary danger"
        @click="clearAll"
      >
        🗑 Clear
      </button>
    </div>

    <button
      v-if="store.currentExercises.length > 0"
      class="btn-primary"
      :disabled="finishing"
      @click="handleFinish"
    >
      {{ finishing ? "⏳ Menganalisis..." : "✅ Selesai & Analisis" }}
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
import { useWorkoutStore } from "~/stores/workout";
import { DAYS_ID, WORKOUT_TYPES, MONTHS_ID } from "~/composables/useData";
import { useAI } from "~/composables/useAI";
import type { WorkoutSession } from "~/stores/workout";
import SvgIcon from "~/components/SvgIcon.vue";

const store = useWorkoutStore();
const { toast } = useToast();
const { analyzeWorkout } = useAI();

const showAddModal = ref(false);
const finishing = ref(false);
const finishSession = ref<WorkoutSession | null>(null);

// Timer
const timerRunning = ref(false);
const timerSeconds = ref(0);
const timerDisplay = ref("Rest");
let timerInt: ReturnType<typeof setInterval> | null = null;

const showTypeDropdown = ref(false);

function selectCustomTemplate(template: any) {
  // Hapus semua latihan yang sudah ada
  store.clearExercises();
  // Set tipe workout ke ID daily template
  store.setSelectedType(template.id);
  // Muat latihan dari template
  store.autoLoadExercises(template.suggestions);
  nextTick(() => {
    document
      .getElementById("exercise-section")
      ?.scrollIntoView({ behavior: "smooth" });
  });
}

// Tutup dropdown saat klik di luar
function handleOutsideClick(e: MouseEvent) {
  const wrap = document.querySelector(".dropdown-wrap");
  if (wrap && !wrap.contains(e.target as Node)) {
    showTypeDropdown.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleOutsideClick));
onUnmounted(() => document.removeEventListener("click", handleOutsideClick));

function toggleTimer() {
  if (timerRunning.value) {
    clearInterval(timerInt!);
    timerRunning.value = false;
    timerSeconds.value = 0;
    timerDisplay.value = "Rest";
  } else {
    timerRunning.value = true;
    timerInt = setInterval(() => {
      timerSeconds.value++;
      const m = Math.floor(timerSeconds.value / 60)
        .toString()
        .padStart(2, "0");
      const s = (timerSeconds.value % 60).toString().padStart(2, "0");
      timerDisplay.value = `${m}:${s}`;
      if (timerSeconds.value >= 180) {
        toast("Rest 3 menit selesai! Lanjut set!", "success");
        toggleTimer();
      }
    }, 1000);
  }
}

onUnmounted(() => {
  if (timerInt) clearInterval(timerInt);
});

// Header
const now = new Date();
const todayText = computed(() => {
  const d = new Date();
  return `${DAYS_ID[d.getDay() === 0 ? 6 : d.getDay() - 1]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
});
const greetingTime = computed(() => {
  const h = new Date().getHours();
  return h < 12 ? "Pagi" : h < 15 ? "Siang" : h < 18 ? "Sore" : "Malam";
});
const initials = computed(() => {
  if (!store.profile) return "GT";
  return store.profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
});

const emptyIconPath = ref("");

onMounted(() => {
  // Pilih angka acak 5,6,7,8,9
  const randomNum = Math.floor(Math.random() * 5) + 5;
  emptyIconPath.value = `/dy-img(${randomNum}).svg`;
});

function selectType(t: (typeof WORKOUT_TYPES)[0]) {
  store.clearExercises(); // tambahkan ini
  store.setSelectedType(t.id);
  store.autoLoadExercises(t.suggestions);
}

function clearAll() {
  if (confirm("Hapus semua latihan dari sesi ini?")) {
    store.clearExercises();
    store.setSelectedType("");
  }
}

const selectedTypeName = computed(() => {
  const id = store.selectedTypeId;
  if (!id) return "";
  const found = WORKOUT_TYPES.find((t) => t.id === id);
  if (found) return found.name;
  const custom = store.customTemplates.find((t) => t.id === id);
  if (custom) return custom.name;
  return id; // fallback
});

const selectedTypeIcon = computed(() => {
  const id = store.selectedTypeId;
  if (!id) return "";
  const found = WORKOUT_TYPES.find((t) => t.id === id);
  if (found) return found.icon;
  return "daily"; // icon default untuk custom daily
});

async function handleFinish() {
  if (store.currentExercises.length === 0) {
    toast("Tambahkan latihan dulu!", "");
    return;
  }
  finishing.value = true;
  store.startSession();

  const dayName = DAYS_ID[store.selectedDay - 1];
  const typeName = selectedTypeName.value || "Custom Workout"; // gunakan nama yang sudah di-resolve

  try {
    const aiText = await analyzeWorkout(
      store.currentExercises,
      store.profile!,
      Math.round(
        (store.currentExercises.reduce(
          (a, ex) =>
            a +
            ex.sets.reduce(
              (b, s) => b + (s.reps >= 6 && s.reps <= 12 ? 2 : 1),
              0,
            ),
          0,
        ) /
          Math.max(
            1,
            store.currentExercises.reduce((a, ex) => a + ex.sets.length, 0),
          )) *
          50,
      ),
      typeName,
      store.history,
    );
    const session = store.finishWorkout(dayName, typeName, aiText);
    finishSession.value = session;
  } finally {
    finishing.value = false;
  }
}
</script>

<style scoped>
/* Prevent text selection and context menu */
.page,
.page * {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.page {
  background: var(--bg);
  min-height: 100vh;
}
.header {
  padding: 52px 20px 16px;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.date-text {
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 2px;
}
.greeting {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.greeting span {
  color: var(--accent);
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Syne", sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #0f1117;
  flex-shrink: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 0 20px;
  margin-bottom: 4px;
}
.stat-card {
  background: var(--bg3);
  border-radius: var(--r);
  padding: 12px;
  border: 1px solid var(--border);
  text-align: center;
}
.stat-val {
  font-family: "Syne", sans-serif;
  font-size: 22px;
  font-weight: 800;
}
.stat-val.accent {
  color: var(--accent);
}
.stat-label {
  font-size: 10px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text3);
  margin: 20px 20px 10px;
}

.day-scroll {
  display: flex;
  gap: 8px;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
}
.day-chip {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  color: var(--text2);
  background: var(--bg3);
  transition: all 0.2s;
  font-family: "DM Sans", sans-serif;
}
.day-chip.active {
  background: var(--accent);
  color: #0f1117;
  border-color: var(--accent);
  font-weight: 700;
}

.type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 20px;
}
.type-card {
  background: var(--bg3);
  border-radius: var(--r2);
  padding: 14px 12px;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  text-align: left;
}
.type-card.active {
  border-color: var(--accent);
  background: rgba(200, 241, 53, 0.07);
}
.type-emoji {
  font-size: 22px;
  margin-bottom: 4px;
}
.type-name {
  font-family: "Syne", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.type-desc {
  font-size: 11px;
  color: var(--text2);
}

.timer-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg3);
  border-radius: 50px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.timer-chip.running {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(200, 241, 53, 0.08);
}

.empty-state {
  text-align: center;
  padding: 32px 20px;
  color: var(--text2);
}
.empty-icon {
  width: 44px;
  height: 44px;
  object-fit: contain; /* agar gambar tidak terdistorsi */
  margin-bottom: 10px;
  opacity: 0.6;
  filter: brightness(0) invert(1);
}
.empty-state h3 {
  font-family: "Syne", sans-serif;
  font-size: 16px;
  color: var(--text);
  margin-bottom: 6px;
}
.empty-state p {
  font-size: 14px;
}

.action-row {
  display: flex;
  gap: 10px;
  padding: 12px 20px 0;
  flex-wrap: wrap;
}
.btn-secondary {
  background: var(--bg3);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 50px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "DM Sans", sans-serif;
}
.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.btn-secondary.danger:hover {
  border-color: var(--red);
  color: var(--red);
}

.btn-primary {
  background: var(--accent);
  color: #0f1117;
  border: none;
  border-radius: 50px;
  padding: 15px 24px;
  font-family: "Syne", sans-serif;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  width: calc(100% - 40px);
  margin: 14px 20px 8px;
  display: block;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--accent2);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Dropdown */
.dropdown-wrap {
  position: relative;
  padding: 0 20px;
}
.dropdown-btn {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: var(--text);
  font-family: "Syne", sans-serif;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s;
}
.dropdown-btn:hover {
  border-color: var(--accent);
}
.dropdown-btn .placeholder {
  color: var(--text3);
  font-weight: 400;
  font-family: "DM Sans", sans-serif;
}
.dropdown-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 20px;
  right: 20px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  z-index: 50;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  max-height: 320px;
  overflow-y: auto;
}
.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}
.dropdown-item:last-child {
  border-bottom: none;
}
.dropdown-item:hover {
  background: var(--bg3);
}
.dropdown-item.active {
  background: rgba(200, 241, 53, 0.07);
}
.dropdown-item.active .di-name {
  color: var(--accent);
}
.dropdown-btn.active-btn {
  border-color: var(--accent);
  background: rgba(200, 241, 53, 0.07); /* optional, memberi efek latar seperti daily card */
}
.di-emoji {
  font-size: 20px;
  flex-shrink: 0;
}
.di-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.di-name {
  font-family: "Syne", sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.di-desc {
  font-size: 11px;
  color: var(--text2);
}
</style>
