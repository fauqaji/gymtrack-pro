<!-- components/AppNav.vue -->
<template>
  <nav class="nav" @contextmenu.prevent>
    <NuxtLink to="/" class="nav-btn" active-class="active" exact @contextmenu.prevent>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="14" y2="12" />
        <line x1="4" y1="18" x2="9" y2="18" />
      </svg>
      <span>Home</span>
    </NuxtLink>
    <NuxtLink to="/progress" class="nav-btn" active-class="active" @contextmenu.prevent>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
      <span>Progress</span>
    </NuxtLink>

    <!-- Camera Button -->
    <button class="nav-camera" @click="$emit('openCamera')">
      <div class="camera-ring">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
          />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
    </button>

    <NuxtLink to="/history" class="nav-btn" active-class="active" @contextmenu.prevent>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>Riwayat</span>
    </NuxtLink>
    <NuxtLink to="/profile" class="nav-btn" active-class="active" @contextmenu.prevent>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span>Profil</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
defineEmits(["openCamera"]);
</script>

<style scoped>
/* Prevent text selection and context menu on touch */
.nav,
.nav * {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  display: flex;
  padding-bottom: var(--safe-bottom);
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 0;
  font-size: 10px;
  color: var(--text3);
  text-decoration: none;
  transition: color 0.2s;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.nav-btn svg {
  width: 22px;
  height: 22px;
}
.nav-btn.active {
  color: var(--accent);
}

.nav-camera {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  margin-top: -18px;
  font-size: 10px;
  color: var(--text3);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-family: "DM Sans", sans-serif;
}
.camera-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(200, 241, 53, 0.4);
  transition: all 0.2s;
}
.camera-ring svg {
  width: 24px;
  height: 24px;
  stroke: #0f1117;
}
.nav-camera:active .camera-ring {
  transform: scale(0.93);
  box-shadow: 0 2px 8px rgba(200, 241, 53, 0.3);
}
</style>
