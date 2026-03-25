<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="sheet">
      <div class="handle"></div>
      <div class="sheet-header">
        <h3>{{ isCreatingDaily ? "Pilih Gerakan Paket" : "Pilih Latihan" }}</h3>
        <button class="btn-close" @click="$emit('close')" @contextmenu.prevent>✕</button>
      </div>

      <div class="cat-row">
        <button
          v-for="c in categories"
          :key="c.id"
          class="cat-chip"
          :class="{ active: activeCategory === c.id }"
          @click="activeCategory = c.id"
        >
          {{ c.label }}
        </button>
      </div>

      <div
        v-if="activeCategory === 'daily' && !isCreatingDaily"
        class="tab-container"
      >
        <button class="btn-create-daily" @click="toggleCreateDaily">
          + Buat Paket Daily
        </button>

        <div class="ex-list">
          <div
            v-for="tpl in store.customTemplates"
            :key="tpl.id"
            class="ex-row"
          >
            <div style="flex: 1">
              <div class="er-name">{{ tpl.name }}</div>
              <div class="er-muscle">{{ tpl.suggestions.length }} Gerakan</div>
            </div>
            <div class="daily-actions">
              <button
                class="btn-delete-daily"
                @click="store.deleteCustomTemplate(tpl.id)"
              >
                🗑
              </button>
              <button class="btn-start-daily" @click="loadDailyToSession(tpl)">
                Mulai Latihan
              </button>
            </div>
          </div>
          <div v-if="store.customTemplates.length === 0" class="no-results">
            Belum ada paket harian. Klik tanda + di atas.
          </div>
        </div>
      </div>

      <div
        v-else-if="activeCategory === 'daily' && isCreatingDaily"
        class="tab-container"
      >
        <input
          v-model="dailyName"
          class="search-inp"
          placeholder="Hari & Jenis (cth: Senin - Dada & Trisep)"
          type="text"
        />

        <div class="selected-header">
          <span>Gerakan Terpilih ({{ dailyExercises.length }})</span>
          <span class="hint-text">Klik kategori di atas untuk menambah</span>
        </div>

        <div class="ex-list">
          <div v-for="(id, idx) in dailyExercises" :key="idx" class="ex-row">
            <div>
              <div class="er-name">{{ getExName(id) }}</div>
            </div>
            <button
              class="btn-remove-daily"
              @click="dailyExercises.splice(idx, 1)"
            >
              ✕
            </button>
          </div>
          <div v-if="dailyExercises.length === 0" class="no-results" style="margin-top: 160px">
            Pilih kategori (cth: Chest) untuk mulai memasukkan gerakan ke paket
            ini.
            <button class="btn-browse" @click="goToAll">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Lihat Semua Latihan
            </button>
          </div>
        </div>

        <div class="create-actions">
          <button class="btn-cancel" @click="cancelCreateDaily">Batal</button>
          <button
            class="btn-save"
            :disabled="!dailyName || dailyExercises.length === 0"
            @click="saveDaily"
          >
            Simpan Paket
          </button>
        </div>
      </div>

      <div v-else class="tab-container">
        <div v-if="isCreatingDaily" class="create-banner">
          <span
            >Menambah ke paket: <b>{{ dailyName || "Baru" }}</b></span
          >
          <button class="btn-back-daily" @click="activeCategory = 'daily'">
            Selesai Milih
          </button>
        </div>

        <input
          v-model="search"
          class="search-inp"
          placeholder="Cari latihan..."
          type="text"
        />

        <div class="ex-list">
          <div
            v-for="ex in filtered"
            :key="ex.id"
            class="ex-row"
            @click="add(ex.id)"
          >
            <div>
              <div class="er-name">{{ ex.name }}</div>
              <div class="er-muscle">{{ ex.muscle }}</div>
            </div>
            <span
              class="er-add"
              v-if="!isCreatingDaily || !dailyExercises.includes(ex.id)"
              >+</span
            >
            <span class="er-added" v-else>✓</span>
          </div>
          <div v-if="filtered.length === 0" class="no-results">
            Tidak ditemukan. Coba kata kunci lain.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useWorkoutStore } from "~/stores/workout";
import { EXERCISES_DB } from "~/composables/useData";

const emit = defineEmits(["close"]);
const store = useWorkoutStore();
const { toast } = useToast();

const search = ref("");
const activeCategory = ref("all");

// State untuk mode pembuatan Paket Daily
const isCreatingDaily = ref(false);
const dailyName = ref("");
const dailyExercises = ref<string[]>([]);

const categories = [
  { id: "all", label: "Semua" },
  { id: "chest", label: "🦍 Chest" },
  { id: "back", label: "🔙 Back" },
  { id: "shoulders", label: "🏋️ Shoulder" },
  { id: "legs", label: "🦵 Legs" },
  { id: "arms", label: "💪 Arms" },
  { id: "core", label: "🎯 Core" },
  { id: "daily", label: "🗓️ Daily" }, // Kategori Baru ditambahkan di sini
];

const filtered = computed(() => {
  let list = EXERCISES_DB;

  // Filter berdasarkan kategori (menggunakan logika array/string dari kode terbaru Anda)
  if (activeCategory.value !== "all" && activeCategory.value !== "daily") {
    list = list.filter((e) =>
      Array.isArray(e.category)
        ? e.category.includes(activeCategory.value)
        : e.category === activeCategory.value,
    );
  }

  // Filter berdasarkan pencarian
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q),
    );
  }
  return list;
});

// Fungsi untuk langsung ke tab Semua saat klik tombol browse di paket daily
function goToAll() {
  activeCategory.value = 'all'
  nextTick(() => {
    const catRow = document.querySelector('.cat-row')
    catRow?.scrollTo({ left: 0, behavior: 'smooth' })
  })
}

// Helper mendapatkan nama latihan
function getExName(id: string) {
  return EXERCISES_DB.find((e) => e.id === id)?.name || id;
}

// Fungsi kontrol form Daily
function toggleCreateDaily() {
  isCreatingDaily.value = true;
  dailyName.value = "";
  dailyExercises.value = [];
}

function cancelCreateDaily() {
  isCreatingDaily.value = false;
  activeCategory.value = "daily";
}

function saveDaily() {
  if (!dailyName.value || dailyExercises.value.length === 0) return;
  store.saveCustomTemplate(dailyName.value, dailyExercises.value);
  toast(`Paket ${dailyName.value} tersimpan!`, "success");
  isCreatingDaily.value = false;
}

function loadDailyToSession(template: any) {
  store.setSelectedType(template.name);
  // Masukkan semua gerakan ke sesi yang aktif
  template.suggestions.forEach((id: string) => {
    store.addExercise(id);
  });
  toast(`Paket ${template.name} berhasil dimuat!`, "success");
  emit("close"); // Tutup modal otomatis setelah klik Mulai Latihan
}

function add(id: string) {
  if (isCreatingDaily.value) {
    // Mode 1: Jika sedang buat paket, masukkan ID ke dalam array paket sementara
    if (!dailyExercises.value.includes(id)) {
      dailyExercises.value.push(id);
      toast("Latihan masuk ke paket", "success");
    } else {
      toast("Sudah ada di dalam paket!", "accent");
    }
  } else {
    // Mode 2: Jika normal, langsung tambahkan ke list latihan hari ini
    const ok = store.addExercise(id);
    if (!ok) toast("Latihan sudah ada di list!", "accent");
    else {
      const ex = EXERCISES_DB.find((e) => e.id === id)!;
      toast(`${ex.name} ditambahkan!`, "success");
      emit("close");
    }
  }
}
</script>

<style scoped>
/* Prevent text selection and context menu */
.sheet,
.sheet * {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}
.sheet {
  background: var(--bg2);
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 0;
  width: 100%;
  height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border);
}
.handle {
  width: 40px;
  height: 4px;
  background: var(--bg4);
  border-radius: 2px;
  margin: 0 auto 16px;
}
.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
h3 {
  font-family: "Syne", sans-serif;
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}
.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text2);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.btn-close:hover {
  background: var(--red);
  color: white;
  border-color: var(--red);
}
.tab-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.cat-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: 12px;
}
.cat-chip {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  color: var(--text2);
  background: var(--bg3);
  transition: all 0.15s;
  font-family: "DM Sans", sans-serif;
  white-space: nowrap;
}
.cat-chip.active {
  background: var(--accent);
  color: #0f1117;
  border-color: var(--accent);
  font-weight: 700;
}

.search-inp {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 11px 16px;
  color: var(--text);
  font-size: 15px;
  font-family: "DM Sans", sans-serif;
  margin-bottom: 8px;
}
.search-inp:focus {
  outline: none;
  border-color: var(--accent);
}

.ex-list {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-bottom: 40px;
}
.ex-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: opacity 0.15s;
}
.ex-row:hover {
  opacity: 0.8;
}
.er-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}
.er-muscle {
  font-size: 11px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
  margin-top: 2px;
}
.er-add {
  font-size: 22px;
  color: var(--text3);
  transition: color 0.15s;
}
.er-added {
  font-size: 16px;
  color: var(--green);
  font-weight: bold;
}
.ex-row:hover .er-add {
  color: var(--accent);
}
.no-results {
  text-align: center;
  padding: 24px;
  color: var(--text2);
  font-size: 14px;
}

/* Styling Khusus Paket Daily */
.btn-create-daily {
  width: 100%;
  padding: 12px;
  border: 2px dashed var(--border);
  background: transparent;
  color: var(--accent);
  border-radius: 12px;
  font-weight: bold;
  margin-bottom: 16px;
  cursor: pointer;
  font-size: 14px;
}
.btn-start-daily {
  background: var(--accent);
  color: #000;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 13px;
}
.btn-remove-daily {
  background: transparent;
  border: none;
  color: var(--red);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  padding: 4px;
}

/* Banner Saat Memilih Latihan Untuk Paket */
.create-banner {
  background: var(--bg3);
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  border: 1px solid var(--accent);
  color: var(--text);
}
.btn-back-daily {
  background: var(--accent);
  color: #000;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 11px;
  cursor: pointer;
}
.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  font-size: 13px;
  font-weight: bold;
}
.hint-text {
  font-size: 11px;
  color: var(--text3);
  font-weight: normal;
}

/* Tombol Simpan/Batal Paket */
.create-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-bottom: 20px;
}
.btn-cancel {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: var(--bg3);
  color: var(--text);
  border: 1px solid var(--border);
  font-weight: bold;
  cursor: pointer;
}
.btn-save {
  flex: 2;
  padding: 12px;
  border-radius: 12px;
  background: var(--accent);
  color: #000;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.daily-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-delete-daily {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--red);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-delete-daily:hover {
  background: rgba(255, 80, 80, 0.1);
  border-color: var(--red);
}

/* Tombol Browse Saat Paket Daily Kosong */
.btn-browse {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 32px auto 0;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 50px;
  padding: 8px 16px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: "DM Sans", sans-serif;
}
.btn-browse:hover {
  border-color: var(--accent);
  background: rgba(200, 241, 53, 0.07);
}
</style>
