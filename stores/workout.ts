// stores/workout.ts
import { defineStore } from "pinia";
import { calcHypertrophyScore, EXERCISES_DB } from "~/composables/useData";

export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscle: string;
  category: string | string[];
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: number;
  date: string;
  day: string;
  typeId: string;
  typeName: string;
  exercises: WorkoutExercise[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  hypScore: number;
  aiAnalysis: string;
  durationMinutes?: number;
}

export interface PersonalRecord {
  exId: string;
  name: string;
  muscle: string;
  volume: number;
  maxWeight: number;
  bestSet: { reps: number; weight: number };
  date: string;
}

export interface UserProfile {
  name: string;
  weight: number;
  goal: "hypertrophy" | "strength" | "endurance" | "fat_loss";
  level: "beginner" | "intermediate" | "advanced";
  joinDate: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  suggestions: string[];
  createdAt: string;
}

function getLocalDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(JSON.stringify(JSON.parse(raw))) as T;
  } catch {
    return fallback;
  }
}

function saveLS(key: string, val: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export const useWorkoutStore = defineStore("workout", {
  state: () => ({
    profile: null as UserProfile | null,
    history: [] as WorkoutSession[],
    personalRecords: {} as Record<string, PersonalRecord>,
    currentExercises: [] as WorkoutExercise[],
    selectedDay: 1 as number, // 1=Senin ... 7=Minggu
    selectedTypeId: "" as string,
    lastAiAnalysis: "" as string,
    sessionStartTime: null as number | null,
    customTemplates: [] as CustomTemplate[],
  }),

  getters: {
    isOnboarded: (s) => s.profile !== null,

    totalSessions: (s) => s.history.length,

    totalVolumeKg: (s) => s.history.reduce((a, h) => a + h.totalVolume, 0),

    streakDays(): number {
      if (this.history.length === 0) return 0;

      // Ambil semua tanggal latihan unik dalam format lokal
      const dates = [
        ...new Set(
          this.history.map((h) => {
            const d = new Date(h.date);
            return getLocalDateStr(d);
          }),
        ),
      ]
        .sort()
        .reverse(); // urut dari terbaru ke terlama

      if (dates.length === 0) return 0;

      let streak = 1; // minimal 1 jika ada latihan
      let prevDate = new Date(dates[0]);

      for (let i = 1; i < dates.length; i++) {
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays <= 7) {
          streak++; // masih dalam rentang toleransi
          prevDate = currDate;
        } else {
          break; // jeda lebih dari 7 hari, streak terputus
        }
      }

      return streak;
    },

    sessionsThisWeek(): number {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return this.history.filter((h) => new Date(h.date) > weekAgo).length;
    },

    currentTotalVolume(): number {
      return this.currentExercises.reduce(
        (a, ex) =>
          a + ex.sets.reduce((b, s) => b + (s.reps || 0) * (s.weight || 0), 0),
        0,
      );
    },

    prList(): PersonalRecord[] {
      return Object.values(this.personalRecords).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    },

    weeklyVolumeData(): { label: string; volume: number }[] {
      const result = [];
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        const vol = this.history
          .filter((h) => h.date.startsWith(ds))
          .reduce((a, h) => a + h.totalVolume, 0);
        result.push({ label: days[d.getDay()], volume: Math.round(vol) });
      }
      return result;
    },

    muscleHypScores(): { muscle: string; score: number }[] {
      const data: Record<string, { total: number; inZone: number }> = {};
      this.history.slice(0, 15).forEach((h) => {
        h.exercises.forEach((ex) => {
          if (!data[ex.muscle]) data[ex.muscle] = { total: 0, inZone: 0 };
          ex.sets.forEach((s) => {
            data[ex.muscle].total++;
            if (s.reps >= 6 && s.reps <= 12) data[ex.muscle].inZone++;
          });
        });
      });
      return Object.entries(data)
        .map(([muscle, d]) => ({
          muscle,
          score: Math.round((d.inZone / d.total) * 100),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    },
  },

  actions: {
    init() {
      this.profile = loadLS<UserProfile | null>("gym_profile", null);
      this.history = loadLS<WorkoutSession[]>("gym_history", []);
      this.personalRecords = loadLS<Record<string, PersonalRecord>>(
        "gym_prs",
        {},
      );
      this.currentExercises = loadLS<WorkoutExercise[]>("gym_current", []);
      this.lastAiAnalysis = loadLS<string>("gym_last_ai", "");
      this.customTemplates = loadLS<CustomTemplate[]>(
        "gym_custom_templates",
        [],
      );
      // Set today's day
      const day = new Date().getDay();
      this.selectedDay = day === 0 ? 7 : day;
    },

    saveCustomTemplate(name: string, suggestions: string[]) {
      const newTemplate: CustomTemplate = {
        id: "custom_" + Date.now(),
        name,
        suggestions,
        createdAt: new Date().toISOString(),
      };
      this.customTemplates.push(newTemplate);
      saveLS("gym_custom_templates", this.customTemplates);
    },

    deleteCustomTemplate(id: string) {
      this.customTemplates = this.customTemplates.filter((t) => t.id !== id);
      saveLS("gym_custom_templates", this.customTemplates);
    },

    saveProfile(p: UserProfile) {
      this.profile = p;
      saveLS("gym_profile", p);
    },

    setSelectedDay(d: number) {
      this.selectedDay = d;
    },

    setSelectedType(id: string) {
      this.selectedTypeId = id;
    },

    autoLoadExercises(suggestions: string[]) {
      if (this.currentExercises.length > 0) return;
      this.currentExercises = suggestions
        .map((id) => {
          const ex = EXERCISES_DB.find((e) => e.id === id);
          if (!ex) return null;
          return {
            id: ex.id,
            name: ex.name,
            muscle: ex.muscle,
            category: ex.category,
            sets: [
              { reps: 10, weight: 20 },
              { reps: 10, weight: 20 },
              { reps: 8, weight: 22.5 },
            ],
          };
        })
        .filter(Boolean) as WorkoutExercise[];
      this.saveCurrentExercises();
    },

    addExercise(exId: string | string[]) {
      const id = Array.isArray(exId) ? exId[0] : exId;
      if (!id) return false;
      const ex = EXERCISES_DB.find((e) => e.id === id);
      if (!ex || this.currentExercises.some((e) => e.id === id)) return false;
      this.currentExercises.push({
        id: ex.id,
        name: ex.name,
        muscle: ex.muscle,
        category: ex.category,
        sets: [
          { reps: 10, weight: 20 },
          { reps: 10, weight: 20 },
          { reps: 8, weight: 22.5 },
        ],
      });
      this.saveCurrentExercises();
      return true;
    },

    removeExercise(idx: number) {
      this.currentExercises.splice(idx, 1);
      this.saveCurrentExercises();
    },

    updateSet(
      exIdx: number,
      setIdx: number,
      field: "reps" | "weight",
      val: number,
    ) {
      this.currentExercises[exIdx].sets[setIdx][field] = val;
      this.saveCurrentExercises();
    },

    addSet(exIdx: number) {
      const last = this.currentExercises[exIdx].sets.slice(-1)[0] ?? {
        reps: 10,
        weight: 20,
      };
      this.currentExercises[exIdx].sets.push({ ...last });
      this.saveCurrentExercises();
    },

    removeSet(exIdx: number, setIdx: number) {
      if (this.currentExercises[exIdx].sets.length <= 1) return;
      this.currentExercises[exIdx].sets.splice(setIdx, 1);
      this.saveCurrentExercises();
    },

    clearExercises() {
      this.currentExercises = [];
      this.saveCurrentExercises();
    },

    saveCurrentExercises() {
      saveLS("gym_current", this.currentExercises);
    },

    startSession() {
      this.sessionStartTime = Date.now();
    },

    finishWorkout(
      dayName: string,
      typeName: string,
      aiText: string,
    ): WorkoutSession {
      const exercises = JSON.parse(
        JSON.stringify(this.currentExercises),
      ) as WorkoutExercise[];
      const totalVolume = exercises.reduce(
        (a, ex) => a + ex.sets.reduce((b, s) => b + s.reps * s.weight, 0),
        0,
      );
      const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0);
      const totalReps = exercises.reduce(
        (a, ex) => a + ex.sets.reduce((b, s) => b + s.reps, 0),
        0,
      );
      const hypScore = calcHypertrophyScore(exercises);
      const duration = this.sessionStartTime
        ? Math.round((Date.now() - this.sessionStartTime) / 60000)
        : undefined;

      // 👇 BLOK KODE BARU: Mencegat dan mencari nama paket custom 👇
      let finalTypeName = typeName;
      if (finalTypeName === "Custom Workout" || !finalTypeName) {
        const customTpl = this.customTemplates.find(
          (t) => t.id === this.selectedTypeId || t.name === this.selectedTypeId,
        );
        if (customTpl) {
          finalTypeName = customTpl.name; // Ambil dari daftar template
        } else if (this.selectedTypeId) {
          finalTypeName = this.selectedTypeId; // Ambil langsung jika isinya string nama
        } else {
          finalTypeName = "Workout"; // Fallback jika tidak ada nama yang valid
        }
      }
      // 👆 SELESAI BLOK KODE BARU 👆

      const session: WorkoutSession = {
        id: Date.now(),
        date: new Date().toISOString(),
        day: dayName,
        typeId: this.selectedTypeId,
        typeName: finalTypeName, // <-- Menggunakan nama yang sudah diperbaiki
        exercises,
        totalVolume,
        totalSets,
        totalReps,
        hypScore,
        aiAnalysis: aiText,
        durationMinutes: duration,
      };

      this.history.unshift(session);
      saveLS("gym_history", this.history);
      this.updatePRs(session);

      this.lastAiAnalysis = aiText;
      saveLS("gym_last_ai", aiText);

      // Reset current
      this.currentExercises = [];
      this.saveCurrentExercises();
      this.selectedTypeId = "";
      this.sessionStartTime = null;

      return session;
    },

    updatePRs(session: WorkoutSession) {
      for (const ex of session.exercises) {
        const vol = ex.sets.reduce((a, s) => a + s.reps * s.weight, 0);
        const maxWeight = Math.max(...ex.sets.map((s) => s.weight));
        const bestSet = ex.sets.reduce(
          (best, s) => (s.weight > best.weight ? s : best),
          ex.sets[0],
        );
        const existing = this.personalRecords[ex.id];
        if (!existing || vol > existing.volume) {
          this.personalRecords[ex.id] = {
            exId: ex.id,
            name: ex.name,
            muscle: ex.muscle,
            volume: vol,
            maxWeight,
            bestSet: { ...bestSet },
            date: session.date,
          };
        }
      }
      saveLS("gym_prs", this.personalRecords);
    },

    getPR(exId: string): PersonalRecord | null {
      return this.personalRecords[exId] ?? null;
    },

    deleteSession(id: number) {
      this.history = this.history.filter((h) => h.id !== id);
      saveLS("gym_history", this.history);
    },

    exportData(): string {
      return JSON.stringify(
        {
          profile: this.profile,
          history: this.history,
          personalRecords: this.personalRecords,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      );
    },

    importData(raw: string): boolean {
      try {
        const data = JSON.parse(raw);
        if (data.profile) {
          this.profile = data.profile;
          saveLS("gym_profile", data.profile);
        }
        if (data.history) {
          this.history = data.history;
          saveLS("gym_history", data.history);
        }
        if (data.personalRecords) {
          this.personalRecords = data.personalRecords;
          saveLS("gym_prs", data.personalRecords);
        }
        return true;
      } catch {
        return false;
      }
    },

    resetAll() {
      if (typeof window !== "undefined") localStorage.clear();
      this.profile = null;
      this.history = [];
      this.personalRecords = {};
      this.currentExercises = [];
      this.lastAiAnalysis = "";
    },
  },
});
