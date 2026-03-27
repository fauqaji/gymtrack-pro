<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <button class="btn-close" @click="$emit('close')">✕</button>
        <span class="modal-title">GymTrack Share</span>
        <button
          class="btn-download"
          @click="downloadImage"
          :disabled="!photoTaken"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      <div class="source-row">
        <button
          class="source-btn"
          :class="{ active: mode === 'camera' }"
          @click="switchMode('camera')"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
            />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Kamera
        </button>
        <button
          class="source-btn"
          :class="{ active: mode === 'gallery' }"
          @click="switchMode('gallery')"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Galeri
        </button>
      </div>

      <div class="data-row">
        <span class="data-label">Data dari:</span>
        <div class="data-toggle">
          <button
            class="data-btn"
            :class="{ active: dataSource === 'current' }"
            @click="dataSource = 'current'"
            :disabled="store.currentExercises.length === 0"
          >
            Sesi Ini
          </button>
          <button
            class="data-btn"
            :class="{ active: dataSource === 'last' }"
            @click="dataSource = 'last'"
            :disabled="store.history.length === 0"
          >
            Sesi Terakhir
          </button>
        </div>
      </div>

      <div class="preview-wrap">
        <canvas
          ref="canvasRef"
          class="preview-canvas"
          :class="{ visible: photoTaken }"
        ></canvas>
        <video
          ref="videoRef"
          class="preview-video"
          :class="{ visible: mode === 'camera' && !photoTaken }"
          autoplay
          playsinline
          muted
        ></video>

        <div
          class="gallery-placeholder"
          :class="{ visible: mode === 'gallery' && !photoTaken }"
          @click="triggerFileInput"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Tap untuk pilih foto</span>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="onFileSelected"
        />

        <div v-if="!photoTaken && sessionData" class="stats-overlay">
          <template v-if="activeOverlay === 0">
            <div class="ov ov-bottom-full">
              <div class="ov-type">{{ sessionData.typeName }}</div>
              <div class="ov-stats-row">
                <div class="ov-stat" v-for="s in fullStats" :key="s.label">
                  <div class="ov-val" :class="{ accent: s.accent }">
                    {{ s.val }}
                  </div>
                  <div class="ov-lbl">{{ s.label }}</div>
                </div>
              </div>
              <div class="ov-footer">
                <span class="ov-streak"
                  >🔥{{ store.streakDays }} hari streak</span
                >
                <div class="ov-brand">
                  <span class="ov-brandtxt">GYMTRACK</span>
                  <img src="/icon.png" class="ov-icon" alt="GT" />
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeOverlay === 1">
            <div class="ov ov-center">
              <div class="ov-big-num">
                {{ sessionData.maxWeight }}<span class="ov-unit">kg</span>
              </div>
              <div class="ov-big-label">BEBAN TERBERAT</div>
              <div class="ov-brandtxt-lg">GYMTRACK</div>
              <img src="/icon.png" class="ov-icon-lg" alt="GT" />
            </div>
          </template>

          <template v-else-if="activeOverlay === 2">
            <div class="ov ov-split">
              <div class="ov-split-top">
                <img src="/icon.png" class="ov-icon" alt="GT" />
                <div class="ov-split-brand">
                  <div class="ov-brandtxt">GYMTRACK</div>
                </div>
              </div>
              <div class="ov-split-bottom">
                <div class="ov-split-vol">
                  {{ formatVol(sessionData.totalVolume) }}
                </div>
                <div class="ov-split-vollbl">TOTAL VOLUME</div>
                <div class="ov-split-sub">
                  {{ sessionData.totalSets }} sets ·
                  {{ sessionData.totalReps }} reps
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeOverlay === 3">
            <div class="ov ov-minimal">
              <div class="ov-minimal-inner">
                <div class="ov-minimal-streak">{{ store.streakDays }}🔥</div>
                <div class="ov-minimal-label">HARI STREAK</div>
                <div class="ov-minimal-divider"></div>
                <div class="ov-minimal-type">{{ sessionData.typeName }}</div>
                <div class="ov-minimal-brand">
                  <img src="/icon.png" class="ov-icon-xs" alt="GT" />
                  <span>GYMTRACK</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeOverlay === 4">
            <div class="ov ov-hyper">
              <div class="ov-hyper-badge">
                <div class="ov-hyper-pct">{{ sessionData.hypScore }}%</div>
                <div class="ov-hyper-lbl">HYPERTROPHY</div>
              </div>
              <div class="ov-hyper-bottom">
                <div class="ov-hyper-type">{{ sessionData.typeName }}</div>
                <div class="ov-hyper-sub">
                  {{ sessionData.totalSets }} sets ·
                  {{ sessionData.maxWeight }}kg max
                </div>
                <div class="ov-brand-row">
                  <img src="/icon.png" class="ov-icon-xs" alt="GT" />
                  <span class="ov-brandtxt-sm">GYMTRACK</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="activeOverlay === 5">
            <div class="ov ov-pr-single">
              <div class="ov-pr-single-card" v-if="topPRs.length > 0">
                <div class="ov-pr-single-left">
                  <div class="ov-pr-single-name">{{ topPRs[0].name }}</div>
                  <div class="ov-pr-single-muscle">
                    {{ topPRs[0].muscle || "OTOT" }}
                  </div>
                </div>
                <div class="ov-pr-single-right">
                  <div class="ov-pr-single-vol">
                    {{ Math.round(topPRs[0].volume) }}<span> kg vol</span>
                  </div>
                  <div class="ov-pr-single-max">
                    Max {{ topPRs[0].maxWeight }} kg
                  </div>
                  <div class="ov-pr-single-best">
                    Best: {{ topPRs[0].maxWeight }}kg × {{ topPRs[0].reps }}
                  </div>
                </div>
              </div>
              <div v-else class="ov-pr-single-empty">
                Belum ada PR. Selesaikan workout dulu!
              </div>
              <div class="ov-pr-single-footer">
                <div class="ov-pr-single-title">PERSONAL RECORD</div>
                <div class="ov-pr-single-logo">
                  <img src="/icon.png" class="ov-icon" alt="GT" />
                  <span>GYMTRACK</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="overlay-dots" v-if="!photoTaken">
          <button
            v-for="(o, i) in overlayStyles"
            :key="i"
            class="dot"
            :class="{ active: activeOverlay === i }"
            @click="activeOverlay = i"
          >
            {{ o.icon }}
          </button>
        </div>
      </div>

      <div class="actions">
        <template v-if="!photoTaken">
          <button class="btn-capture" @click="capturePhoto">
            <div class="capture-ring"></div>
          </button>
        </template>
        <template v-else>
          <button class="btn-retake" @click="retake">↩ Ulangi</button>
          <button class="btn-save" @click="downloadImage">💾 Simpan</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useWorkoutStore } from "~/stores/workout";
import {
  calcHypertrophyScore,
  MONTHS_ID,
  DAYS_ID,
} from "~/composables/useData";

const emit = defineEmits(["close"]);
const store = useWorkoutStore();

const mode = ref<"camera" | "gallery">("camera");
const dataSource = ref<"current" | "last">(
  store.currentExercises.length > 0 ? "current" : "last",
);
const photoTaken = ref(false);
const activeOverlay = ref(0); // Mode Overlay Aktif
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
let stream: MediaStream | null = null;

const overlayStyles = [
  { icon: "▦" },
  { icon: "◎" },
  { icon: "◱" },
  { icon: "—" },
  { icon: "◈" },
  { icon: "🏆" },
];

const sessionData = computed(() => {
  if (dataSource.value === "current" && store.currentExercises.length > 0) {
    const exs = store.currentExercises;
    const totalSets = exs.reduce((a, ex) => a + ex.sets.length, 0);
    const totalReps = exs.reduce(
      (a, ex) => a + ex.sets.reduce((b, s) => b + (s.reps || 0), 0),
      0,
    );
    const totalVolume = exs.reduce(
      (a, ex) =>
        a + ex.sets.reduce((b, s) => b + (s.reps || 0) * (s.weight || 0), 0),
      0,
    );
    const maxWeight = Math.max(
      ...exs.flatMap((ex) => ex.sets.map((s) => s.weight || 0)),
    );
    const hypScore = calcHypertrophyScore(exs);

    // Perbaikan nama Custom Workout
    let type = store.selectedTypeId || "Latihan Bebas";
    const customTpl = store.customTemplates.find(
      (t) => t.id === store.selectedTypeId || t.name === store.selectedTypeId,
    );
    if (customTpl) type = customTpl.name;

    return {
      typeName: type.toUpperCase(),
      totalSets,
      totalReps,
      totalVolume,
      maxWeight,
      hypScore,
    };
  }
  if (dataSource.value === "last" && store.history.length > 0) {
    const s = store.history[0];
    const maxWeight = Math.max(
      ...s.exercises.flatMap((ex) => ex.sets.map((set) => set.weight || 0)),
    );
    return {
      typeName: s.typeName.toUpperCase(),
      totalSets: s.totalSets,
      totalReps: s.totalReps,
      totalVolume: s.totalVolume,
      maxWeight,
      hypScore: s.hypScore,
    };
  }
  return null;
});

const todayStr = computed(() => {
  const d = new Date();
  return `${DAYS_ID[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
});

const fullStats = computed(() =>
  sessionData.value
    ? [
        { val: String(sessionData.value.totalSets), label: "SETS" },
        { val: String(sessionData.value.totalReps), label: "REPS" },
        { val: formatVol(sessionData.value.totalVolume), label: "VOL" },
        { val: sessionData.value.maxWeight + "kg", label: "MAX" },
        { val: sessionData.value.hypScore + "%", label: "HYPER", accent: true },
      ]
    : [],
);

const topPRs = computed(() => {
  return store.prList.slice(0, 3).map((pr) => ({
    name: pr.name,
    muscle: pr.muscle,
    volume: pr.volume,
    maxWeight: pr.maxWeight,
    reps: pr.bestSet.reps,
  }));
});

function formatVol(v: number) {
  return v >= 1000 ? (v / 1000).toFixed(1) + "t" : v + "kg";
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    if (videoRef.value) videoRef.value.srcObject = stream;
  } catch (e) {
    console.error("Camera error:", e);
  }
}

function stopCamera() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
}

function switchMode(m: "camera" | "gallery") {
  mode.value = m;
  photoTaken.value = false;
  if (m === "camera") startCamera();
  else stopCamera();
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => drawOverlay(img);
  img.src = URL.createObjectURL(file);
}

function capturePhoto() {
  if (!videoRef.value || !canvasRef.value) return;
  drawOverlay(videoRef.value);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawOverlay(source: HTMLVideoElement | HTMLImageElement) {
  const canvas = canvasRef.value!;
  const wrap = canvas.parentElement!;
  const rect = wrap.getBoundingClientRect();

  // Mengikuti rasio asli layar HP secara dinamis
  const W = 1080;
  const H = Math.round(W * (rect.height / rect.width));
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const sw =
    source instanceof HTMLVideoElement
      ? source.videoWidth
      : (source as HTMLImageElement).naturalWidth;
  const sh =
    source instanceof HTMLVideoElement
      ? source.videoHeight
      : (source as HTMLImageElement).naturalHeight;
  const scale = Math.max(W / sw, H / sh);
  const dx = (W - sw * scale) / 2;
  const dy = (H - sh * scale) / 2;
  ctx.drawImage(source, dx, dy, sw * scale, sh * scale);

  // BUG FIX: Memanggil file logo yang benar agar galeri tidak macet
  const logo = new Image();
  logo.src = "/icon.png";

  const draw = () => {
    if (!sessionData.value) {
      photoTaken.value = true;
      stopCamera();
      return;
    }
    const d = sessionData.value;
    const style = activeOverlay.value;

    if (style === 0) {
      const grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.6)");
      grad.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const pad = 48;
      const bottom = H - 40;

      const logoSize = 56;
      const logoX = W - pad - logoSize;
      const logoY = bottom - logoSize;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "700 24px 'Syne', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("GYMTRACK", logoX - 12, bottom - 18);
      ctx.textAlign = "left";

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "500 28px 'Syne', sans-serif";
      ctx.fillText(`🔥 ${store.streakDays} hari streak`, pad, bottom - 14);

      const statsY = bottom - 96;
      const stats = [
        { val: String(d.totalSets), label: "SETS" },
        { val: String(d.totalReps), label: "REPS" },
        { val: formatVol(d.totalVolume), label: "VOL" },
        { val: d.maxWeight + "kg", label: "MAX" },
        { val: d.hypScore + "%", label: "HYPER", accent: true },
      ];
      const colW = (W - pad * 2) / stats.length;
      stats.forEach((s, i) => {
        const x = pad + i * colW;
        ctx.fillStyle = s.accent ? "#C8F135" : "#fff";
        ctx.font = "bold 44px 'Syne', sans-serif";
        ctx.fillText(s.val, x, statsY);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "500 20px 'Syne', sans-serif";
        ctx.fillText(s.label, x, statsY + 30);
      });

      ctx.fillStyle = "#C8F135";
      ctx.font = "bold 36px 'Syne', sans-serif";
      ctx.fillText(d.typeName, pad, statsY - 54);
    } else if (style === 1) {
      const grad = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        W * 0.8,
      );
      grad.addColorStop(0, "rgba(0,0,0,0.15)");
      grad.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const cy = H / 2;
      ctx.textAlign = "left";

      ctx.font = "bold 120px 'Syne', sans-serif";
      const numWidth = ctx.measureText(String(d.maxWeight)).width;
      ctx.font = "600 60px 'Syne', sans-serif";
      const kgWidth = ctx.measureText("kg").width;

      const totalWidth = numWidth + 12 + kgWidth;
      const startX = W / 2 - totalWidth / 2 - 20;

      ctx.fillStyle = "#C8F135";
      ctx.font = "bold 120px 'Syne', sans-serif";
      ctx.fillText(String(d.maxWeight), startX, cy - 40);

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "600 90px 'Syne', sans-serif";
      ctx.fillText("kg", startX + numWidth + 12, cy - 35);

      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "700 40px 'Syne', sans-serif";
      ctx.fillText("BEBAN TERBERAT", W / 2, cy + 30);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "700 45px 'Syne', sans-serif";
      ctx.fillText("GYMTRACK", W / 2, cy + 100);

      ctx.drawImage(logo, W / 2 - 40, cy + 130, 80, 80);
      ctx.textAlign = "left";
    } else if (style === 2) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0.55)");
      grad.addColorStop(0.35, "rgba(0,0,0,0)");
      grad.addColorStop(0.65, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.88)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.drawImage(logo, 48, 48, 64, 64);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "700 26px 'Syne', sans-serif";
      ctx.fillText("GYMTRACK", 128, 76);

      ctx.textAlign = "right";
      ctx.fillStyle = "#C8F135";
      ctx.font = "bold 120px 'Syne', sans-serif";
      ctx.fillText(formatVol(d.totalVolume), W - 48, H - 120);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "600 22px 'Syne', sans-serif";
      ctx.fillText("TOTAL VOLUME", W - 48, H - 70);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "500 32px 'Syne', sans-serif";
      ctx.fillText(`${d.totalSets} sets · ${d.totalReps} reps`, W - 48, H - 36);
      ctx.textAlign = "left";
    } else if (style === 3) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      roundRect(ctx, W / 2 - 340, H - 320, 680, 280, 20);
      ctx.fill();

      ctx.textAlign = "center";

      ctx.fillStyle = "#C8F135";
      ctx.font = "bold 56px 'Syne', sans-serif";
      ctx.fillText(`${store.streakDays}🔥`, W / 2, H - 240);

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "500 18px 'Syne', sans-serif";
      ctx.fillText("HARI STREAK", W / 2, H - 210);

      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(W / 2 - 60, H - 190, 120, 1.5);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "700 22px 'Syne', sans-serif";
      ctx.fillText(d.typeName, W / 2, H - 155);

      ctx.drawImage(logo, W / 2 - 30, H - 135, 45, 45);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "800 25px 'Syne', sans-serif";
      ctx.fillText("GYMTRACK", W / 2, H - 55);

      ctx.textAlign = "left";
    } else if (style === 4) {
      const grad = ctx.createLinearGradient(0, H * 0.6, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#C8F135";
      roundRect(ctx, W - 280, 48, 240, 110, 20);
      ctx.fill();
      ctx.fillStyle = "#0f1117";
      ctx.font = "bold 60px 'Syne', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(d.hypScore + "%", W - 60, 110);
      ctx.font = "700 18px 'Syne', sans-serif";
      ctx.fillText("HYPERTROPHY", W - 60, 140);
      ctx.textAlign = "left";

      ctx.fillStyle = "#fff";
      ctx.font = "bold 33px 'Syne', sans-serif";
      ctx.fillText(d.typeName, 48, H - 120);

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "500 24px 'Syne', sans-serif";
      ctx.fillText(`${d.totalSets} sets · ${d.maxWeight}kg max`, 48, H - 80);

      ctx.drawImage(logo, 48, H - 56, 28, 28);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "500 20px 'Syne', sans-serif";
      ctx.fillText("GYMTRACK", 86, H - 36);
    } else if (style === 5) {
      const prList = topPRs.value;

      if (prList.length === 0) {
        ctx.font = "18px 'DM Sans', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.textAlign = "center";
        ctx.fillText("Belum ada PR. Selesaikan workout dulu!", W / 2, H / 2);
      } else {
        // --- AMBIL HANYA 1 DATA PR TERATAS ---
        const pr = prList[0];

        // Lebar card dikurangi 350, X diatur 175 agar posisinya 100% presisi di tengah
        const cardWidth = W - 350;
        const cardX = 175;
        const itemHeight = 110;

        const titleY = H - 120;
        const logoY = H - 90;

        // Posisikan 1 card ini tepat di atas judul
        const y = titleY - itemHeight - 40;

        // --- 1. BACKGROUND CARD ---
        ctx.fillStyle = "rgba(30, 31, 42, 0.85)"; // Mirip warna var(--bg2)
        roundRect(ctx, cardX, y, cardWidth, itemHeight, 16);
        ctx.fill();

        // --- 2. BORDER CARD ---
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Border halus
        ctx.lineWidth = 1.5;
        roundRect(ctx, cardX, y, cardWidth, itemHeight, 16);
        ctx.stroke();

        // Padding di dalam card
        const leftX = cardX + 24;
        const rightX = cardX + cardWidth - 24;

        // ==========================================
        // --- KOLOM KIRI (NAMA LATIHAN & OTOT) ---
        // ==========================================
        ctx.textAlign = "left";

        // Nama Latihan (Putih, Bold, Besar)
        ctx.fillStyle = "#fff";
        ctx.font = "bold 24px 'Syne', sans-serif";
        ctx.fillText(pr.name, leftX, y + 42);

        // Nama Otot (Warna Hijau Accent, Uppercase)
        ctx.fillStyle = "#C8F135";
        ctx.font = "bold 15px 'DM Sans', sans-serif";
        const muscleName = pr.muscle ? pr.muscle.toUpperCase() : "OTOT";
        ctx.fillText(muscleName, leftX, y + 70);

        // ==========================================
        // --- KOLOM KANAN (STATISTIK VOLUME & REPS) ---
        // ==========================================
        ctx.textAlign = "right";

        // 1. Label "kg vol" (Warna Abu, ukuran kecil)
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "500 15px 'DM Sans', sans-serif";
        ctx.fillText(" kg vol", rightX, y + 42);

        // Ukur lebar " kg vol" agar angka Volume bisa digeser tepat di sebelahnya
        const kgWidth = ctx.measureText(" kg vol").width;

        // 2. Angka Volume (Warna Hijau Accent, Bold, Besar)
        ctx.fillStyle = "#C8F135";
        ctx.font = "bold 30px 'Syne', sans-serif";
        ctx.fillText(String(Math.round(pr.volume)), rightX - kgWidth, y + 44);

        // 3. Beban Max Weight (Warna Putih sedikit transparan)
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "500 16px 'DM Sans', sans-serif";
        ctx.fillText(`Max ${pr.maxWeight} kg`, rightX, y + 70);

        // 4. Best Set (Reps) (Warna Abu di paling bawah)
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "500 14px 'DM Sans', sans-serif";
        ctx.fillText(`Best: ${pr.maxWeight}kg × ${pr.reps}`, rightX, y + 92);

        // ==========================================
        // --- TITLE BAWAH ---
        // ==========================================
        ctx.textAlign = "center";
        ctx.fillStyle = "#C8F135";
        ctx.font = "bold 30px 'Syne', sans-serif";
        ctx.fillText("PERSONAL RECORD", W / 2, titleY);

        // ==========================================
        // --- LOGO & TEXT GYMTRACK ---
        // ==========================================
        const logoSize = 44;
        const logoX = W / 2 - logoSize / 2;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "bold 20px 'Syne', sans-serif";
        ctx.fillText("GYMTRACK", W / 2, logoY + logoSize + 26);
      }
    }

    photoTaken.value = true;
    stopCamera();
  };

  document.fonts.ready.then(() => {
    if (logo.complete) {
      draw();
    } else {
      logo.onload = draw;
      logo.onerror = draw;
    }
  });
}

function retake() {
  photoTaken.value = false;
  if (mode.value === "camera") startCamera();
}

function downloadImage() {
  if (!canvasRef.value) return;
  const link = document.createElement("a");
  link.download = `gymtrack-${Date.now()}.jpg`;
  link.href = canvasRef.value.toDataURL("image/jpeg", 0.92);
  link.click();
}

onMounted(() => {
  if (mode.value === "camera") startCamera();
});
onUnmounted(() => stopCamera());
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}
.modal,
.modal * {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.modal {
  background: var(--bg2);
  border-radius: 24px 24px 0 0;
  width: 100%;
  height: 95vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 1px solid var(--border);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
}
.modal-title {
  font-family: "Syne", sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.btn-close {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
}
.btn-download {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-download svg {
  width: 16px;
  height: 16px;
}
.btn-download:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.source-row {
  display: flex;
  gap: 8px;
  padding: 0 20px 10px;
}
.source-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: "DM Sans", sans-serif;
}
.source-btn svg {
  width: 16px;
  height: 16px;
}
.source-btn.active {
  background: var(--accent);
  color: #0f1117;
  border-color: var(--accent);
  font-weight: 700;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 12px;
}
.data-label {
  font-size: 12px;
  color: var(--text3);
  white-space: nowrap;
}
.data-toggle {
  display: flex;
  background: var(--bg3);
  border-radius: 8px;
  padding: 3px;
  gap: 3px;
  border: 1px solid var(--border);
}
.data-btn {
  flex: 1;
  padding: 5px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: "DM Sans", sans-serif;
  white-space: nowrap;
}
.data-btn.active {
  background: var(--accent);
  color: #0f1117;
  font-weight: 700;
}
.data-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.preview-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #000;
  margin: 0 20px;
  border-radius: 16px;
}
.preview-canvas,
.preview-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 16px;
}
.preview-canvas.visible,
.preview-video.visible {
  opacity: 1;
}
.gallery-placeholder {
  position: absolute;
  inset: 0;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text3);
  cursor: pointer;
}
.gallery-placeholder.visible {
  display: flex;
}
.gallery-placeholder svg {
  width: 48px;
  height: 48px;
  opacity: 0.4;
}
.gallery-placeholder span {
  font-size: 14px;
}
.hidden-input {
  display: none;
}

.stats-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 16px;
}

/* Dot selector Overlay Mode */
.overlay-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  pointer-events: all;
  background: rgba(0, 0, 0, 0.45);
  padding: 6px 10px;
  border-radius: 50px;
}
.dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dot.active {
  background: var(--accent);
  color: #0f1117;
  border-color: var(--accent);
}

/* Base overlay */
.ov {
  position: absolute;
  inset: 0;
  border-radius: 16px;
}

/* =========================================
   STYLE 1: ov-bottom-full (DIREVISI UKURAN)
   ========================================= */
.ov-bottom-full {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0.9) 100%
  );
}
.ov-type {
  font-family: "Syne", sans-serif;
  font-size: 14px; /* Huruf diperkecil */
  font-weight: 800;
  color: #c8f135;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.ov-stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.ov-stat {
  display: flex;
  flex-direction: column;
}
.ov-val {
  font-family: "Syne", sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.ov-val.accent {
  color: #c8f135;
}
.ov-lbl {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.08em;
  margin-top: 2px;
}
/* Logo ditaruh kanan bawah */
.ov-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.ov-streak {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}
.ov-brand {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ov-brandtxt {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.1em;
}
.ov-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  object-fit: contain;
}

/* STYLE 2: Center */
.ov-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}
.ov-icon-lg {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  object-fit: contain;
}
.ov-brandtxt-lg {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.15em;
}
.ov-big-num {
  font-family: "Syne", sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #c8f135;
  line-height: 1;
}
.ov-unit {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.6);
}
.ov-big-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.12em;
}

/* STYLE 3: Split */
.ov-split {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0) 35%,
    rgba(0, 0, 0, 0) 65%,
    rgba(0, 0, 0, 0.88) 100%
  );
}
.ov-split-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ov-split-brand {
  display: flex;
  flex-direction: column;
}
.ov-split-bottom {
  text-align: right;
}
.ov-split-vol {
  font-family: "Syne", sans-serif;
  font-size: 52px;
  font-weight: 800;
  color: #c8f135;
  line-height: 1;
}
.ov-split-vollbl {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.1em;
  margin-top: 2px;
}
.ov-split-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

/* STYLE 4: Minimal */
.ov-minimal {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 48px;
}
.ov-minimal-inner {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 14px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(8px);
}
.ov-minimal-streak {
  font-family: "Syne", sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: #c8f135;
}
.ov-minimal-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.1em;
}
.ov-minimal-divider {
  width: 40px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 4px 0;
}
.ov-minimal-type {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.05em;
}
.ov-minimal-brand {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
}
.ov-icon-xs {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  object-fit: contain;
}
.ov-minimal-brand span {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.1em;
}

/* STYLE 5: Hyper */
.ov-hyper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0.9) 100%
  );
}
.ov-hyper-badge {
  align-self: flex-end;
  background: #c8f135;
  border-radius: 12px;
  padding: 3px 10px;
  text-align: right;
}
.ov-hyper-pct {
  font-family: "Syne", sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #0f1117;
  line-height: 1;
}
.ov-hyper-lbl {
  font-size: 9px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: 0.1em;
}
.ov-hyper-bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ov-hyper-type {
  font-family: "Syne", sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
}
.ov-hyper-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
.ov-brand-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.ov-brandtxt-sm {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.08em;
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 20px 24px;
}
.btn-capture {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: transparent;
  border: 3px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-capture:active {
  transform: scale(0.93);
}
.capture-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
}
.btn-retake,
.btn-save {
  flex: 1;
  padding: 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: "DM Sans", sans-serif;
  transition: all 0.15s;
}
.btn-retake {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
}
.btn-save {
  background: var(--accent);
  border: none;
  color: #0f1117;
}
.ov-pr {
  background: linear-gradient(135deg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.ov-pr-header {
  text-align: center;
  margin-bottom: 16px;
}
.ov-pr-title {
  font-family: "Syne", sans-serif;
  font-size: 12px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: 0.1em;
}
.ov-pr-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ov-pr-item {
  background: rgba(18, 18, 18, 0.274);
  border-radius: 12px;
  padding: 8px 12px;
}
.ov-pr-name {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ov-pr-stats {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 6px;
}
.ov-pr-divider {
  opacity: 0.5;
}
.ov-pr-empty {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px;
}
.ov-pr-footer {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.08em;
}
/* Style 5: Single PR */
.ov-pr-single {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.85) 100%
  );
  border-radius: 16px;
}

.ov-pr-single-card {
  background: rgba(30, 31, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  backdrop-filter: blur(4px);
}

.ov-pr-single-left {
  flex: 1;
}

.ov-pr-single-name {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #fff;
  margin-bottom: 8px;
}

.ov-pr-single-muscle {
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #c8f135;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ov-pr-single-right {
  text-align: right;
}

.ov-pr-single-vol {
  font-family: "Syne", sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #c8f135;
  line-height: 1;
  margin-bottom: 4px;
}
.ov-pr-single-vol span {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}

.ov-pr-single-max {
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2px;
}

.ov-pr-single-best {
  font-family: "DM Sans", sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.ov-pr-single-empty {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
}

.ov-pr-single-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ov-pr-single-title {
  font-family: "Syne", sans-serif;
  font-weight: 800;
  font-size: 14px;
  color: #c8f135;
  letter-spacing: 0.05em;
}

.ov-pr-single-logo {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ov-pr-single-logo span {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.1em;
}
.ov-pr-single-logo img {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
}
</style>
