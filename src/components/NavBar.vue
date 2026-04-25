<template>
  <nav class="navbar navbar-dark bg-dark px-3 d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3">
      <!-- Hamburger — mobile only -->
      <button
        class="btn btn-outline-light btn-sm d-md-none"
        @click="emit('toggleSidebar')"
      >
        ☰
      </button>
      <!-- <span class="navbar-brand fw-bold mb-0">🍜 Bozzvics HR</span> -->
      <span class="navbar-brand fw-bold mb-0">{{ authStore.appName }}</span>
    </div>
    <div class="d-flex align-items-center gap-2">
      <span class="text-white-50 small d-none d-md-inline">
        {{ authStore.user?.name }}
        <span class="badge bg-secondary ms-1">{{ authStore.user?.role }}</span>
      </span>
      <button class="btn btn-outline-light btn-sm" @click="handleLogout">
        Logout
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore.js'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router    = useRouter()
const emit      = defineEmits(['toggleSidebar'])

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>