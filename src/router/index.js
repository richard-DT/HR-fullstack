import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true }  // hindi na mapupuntahan kapag logged in
    },
    {
      path: '/dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/employees',
      component: () => import('@/views/EmployeesView.vue'),
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/attendance/:employeeId',
      component: () => import('@/views/AttendanceView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/loans/:employeeId',
      component: () => import('@/views/LoansView.vue'),
      meta: { requiresAuth: true }
    },
  ]
})

// Route guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/login')
  }

  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return next('/dashboard')
  }

  if (to.meta.adminOnly && !authStore.isAdmin) {
    return next('/dashboard')
  }

  next()
})

export default router