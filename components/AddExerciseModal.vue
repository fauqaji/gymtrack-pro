<!-- components/AddExerciseModal.vue -->
<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="sheet">
      <div class="handle"></div>
      <h3>Pilih Latihan</h3>

      <!-- Category filter -->
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
          <span class="er-add">+</span>
        </div>
        <div v-if="filtered.length === 0" class="no-results">
          Tidak ditemukan. Coba kata kunci lain.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkoutStore } from "~/stores/workout";
import { EXERCISES_DB } from "~/composables/useData";

const emit = defineEmits(["close"]);
const store = useWorkoutStore();
const { toast } = useToast();

const search = ref("");
const activeCategory = ref("all");

const categories = [
  { id: "all", label: "Semua" },
  { id: "chest", label: "🦍 Chest" },
  { id: "back", label: "🔙 Back" },
  { id: "shoulders", label: "🏋️ Shoulder" },
  { id: "legs", label: "🦵 Legs" },
  { id: "arms", label: "💪 Arms" },
  { id: "core", label: "🎯 Core" },
];

const filtered = computed(() => {
  let list = EXERCISES_DB;
  if (activeCategory.value !== "all")
    list = list.filter((e) => e.category === activeCategory.value);
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q),
    );
  }
  return list;
});

function add(id: string) {
  const ok = store.addExercise(id);
  if (!ok) toast("Latihan sudah ada di list!", "accent");
  else {
    const ex = EXERCISES_DB.find((e) => e.id === id)!;
    toast(`${ex.name} ditambahkan!`, "success");
    emit("close");
  }
}
</script>

<style scoped>
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
h3 {
  font-family: "Syne", sans-serif;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 14px;
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
.ex-row:hover .er-add {
  color: var(--accent);
}
.no-results {
  text-align: center;
  padding: 24px;
  color: var(--text2);
  font-size: 14px;
}
</style>
