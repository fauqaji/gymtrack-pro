<!-- pages/history.vue -->
<template>
  <div class="page">
    <div class="header">
      <div class="date-text">Semua Catatan</div>
      <h1 class="title">Riwayat<span>.</span></h1>
    </div>

    <div v-if="store.history.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>Belum ada riwayat</h3>
      <p>Selesaikan workout pertamamu untuk mulai mencatat!</p>
    </div>

    <div v-for="session in store.history" :key="session.id" class="session-card" @click="selected = session">
      <div class="sc-header">
        <div>
          <div class="sc-type">{{ session.typeName }}</div>
          <div class="sc-date">{{ formatDate(session.date) }}</div>
        </div>
        <div class="sc-right">
          <span class="badge" :class="hypBadgeClass(session.hypScore)">{{ hypBadgeLabel(session.hypScore) }}</span>
        </div>
      </div>
      <div class="sc-stats">
        <span><strong>{{ session.totalVolume.toFixed(0) }} kg</strong> volume</span>
        <span><strong>{{ session.totalSets }}</strong> set</span>
        <span><strong>{{ session.exercises.length }}</strong> latihan</span>
        <span v-if="session.durationMinutes"><strong>{{ session.durationMinutes }}</strong> menit</span>
        <span class="sc-day">{{ session.day }}</span>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selected" class="overlay" @click.self="selected = null">
      <div class="sheet">
        <div class="handle"></div>
        <div class="detail-header">
          <div>
            <h3>{{ selected.typeName }}</h3>
            <div class="sc-date">{{ formatDate(selected.date) }} · {{ selected.day }}</div>
          </div>
          <button class="btn-del" @click="deleteSession(selected.id)">🗑</button>
        </div>

        <div class="stats-row">
          <div class="s-card"><div class="s-val accent">{{ selected.totalVolume.toFixed(0) }}</div><div class="s-label">Vol (kg)</div></div>
          <div class="s-card"><div class="s-val">{{ selected.totalSets }}</div><div class="s-label">Set</div></div>
          <div class="s-card"><div class="s-val">{{ selected.totalReps }}</div><div class="s-label">Reps</div></div>
          <div class="s-card"><div class="s-val">{{ selected.hypScore }}%</div><div class="s-label">Hyp</div></div>
        </div>

        <div v-for="ex in selected.exercises" :key="ex.id" class="ex-summary">
          <div class="exs-header">
            <span class="exs-name">{{ ex.name }}</span>
            <span class="exs-muscle">{{ ex.muscle }}</span>
          </div>
          <div v-for="(s, i) in ex.sets" :key="i" class="exs-set">
            <span class="set-n">{{ i + 1 }}</span>
            <span>{{ s.reps }} reps</span>
            <span>{{ s.weight }} kg</span>
            <span class="exs-vol">{{ (s.reps * s.weight).toFixed(0) }} kg</span>
          </div>
        </div>

        <div v-if="selected.aiAnalysis" class="ai-box">
          <div class="ai-title">🤖 AI Coach</div>
          <div class="ai-body" v-html="formatAI(selected.aiAnalysis)"></div>
        </div>

        <button class="btn-close" @click="selected = null">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from '~/stores/workout'
import { formatDate } from '~/composables/useData'
import type { WorkoutSession } from '~/stores/workout'

const store = useWorkoutStore()
const { toast } = useToast()
const selected = ref<WorkoutSession | null>(null)

function hypBadgeClass(score: number) {
  return score >= 80 ? 'green' : score >= 55 ? 'orange' : 'red'
}
function hypBadgeLabel(score: number) {
  return score >= 80 ? '✅ Hyp Zone' : score >= 55 ? '⚠ Partial' : '❌ Below'
}

function formatAI(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}

function deleteSession(id: number) {
  if (!confirm('Hapus sesi ini?')) return
  store.deleteSession(id)
  selected.value = null
  toast('Sesi dihapus', '')
}
</script>

<style scoped>
.page { background: var(--bg); min-height: 100vh; }
.header { padding: 52px 20px 16px; }
.date-text { font-size: 13px; color: var(--text2); margin-bottom: 2px; }
.title { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
.title span { color: var(--accent); }

.empty-state { text-align: center; padding: 48px 20px; color: var(--text2); }
.empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.35; }
.empty-state h3 { font-family: 'Syne', sans-serif; font-size: 16px; color: var(--text); margin-bottom: 6px; }

.session-card {
  background: var(--bg2); border-radius: var(--r2); padding: 14px 16px;
  margin: 0 20px 10px; border: 1px solid var(--border); cursor: pointer;
  transition: border-color 0.2s;
}
.session-card:hover { border-color: rgba(200,241,53,0.3); }
.sc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.sc-type { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }
.sc-date { font-size: 12px; color: var(--text2); margin-top: 2px; }
.sc-stats { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--text2); }
.sc-stats strong { color: var(--text); }
.sc-day { color: var(--accent); font-weight: 600; }

.badge {
  display: inline-flex; padding: 3px 10px; border-radius: 50px;
  font-size: 11px; font-weight: 600;
}
.badge.green { background: rgba(74,222,128,0.15); color: var(--green); }
.badge.orange { background: rgba(255,140,66,0.15); color: var(--orange); }
.badge.red { background: rgba(255,77,77,0.15); color: var(--red); }

/* Modal */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: flex-end; }
.sheet {
  background: var(--bg2); border-radius: 24px 24px 0 0; padding: 12px 20px 40px;
  width: 100%; max-height: 92vh; overflow-y: auto; border-top: 1px solid var(--border);
}
.handle { width: 40px; height: 4px; background: var(--bg4); border-radius: 2px; margin: 0 auto 16px; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
h3 { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
.btn-del { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text3); }
.stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.s-card { background: var(--bg3); border-radius: var(--r); padding: 10px 8px; border: 1px solid var(--border); text-align: center; }
.s-val { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; }
.s-val.accent { color: var(--accent); }
.s-label { font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

.ex-summary { background: var(--bg3); border-radius: var(--r); padding: 12px; margin-bottom: 8px; border: 1px solid var(--border); }
.exs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.exs-name { font-size: 14px; font-weight: 600; }
.exs-muscle { font-size: 10px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; }
.exs-set { display: grid; grid-template-columns: 20px 1fr 1fr 1fr; gap: 4px; font-size: 12px; color: var(--text2); padding: 3px 0; }
.set-n { color: var(--text3); }
.exs-vol { color: var(--text3); text-align: right; }

.ai-box { background: rgba(200,241,53,0.04); border: 1px solid rgba(200,241,53,0.2); border-radius: var(--r2); padding: 14px 16px; margin: 12px 0; }
.ai-title { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
.ai-body { font-size: 13px; color: var(--text); line-height: 1.65; }

.btn-close { background: var(--accent); color: #0f1117; border: none; border-radius: 50px; padding: 14px; width: 100%; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 8px; }
</style>
