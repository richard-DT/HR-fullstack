<template>
  <div>
    <NavBar v-if="isLoggedIn" />
    <div class="d-flex">
      <SideBar v-if="isLoggedIn" />
      <main class="flex-grow-1 p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import NavBar from '@/components/NavBar.vue'
import SideBar from '@/components/SideBar.vue'

const authStore  = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
</script>