<template>
  <div class="d-flex flex-column bg-dark text-white h-100" style="min-width: 220px; min-height: 100vh">
    <div class="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
      <small class="text-secondary text-uppercase fw-bold">Menu</small>
      <button class="btn btn-sm btn-outline-secondary d-md-none" @click="emit('closeSidebar')">✕</button>
    </div>

    <nav class="flex-grow-1 p-2">
      <!-- Main links -->
      <RouterLink
        to="/dashboard"
        class="sidebar-link"
        :class="{ active: route.path === '/dashboard' && !employeeStore.summary }"
        @click="handleDashboard"
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

        <!-- Employee list -->
        <div class="mt-2 mb-1 px-2">
          <small class="text-secondary text-uppercase" style="font-size: 0.7rem">My Employees</small>
        </div>

        <div v-if="employeeStore.loading" class="text-center py-2">
          <div class="spinner-border spinner-border-sm text-secondary"></div>
        </div>

        <button
          v-for="emp in employeeStore.employees"
          :key="emp._id"
          class="sidebar-link text-start w-100 border-0 bg-transparent"
          :class="{ active: employeeStore.summary?._id === emp._id }"
          @click="selectEmployee(emp)"
        >
          👤 {{ emp.name }}
        </button>
      </template>

      <!-- Employee only links -->
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
          :to="`/ytd/${authStore.user.employee._id}/${currentYear}`"
          class="sidebar-link"
          :class="{ active: route.path.includes('/ytd') }"
          @click="emit('closeSidebar')"
        >
          📅 My Attendance
        </RouterLink>

        <RouterLink
          :to="`/13thmonth/${authStore.user.employee._id}/${currentYear}`"
          class="sidebar-link"
          :class="{ active: route.path.includes('/13thmonth') }"
          @click="emit('closeSidebar')"
        >
          🎄 13th Month
        </RouterLink>

        <RouterLink
          :to="`/loans/${authStore.user.employee._id}`"
          class="sidebar-link"
          :class="{ active: route.path.includes('/loans') }"
          @click="emit('closeSidebar')"
        >
          💰 My Loans
        </RouterLink>
      </template>
    </nav>

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
import { useEmployeeStore } from '@/stores/employeeStore.js'
import { useRoute, useRouter } from 'vue-router'

const authStore     = useAuthStore()
const employeeStore = useEmployeeStore()
const route         = useRoute()
const router        = useRouter()
const currentYear   = new Date().getFullYear()
const emit          = defineEmits(['closeSidebar'])

const selectEmployee = async (emp) => {
  await employeeStore.fetchSummary(emp._id)
  emit('closeSidebar')
  // Make sure we're on dashboard
  if (route.path !== '/dashboard') router.push('/dashboard')
}

const handleDashboard = () => {
  employeeStore.summary = null  // clear selected employee
  emit('closeSidebar')
}
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
  cursor: pointer;
}
.sidebar-link:hover,
.sidebar-link.active {
  background-color: #343a40;
  color: #ffffff;
}
</style>