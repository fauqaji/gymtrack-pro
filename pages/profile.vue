<!-- pages/profile.vue -->
<template>
  <div class="page">
    <div class="header">
      <div class="date-text">Profil & Pengaturan</div>
      <h1 class="title">Profil<span>.</span></h1>
    </div>

    <!-- Avatar + name -->
    <div class="profile-top">
      <div class="p-avatar">{{ initials }}</div>
      <div class="p-name">{{ store.profile?.name }}</div>
      <div class="p-sub">{{ levelLabel }} · {{ goalLabel }}</div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-val">{{ store.totalSessions }}</div>
        <div class="stat-label">Total Sesi</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ (store.totalVolumeKg / 1000).toFixed(1) }}</div>
        <div class="stat-label">Total Ton</div>
      </div>
      <div class="stat-card">
        <div class="stat-val accent">{{ store.streakDays }}</div>
        <div class="stat-label">Streak</div>
      </div>
    </div>

    <!-- Edit Profile -->
    <div class="section-label">Edit Profil</div>
    <div class="card">
      <div class="field-row">
        <label>Nama</label>
        <input v-model="form.name" class="f-input" type="text" />
      </div>
      <div class="field-row">
        <label>Berat Badan (kg)</label>
        <input v-model.number="form.weight" class="f-input" type="number" style="width: 80px" />
      </div>
      <div class="field-row">
        <label>Goal</label>
        <select v-model="form.goal" class="f-input">
          <option value="hypertrophy">Hypertrophy</option>
          <option value="strength">Strength</option>
          <option value="endurance">Endurance</option>
          <option value="fat_loss">Fat Loss</option>
        </select>
      </div>
      <div class="field-row" style="border: none">
        <label>Level</label>
        <select v-model="form.level" class="f-input">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <button class="btn-save" @click="saveProfile">Simpan Perubahan</button>
    </div>

    <!-- API Key setting -->
    <div class="section-label">AI Coach Setup</div>
    <div class="card">
      <p style="font-size: 13px; color: var(--text2); margin-bottom: 12px; line-height: 1.55;">
        Masukkan Anthropic API Key kamu untuk mengaktifkan analisis AI. Key tersimpan hanya di HP kamu, tidak dikirim ke server lain.
      </p>
      <div class="field-row" style="border: none">
        <label>API Key</label>
        <input
          v-model="apiKey"
          class="f-input"
          type="password"
          placeholder="sk-ant-..."
          style="width: 180px; font-size: 12px"
        />
      </div>
      <button class="btn-save" @click="saveApiKey">Simpan API Key</button>
      <p style="font-size: 11px; color: var(--text3); margin-top: 8px">
        Dapatkan API key gratis di <a href="https://console.anthropic.com" style="color: var(--accent)">console.anthropic.com</a>. Free tier tersedia.
      </p>
    </div>

    <!-- Data Management -->
    <div class="section-label">Manajemen Data</div>
    <div class="card">
      <div class="action-row" @click="exportData">
        <div class="ar-label">📤 Export Data (JSON)</div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="action-row" @click="triggerImport">
        <div class="ar-label">📥 Import Data</div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="action-row danger" style="border: none" @click="resetAll">
        <div class="ar-label" style="color: var(--red)">🗑 Reset Semua Data</div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="importData" />

    <div style="height: 20px"></div>
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from '~/stores/workout'

const store = useWorkoutStore()
const { toast } = useToast()
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  name: store.profile?.name ?? '',
  weight: store.profile?.weight ?? 70,
  goal: store.profile?.goal ?? 'hypertrophy',
  level: store.profile?.level ?? 'beginner',
})

const apiKey = ref(
  typeof window !== 'undefined' ? localStorage.getItem('gym_api_key') ?? '' : ''
)

watch(() => store.profile, (p) => {
  if (!p) return
  form.name = p.name
  form.weight = p.weight
  form.goal = p.goal
  form.level = p.level
})

const initials = computed(() =>
  (store.profile?.name ?? 'GT').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
)

const goalLabel = computed(() => {
  const map: Record<string, string> = { hypertrophy: 'Hypertrophy', strength: 'Strength', endurance: 'Endurance', fat_loss: 'Fat Loss' }
  return map[store.profile?.goal ?? 'hypertrophy']
})
const levelLabel = computed(() => {
  const map: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
  return map[store.profile?.level ?? 'beginner']
})

function saveProfile() {
  store.saveProfile({
    name: form.name.trim() || store.profile!.name,
    weight: form.weight || store.profile!.weight,
    goal: form.goal as any,
    level: form.level as any,
    joinDate: store.profile!.joinDate,
  })
  toast('Profil disimpan!', 'success')
}

function saveApiKey() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gym_api_key', apiKey.value)
  }
  toast('API Key disimpan!', 'success')
}

function exportData() {
  const json = store.exportData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gymtrack-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  toast('Data diekspor!', 'success')
}

function triggerImport() {
  fileInput.value?.click()
}

function importData(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const ok = store.importData(ev.target?.result as string)
    toast(ok ? 'Data berhasil diimport!' : 'File tidak valid!', ok ? 'success' : 'error')
  }
  reader.readAsText(file)
}

function resetAll() {
  if (!confirm('Reset SEMUA data? Tindakan ini tidak bisa dibatalkan!')) return
  store.resetAll()
  if (typeof window !== 'undefined') location.reload()
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

.page { background: var(--bg); min-height: 100vh; }
.header { padding: 52px 20px 8px; }
.date-text { font-size: 13px; color: var(--text2); margin-bottom: 2px; }
.title { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
.title span { color: var(--accent); }

.profile-top { text-align: center; margin: 8px 0 16px; }
.p-avatar {
  width: 76px; height: 76px; border-radius: 50%; background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px;
  color: #0f1117; margin: 0 auto 10px;
}
.p-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
.p-sub { font-size: 14px; color: var(--text2); margin-top: 4px; }

.stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 0 20px; margin-bottom: 4px; }
.stat-card { background: var(--bg3); border-radius: var(--r); padding: 12px; border: 1px solid var(--border); text-align: center; }
.stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
.stat-val.accent { color: var(--accent); }
.stat-label { font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

.section-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text3); margin: 20px 20px 10px;
}
.card { background: var(--bg2); border-radius: var(--r2); padding: 0 16px; margin: 0 20px 12px; border: 1px solid var(--border); }
.field-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-bottom: 1px solid var(--border); gap: 12px;
}
.field-row label { font-size: 14px; color: var(--text); }
.f-input {
  background: var(--bg4); border: 1px solid var(--border); border-radius: 8px;
  padding: 7px 10px; color: var(--text); font-size: 13px;
  font-family: 'DM Sans', sans-serif; text-align: right; min-width: 120px;
  appearance: none;
}
.f-input:focus { outline: none; border-color: var(--accent); }
.btn-save {
  background: var(--accent); color: #0f1117; border: none;
  border-radius: 50px; padding: 11px 20px;
  font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800;
  cursor: pointer; width: 100%; margin: 14px 0; transition: background 0.2s;
}
.btn-save:hover { background: var(--accent2); }

.action-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0; border-bottom: 1px solid var(--border); cursor: pointer;
}
.ar-label { font-size: 14px; }
</style>
