<!-- components/OnboardScreen.vue -->
<template>
  <div class="onboard">
    <div class="ob-top">
      <h1 class="ob-title">Train<span>.</span><br>Track<span>.</span><br>Grow<span>.</span></h1>
      <p class="ob-sub">Selamat datang di GymTrack Pro. Catat workout, analisis hypertrophy, pantau progress — gratis selamanya.</p>
    </div>

    <div class="ob-form">
      <div class="field">
        <label class="field-label">Nama</label>
        <input v-model="form.name" class="field-input" placeholder="Nama kamu" type="text" />
      </div>
      <div class="field">
        <label class="field-label">Berat Badan (kg)</label>
        <input v-model.number="form.weight" class="field-input" placeholder="70" type="number" />
      </div>
      <div class="field">
        <label class="field-label">Goal Utama</label>
        <select v-model="form.goal" class="field-input">
          <option value="hypertrophy">💪 Hypertrophy (Besar Otot)</option>
          <option value="strength">🏋️ Strength (Kekuatan)</option>
          <option value="endurance">🏃 Endurance (Daya Tahan)</option>
          <option value="fat_loss">🔥 Fat Loss (Turun Berat)</option>
        </select>
      </div>
      <div class="field">
        <label class="field-label">Level Training</label>
        <select v-model="form.level" class="field-input">
          <option value="beginner">🌱 Beginner (0–6 bulan)</option>
          <option value="intermediate">⚡ Intermediate (6–24 bulan)</option>
          <option value="advanced">🔥 Advanced (2+ tahun)</option>
        </select>
      </div>
    </div>

    <button class="btn-start" @click="submit">Mulai Training 💪</button>
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from '~/stores/workout'

const store = useWorkoutStore()

const form = reactive({
  name: '',
  weight: 70,
  goal: 'hypertrophy' as const,
  level: 'beginner' as const,
})

function submit() {
  store.saveProfile({
    name: form.name.trim() || 'Athlete',
    weight: form.weight || 70,
    goal: form.goal,
    level: form.level,
    joinDate: new Date().toISOString(),
  })
}
</script>

<style scoped>
.onboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 60px 28px 40px;
  background: var(--bg);
}
.ob-top { margin-bottom: 32px; }
.ob-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.05;
  margin-bottom: 14px;
  letter-spacing: -1px;
}
.ob-title span { color: var(--accent); }
.ob-sub { color: var(--text2); font-size: 16px; line-height: 1.55; }
.ob-form { flex: 1; display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text3);
}
.field-input {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 13px 16px;
  color: var(--text);
  font-size: 15px;
  font-family: 'DM Sans', sans-serif;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 0.2s;
}
.field-input:focus {
  outline: none;
  border-color: var(--accent);
}
.btn-start {
  background: var(--accent);
  color: #0f1117;
  border: none;
  border-radius: 50px;
  padding: 16px 24px;
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  width: 100%;
  transition: transform 0.15s, background 0.15s;
}
.btn-start:active { transform: scale(0.98); background: var(--accent2); }
</style>
