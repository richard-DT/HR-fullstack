<template>
  <div>
    <NavBar v-if="isLoggedIn" @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <div class="d-flex">
      <!-- Sidebar — hidden sa mobile by default -->
      <div
        v-if="isLoggedIn"
        :class="['sidebar-wrapper', { 'sidebar-open': sidebarOpen }]"
      >
        <SideBar @closeSidebar="sidebarOpen = false" />
      </div>

      <!-- Overlay — dark background kapag bukas ang sidebar sa mobile -->
      <div
        v-if="isLoggedIn && sidebarOpen"
        class="sidebar-overlay d-md-none"
        @click="sidebarOpen = false"
      ></div>

      <main class="flex-grow-1 p-3 p-md-4" style="min-width: 0">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import NavBar from '@/components/NavBar.vue'
import SideBar from '@/components/SideBar.vue'

const authStore    = useAuthStore()
const isLoggedIn   = computed(() => authStore.isLoggedIn)
const sidebarOpen  = ref(false)
</script>

<style>
/* Sidebar always visible sa desktop */
.sidebar-wrapper {
  min-width: 220px;
  transition: transform 0.3s ease;
}

/* Mobile — hidden by default, slide in kapag open */
@media (max-width: 767px) {
  .sidebar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1045;
    transform: translateX(-100%);
  }
  .sidebar-wrapper.sidebar-open {
    transform: translateX(0);
  }
}

/* Dark overlay behind sidebar sa mobile */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1044;
}
</style>