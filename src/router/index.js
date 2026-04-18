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
    {
      path: '/13thmonth/:employeeId/:year',
      component: () => import('@/views/ThirteenthMonthView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ytd/:employeeId/:year',
      component: () => import('@/views/YTDAttendanceView.vue'),
      meta: { requiresAuth: true }
    },
  ]
})

// Route guards
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore()

//   if (to.meta.requiresAuth && !authStore.isLoggedIn) {
//     return next('/login')
//   }

//   if (to.meta.guestOnly && authStore.isLoggedIn) {
//     return next('/dashboard')
//   }

//   if (to.meta.adminOnly && !authStore.isAdmin) {
//     return next('/dashboard')
//   }

//   next()
// })

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  const isLoggedIn = authStore.isLoggedIn
  const isAdmin = authStore.isAdmin
  const isEmployee = authStore.user?.role === 'employee'

  // 1. Not logged in
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login')
  }

  // 2. Guest only routes
  if (to.meta.guestOnly && isLoggedIn) {
    return next(isEmployee ? `/loans/${authStore.user.employee._id}` : '/dashboard')
  }

  // 3. Admin-only routes
  if (to.meta.adminOnly && !isAdmin) {
    return next(isEmployee ? `/loans/${authStore.user.employee._id}` : '/dashboard')
  }

  // 4. 🚫 BLOCK EMPLOYEE FROM DASHBOARD (IMPORTANT FIX)
  if (to.path === '/dashboard' && isEmployee) {
    return next(`/loans/${authStore.user.employee._id}`)
  }

  next()
})

export default router