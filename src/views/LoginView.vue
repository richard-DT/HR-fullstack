<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow" style="width: 400px">

      <!-- Header -->
      <div class="card-header bg-dark text-white text-center py-4">
        <h4 class="mb-0 fw-bold">🍜 Bozzvics HR</h4>
        <small class="text-secondary">Employee Management System</small>
      </div>

      <!-- Body -->
      <div class="card-body p-4">
        <h5 class="mb-4 text-center">Sign In</h5>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-danger py-2">
          {{ error }}
        </div>

        <!-- Form -->
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
          class="btn btn-dark w-100 py-2 fw-semibold"
          :disabled="loading"
          @click="handleLogin"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </div>

      <!-- Footer -->
      <div class="card-footer text-center text-muted py-3">
        <small>Bozzvics House of Lomi © 2025</small>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const router    = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const loading      = ref(false)
const error        = ref(null)
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = null

  if (!form.value.username || !form.value.password) {
    error.value = 'Please enter username and password.'
    return
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
</script>