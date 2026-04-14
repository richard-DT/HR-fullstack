<template>
  <div class="d-flex flex-column bg-dark text-white h-100" style="min-width: 220px; min-height: 100vh">
    <div class="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
      <small class="text-secondary text-uppercase fw-bold">Menu</small>
      <!-- Close button — mobile only -->
      <button class="btn btn-sm btn-outline-secondary d-md-none" @click="emit('closeSidebar')">✕</button>
    </div>

    <nav class="flex-grow-1 p-2">
      <RouterLink
        to="/dashboard"
        class="sidebar-link"
        :class="{ active: route.path === '/dashboard' }"
        @click="emit('closeSidebar')"
      >
        📊 Dashboard
      </RouterLink>

      <template v-if="authStore.isAdmin">
        <RouterLink
          to="/employees"
          class="sidebar-link"
          :class="{ active: route.path === '/employees' }"
          @click="emit('closeSidebar')"
        >
          👥 Employees
        </RouterLink>
      </template>

      <template v-if="!authStore.isAdmin && authStore.user?.employee">
        <RouterLink
          :to="`/attendance/${authStore.user.employee._id}`"
          class="sidebar-link"
          :class="{ active: route.path.includes('/attendance') }"
          @click="emit('closeSidebar')"
        >
          📋 My Payslips
        </RouterLink>

        <RouterLink
          :to="`/loans/${authStore.user.employee._id}`"
          class="sidebar-link"
          :class="{ active: route.path.includes('/loans') }"
          @click="emit('closeSidebar')"
        >
          💰 My Loans
        </RouterLink>

        <RouterLink
          to="/employees"
          class="sidebar-link"
          :class="{ active: route.path === '/employees' }"
          @click="emit('closeSidebar')"
        >
          👥 Employees
        </RouterLink>
        
      </template>
    </nav>

    <!-- User info sa mobile -->
    <div class="p-3 border-top border-secondary d-md-none">
      <p class="text-white mb-0 small">{{ authStore.user?.name }}</p>
      <span class="badge bg-secondary">{{ authStore.user?.role }}</span>
    </div>

    <div class="p-3 border-top border-secondary d-none d-md-block">
      <small class="text-secondary">v1.0.0</small>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore.js'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const route     = useRoute()
const emit      = defineEmits(['closeSidebar'])
</script>

<style scoped>
.sidebar-link {
  display: block;
  padding: 10px 14px;
  color: #adb5bd;
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: all 0.2s;
}
.sidebar-link:hover,
.sidebar-link.active {
  background-color: #343a40;
  color: #ffffff;
}
</style>