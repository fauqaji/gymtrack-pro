// composables/useData.ts
export const EXERCISES_DB = [
  // CHEST
  { id: 'bench_flat', name: 'Bench Press (Flat)', muscle: 'Chest', category: 'chest', tips: 'Tekuk siku 45°, sentuh dada perlahan. Kaki datar di lantai.' },
  { id: 'bench_incline', name: 'Incline Bench Press', muscle: 'Upper Chest', category: 'chest', tips: 'Sudut bangku 30-45°. Fokus squeeze upper chest di atas.' },
  { id: 'bench_decline', name: 'Decline Bench Press', muscle: 'Lower Chest', category: 'chest', tips: 'Bagus untuk lower chest definition. Hati-hati posisi kepala.' },
  { id: 'dumbbell_fly', name: 'Dumbbell Fly', muscle: 'Chest', category: 'chest', tips: 'Jaga slight bend di siku sepanjang gerakan.' },
  { id: 'cable_fly', name: 'Cable Fly', muscle: 'Chest', category: 'chest', tips: 'Bagus untuk peak contraction. Cross arm di tengah.' },
  { id: 'pushup', name: 'Push Up', muscle: 'Chest', category: 'chest', tips: 'Variasi: wide grip untuk chest, narrow untuk tricep.' },
  { id: 'chest_dip', name: 'Chest Dip', muscle: 'Lower Chest', category: 'chest', tips: 'Condong ke depan ~30° untuk chest focus.' },
  { id: 'pec_dec', name: 'Pec Dec Machine', muscle: 'Chest', category: 'chest', tips: 'Isolated chest, bagus untuk pump finisher.' },

  // BACK
  { id: 'deadlift', name: 'Deadlift', muscle: 'Back/Posterior Chain', category: 'back', tips: 'Jaga punggung netral. Dorong kaki ke lantai, bukan pull dengan punggung.' },
  { id: 'pullup', name: 'Pull Up', muscle: 'Lats', category: 'back', tips: 'Full ROM, jangan kipping. Dead hang di bawah.' },
  { id: 'chinup', name: 'Chin Up', muscle: 'Lats/Biceps', category: 'back', tips: 'Supinated grip. Lebih mudah dari pull up, activate biceps lebih.' },
  { id: 'barbell_row', name: 'Barbell Row', muscle: 'Mid Back', category: 'back', tips: 'Pull ke lower abs, bukan ke dada. Retract scapula.' },
  { id: 'dumbbell_row', name: 'Dumbbell Row', muscle: 'Lats', category: 'back', tips: 'One arm, brace core. Pull siku ke belakang pinggul.' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', muscle: 'Lats', category: 'back', tips: 'Pull ke dada depan, jangan ke belakang kepala.' },
  { id: 'cable_row', name: 'Seated Cable Row', muscle: 'Mid Back', category: 'back', tips: 'Retract scapula di puncak. Jangan hanya pakai lengan.' },
  { id: 'face_pull', name: 'Face Pull', muscle: 'Rear Delt/Traps', category: 'back', tips: 'Pull ke wajah, siku tinggi sejajar atau di atas bahu.' },
  { id: 'tbar_row', name: 'T-Bar Row', muscle: 'Mid Back', category: 'back', tips: 'Chest supported lebih aman untuk punggung bawah.' },

  // SHOULDERS
  { id: 'ohp', name: 'Overhead Press (Barbell)', muscle: 'Shoulders', category: 'shoulders', tips: 'Tekan tepat di atas kepala. Bracing core sangat penting.' },
  { id: 'db_ohp', name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', category: 'shoulders', tips: 'Range of motion lebih luas dari barbell. Bisa seated/standing.' },
  { id: 'arnold_press', name: 'Arnold Press', muscle: 'Shoulders', category: 'shoulders', tips: 'Rotasi palm dari depan ke samping saat press ke atas.' },
  { id: 'lateral_raise', name: 'Lateral Raise', muscle: 'Side Delt', category: 'shoulders', tips: 'Angkat sampai sejajar bahu, jangan swing. Bisa cable untuk constant tension.' },
  { id: 'front_raise', name: 'Front Raise', muscle: 'Front Delt', category: 'shoulders', tips: 'Front delt biasanya sudah terlatih dari pressing. Jangan berlebihan.' },
  { id: 'rear_delt_fly', name: 'Rear Delt Fly', muscle: 'Rear Delt', category: 'shoulders', tips: 'Condong ke depan, angkat ke samping. Siku slightly bent.' },
  { id: 'shrug', name: 'Barbell/DB Shrug', muscle: 'Traps', category: 'shoulders', tips: 'Angkat bahu ke telinga, hold 1 detik di atas. No rolling.' },

  // LEGS
  { id: 'squat', name: 'Back Squat', muscle: 'Quads/Glutes', category: 'legs', tips: 'Turun parallel atau lebih dalam (ATG). Knee track di atas jari kaki.' },
  { id: 'front_squat', name: 'Front Squat', muscle: 'Quads', category: 'legs', tips: 'Lebih berat di quads. Butuh mobilitas wrist dan ankle.' },
  { id: 'goblet_squat', name: 'Goblet Squat', muscle: 'Quads/Glutes', category: 'legs', tips: 'Bagus untuk belajar squat pattern. Dumbbell/kettlebell di depan dada.' },
  { id: 'leg_press', name: 'Leg Press', muscle: 'Quads/Glutes', category: 'legs', tips: 'Jangan fully lock out di atas. Posisi kaki tentukan focus otot.' },
  { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstrings/Glutes', category: 'legs', tips: 'Hinge dari pinggul, jaga punggung flat. Feel stretch di hamstring.' },
  { id: 'leg_curl', name: 'Leg Curl', muscle: 'Hamstrings', category: 'legs', tips: 'Controlled eccentric (turun pelan) sangat penting untuk hypertrophy.' },
  { id: 'leg_extension', name: 'Leg Extension', muscle: 'Quads', category: 'legs', tips: 'Isolated quad. Bagus sebagai finisher setelah compound.' },
  { id: 'lunge', name: 'Lunge', muscle: 'Quads/Glutes', category: 'legs', tips: 'Bisa walking, reverse, atau Bulgarian Split Squat untuk intensitas lebih.' },
  { id: 'bulgarian', name: 'Bulgarian Split Squat', muscle: 'Quads/Glutes', category: 'legs', tips: 'Unilateral. Sangat efektif untuk hypertrophy, expose imbalance.' },
  { id: 'calf_raise', name: 'Calf Raise', muscle: 'Calves', category: 'legs', tips: 'Full ROM penting: heel turun penuh. Calves butuh volume tinggi.' },
  { id: 'hip_thrust', name: 'Hip Thrust', muscle: 'Glutes', category: 'legs', tips: 'Squeeze glutes di puncak, hold 1 detik. Bisa barbell atau single leg.' },
  { id: 'sumo_deadlift', name: 'Sumo Deadlift', muscle: 'Glutes/Hamstrings', category: 'legs', tips: 'Stance lebar, lebih activate glute daripada conventional.' },

  // ARMS
  { id: 'barbell_curl', name: 'Barbell Curl', muscle: 'Biceps', category: 'arms', tips: 'Jangan swing badan. Kontrol eccentric.' },
  { id: 'db_curl', name: 'Dumbbell Curl', muscle: 'Biceps', category: 'arms', tips: 'Bisa alternate atau bersamaan. Supinate di atas.' },
  { id: 'hammer_curl', name: 'Hammer Curl', muscle: 'Biceps/Brachialis', category: 'arms', tips: 'Grip netral. Bagus untuk tebal lengan dan peak bicep.' },
  { id: 'preacher_curl', name: 'Preacher Curl', muscle: 'Biceps', category: 'arms', tips: 'Isolasi biceps sangat baik. EZ bar lebih nyaman di wrist.' },
  { id: 'incline_curl', name: 'Incline Dumbbell Curl', muscle: 'Biceps', category: 'arms', tips: 'Stretch bicep di bawah. Sangat bagus untuk panjang otot.' },
  { id: 'cable_curl', name: 'Cable Curl', muscle: 'Biceps', category: 'arms', tips: 'Constant tension. Bisa high cable untuk peak contraction.' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', muscle: 'Triceps', category: 'arms', tips: 'Cable, siku tetap di samping badan. Bisa rope atau bar.' },
  { id: 'skull_crusher', name: 'Skull Crusher', muscle: 'Triceps', category: 'arms', tips: 'EZ bar ke dahi. Jaga siku pointing ke langit-langit.' },
  { id: 'overhead_tri', name: 'Overhead Tricep Extension', muscle: 'Triceps', category: 'arms', tips: 'Stretch long head lebih baik. Bisa cable, DB, atau EZ bar.' },
  { id: 'close_grip', name: 'Close Grip Bench Press', muscle: 'Triceps', category: 'arms', tips: 'Grip selebar bahu. Compound movement untuk tricep.' },
  { id: 'dips_tricep', name: 'Tricep Dips', muscle: 'Triceps', category: 'arms', tips: 'Badan tegak (jangan condong ke depan). Siku close ke badan.' },

  // CORE
  { id: 'plank', name: 'Plank', muscle: 'Core', category: 'core', tips: 'Tubuh lurus seperti papan. Breathing normal, jangan tahan napas.' },
  { id: 'crunch', name: 'Crunch', muscle: 'Abs', category: 'core', tips: 'Compress abs, jangan pull leher. Fokus pada kontraksi.' },
  { id: 'leg_raise', name: 'Hanging Leg Raise', muscle: 'Lower Abs', category: 'core', tips: 'Kontrol eccentric (turun pelan). Jangan swing.' },
  { id: 'ab_wheel', name: 'Ab Wheel Rollout', muscle: 'Core', category: 'core', tips: 'Sangat efektif untuk core strength. Mulai dari lutut jika baru.' },
  { id: 'russian_twist', name: 'Russian Twist', muscle: 'Obliques', category: 'core', tips: 'Bisa tambah beban untuk progressive overload.' },
  { id: 'cable_crunch', name: 'Cable Crunch', muscle: 'Abs', category: 'core', tips: 'Bisa progressive overload dengan beban. Hips tetap di tempatnya.' },
  { id: 'dead_bug', name: 'Dead Bug', muscle: 'Core', category: 'core', tips: 'Punggung bawah tetap menempel lantai. Gerak kontralateral.' },
  { id: 'pallof_press', name: 'Pallof Press', muscle: 'Core/Anti-rotation', category: 'core', tips: 'Anti-rotation exercise. Sangat fungsional untuk core stability.' },
]

export const WORKOUT_TYPES = [
  { id: 'chest', name: 'Chest Day', emoji: '💪', desc: 'Dada & Trisep', suggestions: ['bench_flat', 'bench_incline', 'cable_fly', 'dumbbell_fly', 'tricep_pushdown', 'skull_crusher'] },
  { id: 'back', name: 'Back Day', emoji: '🔙', desc: 'Punggung & Bisep', suggestions: ['deadlift', 'pullup', 'barbell_row', 'lat_pulldown', 'cable_row', 'face_pull', 'barbell_curl'] },
  { id: 'shoulders', name: 'Shoulder Day', emoji: '🏋️', desc: 'Bahu & Trapezius', suggestions: ['ohp', 'db_ohp', 'lateral_raise', 'rear_delt_fly', 'face_pull', 'shrug'] },
  { id: 'legs', name: 'Leg Day', emoji: '🦵', desc: 'Quads, Hamstring, Glutes', suggestions: ['squat', 'rdl', 'leg_press', 'leg_curl', 'leg_extension', 'calf_raise', 'hip_thrust'] },
  { id: 'arms', name: 'Arms Day', emoji: '💪', desc: 'Bisep & Trisep', suggestions: ['barbell_curl', 'db_curl', 'hammer_curl', 'incline_curl', 'tricep_pushdown', 'skull_crusher', 'overhead_tri'] },
  { id: 'push', name: 'Push Day', emoji: '⬆️', desc: 'Chest + Shoulder + Tri', suggestions: ['bench_flat', 'bench_incline', 'ohp', 'lateral_raise', 'tricep_pushdown', 'skull_crusher'] },
  { id: 'pull', name: 'Pull Day', emoji: '⬇️', desc: 'Back + Bicep', suggestions: ['pullup', 'barbell_row', 'lat_pulldown', 'cable_row', 'face_pull', 'barbell_curl', 'hammer_curl'] },
  { id: 'legs_ppl', name: 'Legs (PPL)', emoji: '🦵', desc: 'Leg Day untuk PPL', suggestions: ['squat', 'rdl', 'leg_press', 'leg_curl', 'bulgarian', 'calf_raise'] },
  { id: 'upper', name: 'Upper Body', emoji: '🔝', desc: 'Chest + Back + Shoulders', suggestions: ['bench_flat', 'barbell_row', 'ohp', 'pullup', 'lateral_raise', 'face_pull'] },
  { id: 'lower', name: 'Lower Body', emoji: '🔽', desc: 'Legs + Core', suggestions: ['squat', 'rdl', 'leg_press', 'hip_thrust', 'calf_raise', 'plank', 'cable_crunch'] },
  { id: 'full', name: 'Full Body', emoji: '⚡', desc: 'Semua Grup Otot', suggestions: ['squat', 'bench_flat', 'barbell_row', 'ohp', 'rdl', 'barbell_curl'] },
  { id: 'core', name: 'Core Day', emoji: '🎯', desc: 'Abs & Core Stability', suggestions: ['plank', 'cable_crunch', 'leg_raise', 'ab_wheel', 'russian_twist', 'dead_bug', 'pallof_press'] },
]

export const DAYS_ID = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
export const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return `${DAYS_ID[d.getDay() === 0 ? 6 : d.getDay() - 1]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateShort(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()].substring(0, 3)}`
}

// Hypertrophy: 6-12 reps = optimal, 13-20 = ok, outside = poor
export function calcHypertrophyScore(exercises: any[]): number {
  let score = 0
  let total = 0
  for (const ex of exercises) {
    for (const s of ex.sets) {
      const reps = parseInt(s.reps) || 0
      const weight = parseFloat(s.weight) || 0
      if (reps <= 0) continue
      total++
      if (reps >= 6 && reps <= 12) score += 2      // Optimal hypertrophy
      else if (reps >= 13 && reps <= 20) score += 1  // Acceptable
      else score += 0.3                              // Outside zone
      if (weight === 0 && reps > 0) score -= 0.2    // Bodyweight is ok but less ideal
    }
  }
  return total > 0 ? Math.min(100, Math.round((score / (total * 2)) * 100)) : 0
}

export function getHypLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: 'Hypertrophy Zone', color: 'var(--green)', emoji: '✅' }
  if (score >= 55) return { label: 'Partial Hypertrophy', color: 'var(--orange)', emoji: '⚠️' }
  return { label: 'Di bawah zona', color: 'var(--red)', emoji: '❌' }
}
