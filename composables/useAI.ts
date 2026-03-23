// composables/useAI.ts
import type { WorkoutExercise, WorkoutSession, UserProfile } from '~/stores/workout'

export function useAI() {
  const config = useRuntimeConfig()

  async function analyzeWorkout(
    exercises: WorkoutExercise[],
    profile: UserProfile,
    hypScore: number,
    typeName: string,
    previousSessions: WorkoutSession[]
  ): Promise<string> {
    const totalVolume = exercises.reduce((a, ex) =>
      a + ex.sets.reduce((b, s) => b + (s.reps || 0) * (s.weight || 0), 0), 0)

    const prevSameType = previousSessions.filter(h => h.typeName === typeName).slice(0, 3)
    const volTrend = prevSameType.length > 0
      ? totalVolume > prevSameType[0].totalVolume ? '📈 meningkat'
        : totalVolume < prevSameType[0].totalVolume ? '📉 menurun' : '= stabil'
      : '🆕 sesi pertama untuk tipe ini'

    const exDetail = exercises.map(ex => {
      const vol = ex.sets.reduce((a, s) => a + (s.reps || 0) * (s.weight || 0), 0)
      const maxW = Math.max(...ex.sets.map(s => s.weight || 0))
      const avgReps = ex.sets.reduce((a, s) => a + (s.reps || 0), 0) / ex.sets.length
      const setsInZone = ex.sets.filter(s => s.reps >= 6 && s.reps <= 12).length
      return `  • ${ex.name}: ${ex.sets.length} set, avg ${avgReps.toFixed(1)} reps, max ${maxW}kg, vol ${vol.toFixed(0)}kg, ${setsInZone}/${ex.sets.length} set di hypertrophy zone`
    }).join('\n')

    const prevContext = prevSameType.length > 0
      ? `Sesi sebelumnya (${prevSameType[0].typeName}): volume ${prevSameType[0].totalVolume.toFixed(0)}kg, hyp score ${prevSameType[0].hypScore}%`
      : 'Belum ada data sesi sebelumnya untuk tipe ini.'

    const prompt = `Kamu adalah AI Coach gym yang expert dalam sport science dan muscle hypertrophy. Analisis sesi workout ini dan berikan feedback dalam Bahasa Indonesia yang jelas, spesifik, dan actionable.

═══ PROFIL ATLET ═══
Nama: ${profile.name}
Goal: ${profile.goal === 'hypertrophy' ? 'Hypertrophy (Pembesaran Otot)' : profile.goal === 'strength' ? 'Strength' : profile.goal === 'endurance' ? 'Endurance' : 'Fat Loss'}
Level: ${profile.level === 'beginner' ? 'Beginner (0-6 bulan)' : profile.level === 'intermediate' ? 'Intermediate (6-24 bulan)' : 'Advanced (2+ tahun)'}
BB: ${profile.weight}kg

═══ SESI WORKOUT ═══
Tipe: ${typeName}
Total Volume: ${totalVolume.toFixed(0)} kg
Total Set: ${exercises.reduce((a, ex) => a + ex.sets.length, 0)}
Hypertrophy Score: ${hypScore}%
Trend volume: ${volTrend}
${prevContext}

Detail latihan:
${exDetail}

═══ INSTRUKSI ═══
Berikan analisis dengan FORMAT PERSIS seperti ini (gunakan emoji, maksimal 250 kata total):

**Performa Sesi**
[1-2 kalimat ringkasan langsung ke poin]

**Hypertrophy Analysis**
[Jelaskan apakah mencapai zona hypertrophy (6-12 reps, 3-5 set per latihan). Score ${hypScore}% berarti apa. Specific]

**Progress**
[Bandingkan dengan sesi sebelumnya. Kalau pertama kali, beri baseline expectation]

**Action Items untuk Sesi Berikutnya**
• [Rekomendasi 1 yang specific dengan angka]
• [Rekomendasi 2 yang specific dengan angka]
• [Rekomendasi 3 yang specific dengan angka]

**Motivasi**
[1 kalimat motivasi yang genuine, bukan klise]`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.public.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 700,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      return data.content?.[0]?.text ?? fallbackAnalysis(hypScore, totalVolume, typeName)
    } catch (e) {
      console.warn('AI API error, using fallback', e)
      return fallbackAnalysis(hypScore, totalVolume, typeName)
    }
  }

  function fallbackAnalysis(hypScore: number, volume: number, typeName: string): string {
    const hypText = hypScore >= 80
      ? '✅ Hypertrophy zone tercapai dengan baik! Rep range 6-12 sudah optimal.'
      : hypScore >= 55
        ? '⚠️ Sebagian set sudah di hypertrophy zone. Coba sesuaikan rep range ke 6-12 untuk hasil lebih optimal.'
        : '❌ Rep range perlu disesuaikan. Target 6-12 reps per set dengan beban yang menantang untuk hypertrophy optimal.'

    return `**Performa Sesi**
Sesi ${typeName} selesai dengan volume total ${volume.toFixed(0)} kg. Data tersimpan dan siap untuk dipantau progressnya.

**Hypertrophy Analysis**
${hypText} Score ${hypScore}% mencerminkan kualitas rep range kamu hari ini.

**Progress**
Terus catat setiap sesi untuk melihat tren progress. Minimal 2-3x sesi data sebelum bisa menarik kesimpulan progress.

**Action Items untuk Sesi Berikutnya**
• Tingkatkan beban 2.5-5% jika semua set terasa mudah
• Target 3-4 set per latihan untuk volume optimal
• Istirahat 60-90 detik antar set untuk hypertrophy

**Motivasi**
Progressive overload adalah kunci — setiap sesi, jadilah sedikit lebih kuat dari kemarin. 💪`
  }

  return { analyzeWorkout }
}
