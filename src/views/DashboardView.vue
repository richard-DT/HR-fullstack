<template>
  <div>
    <h4 class="fw-bold mb-4">📊 Dashboard</h4>

    <!-- Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card text-white bg-dark h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-1 small text-secondary">Total Employees</p>
                <h3 class="fw-bold mb-0">{{ employeeStore.employees.length }}</h3>
              </div>
              <span style="font-size: 2rem">👥</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-white bg-success h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-1 small text-white-50">Active Loans</p>
                <h3 class="fw-bold mb-0">{{ activeLoansCount }}</h3>
              </div>
              <span style="font-size: 2rem">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-white bg-primary h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-1 small text-white-50">Total Payroll</p>
                <h3 class="fw-bold mb-0">₱{{ totalPayroll.toLocaleString() }}</h3>
              </div>
              <span style="font-size: 2rem">📋</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card text-white bg-warning h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-1 small text-white-50">Total Loan Balance</p>
                <h3 class="fw-bold mb-0">₱{{ totalLoanBalance.toLocaleString() }}</h3>
              </div>
              <span style="font-size: 2rem">⚠️</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Table -->
    <div class="card shadow-sm" v-if="authStore.isAdmin">
      <div class="card-header bg-white fw-semibold">
        👥 Employee Overview
      </div>
      <div class="card-body p-0">
        <div v-if="employeeStore.loading" class="text-center py-4">
          <div class="spinner-border text-secondary"></div>
        </div>
        <table v-else class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Monthly Rate</th>
              <th>Daily Rate</th>
              <th>Gross Monthly</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employeeStore.employees" :key="emp._id">
              <td class="fw-semibold">{{ emp.name }}</td>
              <td>{{ emp.position || '—' }}</td>
              <td>₱{{ emp.monthlyRate.toLocaleString() }}</td>
              <td>₱{{ emp.dailyRate.toFixed(2) }}</td>
              <td>₱{{ emp.grossMonthlyPay.toLocaleString() }}</td>
              <td>
                <RouterLink
                  :to="`/attendance/${emp._id}`"
                  class="btn btn-sm btn-outline-primary me-1"
                >
                  Payslips
                </RouterLink>
                <RouterLink
                  :to="`/loans/${emp._id}`"
                  class="btn btn-sm btn-outline-success"
                >
                  Loans
                </RouterLink>
              </td>
            </tr>
            <tr v-if="employeeStore.employees.length === 0">
              <td colspan="6" class="text-center text-muted py-4">No employees yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Employee view — their own info -->
    <div class="card shadow-sm" v-else>
      <div class="card-header bg-white fw-semibold">
        👤 My Information
      </div>
      <div class="card-body" v-if="employeeStore.employee">
        <div class="row">
          <div class="col-md-6">
            <p><span class="text-muted">Name:</span> <strong>{{ employeeStore.employee.name }}</strong></p>
            <p><span class="text-muted">Position:</span> {{ employeeStore.employee.position || '—' }}</p>
            <p><span class="text-muted">Hire Date:</span> {{ formatDate(employeeStore.employee.hireDate) }}</p>
          </div>
          <div class="col-md-6">
            <p><span class="text-muted">Monthly Rate:</span> <strong>₱{{ employeeStore.employee.monthlyRate?.toLocaleString() }}</strong></p>
            <p><span class="text-muted">Daily Rate:</span> ₱{{ employeeStore.employee.dailyRate?.toFixed(2) }}</p>
            <p><span class="text-muted">Gross Monthly:</span> ₱{{ employeeStore.employee.grossMonthlyPay?.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import { useEmployeeStore } from '@/stores/employeeStore.js'

const authStore     = useAuthStore()
const employeeStore = useEmployeeStore()

const totalPayroll = computed(() =>
  employeeStore.employees.reduce((sum, e) => sum + (e.grossMonthlyPay || 0), 0)
)

const activeLoansCount = computed(() => 0)  // later i-connect sa loanStore
const totalLoanBalance = computed(() => 0)  // later i-connect sa loanStore

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

onMounted(async () => {
  if (authStore.isAdmin) {
    await employeeStore.fetchEmployees()
  } else if (authStore.user?.employee) {
    await employeeStore.fetchEmployee(authStore.user.employee._id)
  }
})
</script>