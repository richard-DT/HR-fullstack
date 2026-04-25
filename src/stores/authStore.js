import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios.js'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    token.value = res.data.token
    user.value  = res.data.user
    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const logout = () => {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isWoodlands = computed(() =>
  user.value?.username?.toLowerCase().endsWith('@woodlands') || false
)
  const appName = computed(() =>
  user.value?.username?.toLowerCase().endsWith('@woodlands')
    ? '💧 Woodlands HR'
    : '🍜 Bozzvics HR'
)

  return { user, token, isLoggedIn, isAdmin, isWoodlands, appName, login, logout }
})