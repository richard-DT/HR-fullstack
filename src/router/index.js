import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    { path: '/dashboard', component: () => import('@/views/DashboardView.vue') },
    { path: '/employees', component: () => import('@/views/EmployeesView.vue') },
    { path: '/attendance', component: () => import('@/views/AttendanceView.vue') },
    { path: '/loans', component: () => import('@/views/LoansView.vue') },
  ]
})

export default router