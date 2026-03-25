<!-- pages/progress.vue -->
<template>
  <div class="page">
    <div class="header">
      <div class="date-text">Perkembangan Kamu</div>
      <h1 class="title">Progress<span>.</span></h1>
    </div>

    <!-- Weekly volume chart -->
    <div class="section-label">Volume 7 Hari Terakhir</div>
    <div class="chart-card">
      <div class="chart-wrap">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <!-- Hypertrophy per muscle -->
    <div class="section-label">Hypertrophy Score per Otot</div>
    <div class="card" v-if="store.muscleHypScores.length > 0">
      <div v-for="m in store.muscleHypScores" :key="m.muscle" class="hyp-row">
        <span class="hyp-muscle">{{ m.muscle }}</span>
        <div class="hyp-bar-wrap">
          <div class="hyp-fill" :style="{ width: m.score + '%', background: barColor(m.score) }"></div>
        </div>
        <span class="hyp-pct" :style="{ color: barColor(m.score) }">{{ m.score }}%</span>
      </div>
    </div>
    <div v-else class="empty-card">
      <p>Belum ada data. Selesaikan workout dulu!</p>
    </div>

    <!-- Personal Records -->
    <div class="section-label">Personal Records 🏆</div>
    <div v-if="store.prList.length > 0">
      <div v-for="pr in store.prList.slice(0, 8)" :key="pr.exId" class="pr-card">
        <div class="pr-left">
          <div class="pr-name">{{ pr.name }}</div>
          <div class="pr-muscle">{{ pr.muscle }}</div>
          <div class="pr-date">{{ formatDate(pr.date) }}</div>
        </div>
        <div class="pr-right">
          <div class="pr-vol">{{ pr.volume.toFixed(0) }} <span>kg vol</span></div>
          <div class="pr-maxw">Max {{ pr.maxWeight }} kg</div>
          <div class="pr-best">Best: {{ pr.bestSet.weight }}kg × {{ pr.bestSet.reps }}</div>
        </div>
      </div>
    </div>
    <div v-else class="empty-card"><p>Belum ada PR. Selesaikan workout pertama!</p></div>

    <!-- Last AI Analysis -->
    <div class="section-label">Analisis AI Terakhir</div>
    <div class="ai-box">
      <div class="ai-title">🤖 AI Coach</div>
      <div class="ai-body" v-if="store.lastAiAnalysis" v-html="formattedAI"></div>
      <div v-else class="ai-body empty-ai">Belum ada analisis. Selesaikan sesi workout dulu!</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from '~/stores/workout'
import { formatDate } from '~/composables/useData'

const store = useWorkoutStore()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

const formattedAI = computed(() =>
  store.lastAiAnalysis
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
)

function barColor(score: number): string {
  if (score >= 70) return 'var(--green)'
  if (score >= 40) return 'var(--orange)'
  return 'var(--red)'
}

function buildChart() {
  if (!chartCanvas.value) return
  import('chart.js').then(({ Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, defaults }) => {
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)
    defaults.font.family = "'DM Sans', sans-serif"

    if (chartInstance) chartInstance.destroy()

    const data = store.weeklyVolumeData
    chartInstance = new Chart(chartCanvas.value!, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.volume),
          backgroundColor: data.map(d => d.volume > 0 ? 'rgba(200,241,53,0.75)' : 'rgba(255,255,255,0.05)'),
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => `${ctx.raw} kg` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#5a6070', font: { size: 12 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a6070', font: { size: 11 } } },
        },
      },
    })
  })
}

onMounted(() => { buildChart() })
watch(() => store.history, () => { buildChart() })
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
.header { padding: 52px 20px 16px; }
.date-text { font-size: 13px; color: var(--text2); margin-bottom: 2px; }
.title { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
.title span { color: var(--accent); }

.section-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text3);
  margin: 20px 20px 10px;
}
.chart-card {
  margin: 0 20px 4px; background: var(--bg2);
  border-radius: var(--r2); padding: 16px;
  border: 1px solid var(--border);
}
.chart-wrap { max-height: 180px; }

.card {
  margin: 0 20px 4px; background: var(--bg2);
  border-radius: var(--r2); padding: 16px;
  border: 1px solid var(--border);
}
.hyp-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.hyp-row:last-child { margin-bottom: 0; }
.hyp-muscle { font-size: 12px; color: var(--text2); min-width: 100px; }
.hyp-bar-wrap { flex: 1; height: 7px; background: var(--bg4); border-radius: 4px; overflow: hidden; }
.hyp-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
.hyp-pct { font-size: 12px; font-weight: 600; min-width: 38px; text-align: right; }

.pr-card {
  display: flex; justify-content: space-between; align-items: flex-start;
  background: var(--bg2); border-radius: var(--r2); padding: 14px 16px;
  margin: 0 20px 10px; border: 1px solid var(--border);
}
.pr-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
.pr-muscle { font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.07em; margin-top: 2px; font-weight: 600; }
.pr-date { font-size: 11px; color: var(--text3); margin-top: 4px; }
.pr-right { text-align: right; }
.pr-vol { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--accent); }
.pr-vol span { font-size: 11px; font-weight: 400; color: var(--text2); }
.pr-maxw { font-size: 12px; color: var(--text2); margin-top: 2px; }
.pr-best { font-size: 11px; color: var(--text3); margin-top: 1px; }

.ai-box {
  background: rgba(200,241,53,0.04); border: 1px solid rgba(200,241,53,0.2);
  border-radius: var(--r2); padding: 14px 16px; margin: 0 20px 20px;
}
.ai-title { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
.ai-body { font-size: 13px; color: var(--text); line-height: 1.65; }
.empty-ai { color: var(--text2); }

.empty-card {
  margin: 0 20px 4px; background: var(--bg2);
  border-radius: var(--r2); padding: 20px;
  border: 1px solid var(--border); text-align: center;
  color: var(--text2); font-size: 14px;
}
</style>