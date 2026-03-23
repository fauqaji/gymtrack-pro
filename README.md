# 🏋️ GymTrack Pro — Nuxt 3 PWA

Aplikasi gym tracker berbasis Nuxt 3 (Vue 3) yang bisa diinstall di HP Android seperti aplikasi native. **100% gratis, tanpa backend, tanpa biaya server.**

---

## ✨ Fitur

- 📝 **Log Workout** — Input reps & berat per set, 55+ latihan tersedia
- 🤖 **AI Coach** — Analisis otomatis oleh Claude AI setelah setiap sesi
- 📊 **Hypertrophy Score** — Deteksi apakah rep range kamu di zona optimal (6–12 reps)
- 🏆 **Personal Records** — Track PR otomatis setiap sesi
- 📈 **Progress Chart** — Grafik volume mingguan
- 🔔 **Rest Timer** — Timer istirahat antar set
- 💾 **Offline** — Data tersimpan lokal di HP, tidak butuh internet
- 📱 **PWA** — Install di HP Android / iOS seperti app native

---

## 🚀 Setup & Jalankan

### 1. Install Node.js
Download dari https://nodejs.org → pilih versi **LTS (20.x)**

### 2. Clone / Extract project
```bash
# Jika dari ZIP:
unzip gymtrack-pro.zip
cd gymtrack-pro

# Atau jika pakai Git:
git clone https://github.com/USERNAME/gymtrack-pro.git
cd gymtrack-pro
```

### 3. Install dependencies
```bash
npm install
```

### 4. Setup API Key (untuk fitur AI Coach)
Buat file `.env` di root folder project:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

Dapatkan API key gratis di: https://console.anthropic.com
(Free tier: $5 kredit untuk mulai, cukup untuk ratusan analisis)

### 5. Jalankan development server
```bash
npm run dev
```

Buka browser: http://localhost:3000

---

## 📱 Install di HP Android

### Cara 1: Vercel (Gratis — Paling Mudah)

1. **Push ke GitHub:**
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/USERNAME/gymtrack-pro.git
git push -u origin main
```

2. **Deploy ke Vercel:**
   - Buka https://vercel.com → Sign up gratis dengan GitHub
   - Klik "New Project" → Import repo `gymtrack-pro`
   - Di bagian **Environment Variables**, tambahkan:
     - Key: `ANTHROPIC_API_KEY`
     - Value: `sk-ant-xxxxxxxxx` (API key kamu)
   - Klik **Deploy** → tunggu ~2 menit

3. **Install di HP:**
   - Buka URL Vercel di **Chrome Android** (misal: `gymtrack-pro.vercel.app`)
   - Tap menu ⋮ (tiga titik) → **"Add to Home Screen"**
   - Konfirmasi → Icon langsung muncul di homescreen! ✅

### Cara 2: Netlify (Alternatif)

1. Build dulu:
```bash
npm run generate
```

2. Buka https://netlify.com → drag & drop folder `.output/public` ke dashboard

---

## 🌐 Deploy Manual (Build)

```bash
# Build untuk production
npm run generate

# Output ada di folder: .output/public
# Upload folder ini ke hosting manapun (Netlify, GitHub Pages, dll)
```

---

## 📁 Struktur Project

```
gymtrack-pro/
├── assets/
│   └── css/
│       └── main.css          # Global CSS variables & base styles
├── components/
│   ├── AddExerciseModal.vue   # Modal pilih latihan
│   ├── AppNav.vue             # Bottom navigation
│   ├── ExerciseCard.vue       # Card input set per latihan
│   ├── FinishModal.vue        # Summary + AI analysis
│   ├── OnboardScreen.vue      # Layar setup pertama kali
│   └── ToastMessage.vue       # Notifikasi toast
├── composables/
│   ├── useAI.ts               # Anthropic API integration
│   ├── useData.ts             # Database latihan + helper functions
│   └── useToast.ts            # Toast notification state
├── pages/
│   ├── index.vue              # Halaman utama (Log Workout)
│   ├── progress.vue           # Halaman progress & chart
│   ├── history.vue            # Riwayat semua sesi
│   └── profile.vue            # Profil & pengaturan
├── stores/
│   └── workout.ts             # Pinia store (state management + localStorage)
├── public/
│   ├── icon-192.png           # PWA icon (buat sendiri atau pakai placeholder)
│   └── icon-512.png           # PWA icon
├── app.vue                    # Root component
├── nuxt.config.ts             # Konfigurasi Nuxt + PWA
└── package.json
```

---

## 🎨 Kustomisasi

### Tambah Latihan Baru
Edit file `composables/useData.ts`, tambahkan di array `EXERCISES_DB`:
```typescript
{
  id: 'nama_unik',
  name: 'Nama Latihan',
  muscle: 'Grup Otot',
  category: 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core',
  tips: 'Tips teknik latihan ini'
}
```

### Tambah Tipe Workout Baru
Edit array `WORKOUT_TYPES` di file yang sama:
```typescript
{
  id: 'id_unik',
  name: 'Nama Workout',
  emoji: '💪',
  desc: 'Deskripsi singkat',
  suggestions: ['id_ex_1', 'id_ex_2', ...] // ID latihan yang auto-load
}
```

### Ubah Warna Tema
Edit CSS variables di `assets/css/main.css`:
```css
:root {
  --accent: #c8f135;  /* Warna aksen utama */
  --bg: #0f1117;      /* Background gelap */
  /* ... */
}
```

---

## 🧠 Cara Kerja Hypertrophy Score

Score dihitung berdasarkan **rep range per set**:
- ✅ **6–12 reps** = Hypertrophy optimal → nilai 2 poin
- ⚠️ **13–20 reps** = Bisa tetap hipertrofi → nilai 1 poin
- ❌ **< 6 atau > 20 reps** = Di luar zona optimal → nilai 0.3 poin

Formula: `(total poin) / (jumlah set × 2) × 100%`

**Target:** Score ≥ 80% = Hypertrophy Zone tercapai ✅

---

## 🔒 Privacy & Data

- **Semua data tersimpan di localStorage HP kamu** (offline-first)
- API key tersimpan lokal, tidak dikirim ke server lain selain Anthropic
- Tidak ada tracking, tidak ada analytics, tidak ada akun

---

## 🛠 Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| Nuxt 3 | Framework Vue 3 SSR/SPA |
| Pinia | State management |
| VueUse | Utility composables |
| @vite-pwa/nuxt | PWA (install di HP) |
| Chart.js | Grafik progress |
| Anthropic API | AI analysis |
| localStorage | Database (tanpa backend) |

---

## 📞 Troubleshooting

**Q: AI analysis tidak muncul?**
→ Cek API key di halaman Profil atau di file `.env`. Pastikan format `sk-ant-...`

**Q: Tidak bisa install di HP?**
→ Pastikan akses lewat HTTPS (Vercel/Netlify sudah otomatis). Localhost tidak bisa di-install sebagai PWA.

**Q: Data hilang setelah clear browser?**
→ Gunakan fitur Export Data di halaman Profil sebelum clear browser.

**Q: `npm install` error?**
→ Pastikan Node.js versi 18+ sudah terinstall. Cek dengan: `node --version`
