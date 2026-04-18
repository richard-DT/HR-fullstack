<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow" style="width: 400px">

      <!-- Header -->
      <div
        class="card-header text-white text-center py-4"
        :class="`bg-${current.theme}`"
      >
        <h4 class="mb-0 fw-bold">
          {{ current.icon }} {{ current.name }}
        </h4>
        <small class="text-light">{{ current.subtitle }}</small>
      </div>

      <!-- Body -->
      <div class="card-body p-4">
        <h5 class="mb-4 text-center">Sign In</h5>

        <div v-if="error" class="alert alert-danger py-2">
          {{ error }}
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Username</label>
          <input
            v-model="form.username"
            type="text"
            class="form-control"
            placeholder="Enter username"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold">Password</label>
          <div class="input-group">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              placeholder="Enter password"
              @keyup.enter="handleLogin"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button
          class="btn w-100 py-2 fw-semibold text-white"
          :class="`btn-${current.theme}`"
          :disabled="loading"
          @click="handleLogin"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </div>

      <!-- Footer -->
      <div class="card-footer text-center text-muted py-3">
        <small>{{ current.footer }}</small>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import { useRoute } from 'vue-router'

const router    = useRouter()
const authStore = useAuthStore()
const route = useRoute()
const company = route.query.company || 'bozzvics'

const form = ref({
  username: '',
  password: '',
})

const loading      = ref(false)
const error        = ref(null)
const showPassword = ref(false)

// const handleLogin = async () => {
//   error.value = null

//   if (!form.value.username || !form.value.password) {
//     error.value = 'Please enter username and password.'
//     return
//   }

//   loading.value = true
//   try {
//     await authStore.login(form.value.username, form.value.password)
//     router.push('/dashboard')
//   } catch (err) {
//     error.value = err.response?.data?.message || 'Login failed. Please try again.'
//   } finally {
//     loading.value = false
//   }
// }

const handleLogin = async () => {
  error.value = null

  const username = form.value.username?.toLowerCase()

  if (!username || !form.value.password) {
    error.value = 'Please enter username and password.'
    return
  }

  // ✅ Allow "admin" for all companies
  if (username !== 'admin') {

    if (company === 'bozzvics' && !username.endsWith('@bozzvics')) {
      error.value = 'Only Bozzvics registered employees are allowed'
      return
    }

    if (company === 'woodlands' && !username.endsWith('@woodlands')) {
      error.value = 'Only Woodlands registered employees are allowed'
      return
    }
  }

  loading.value = true
  try {
    await authStore.login(form.value.username, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const branding = {
  bozzvics: {
    name: 'Bozzvics HR',
    subtitle: 'Employee Management System',
    footer: 'Bozzvics House of Lomi © 2025',
    theme: 'dark',
    icon: '🍜'
  },
  woodlands: {
    name: 'Woodlands HR',
    subtitle: 'Employee Management System',
    footer: 'Woodlands Waters © 2026',
    theme: 'dark',
    icon: '💧' // bottled water vibe
  }
}

const current = branding[company]

</script>