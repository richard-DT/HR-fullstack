<template>
  <div>

    <!-- ═══ EMPLOYEE SELECTED VIEW ═══ -->
    <div v-if="authStore.isAdmin && employeeStore.summary">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="fw-bold mb-0">👤 {{ employeeStore.summary.name }}</h4>
          <small class="text-muted">{{ employeeStore.summary.position || 'No position' }}</small>
        </div>
        <button class="btn btn-outline-secondary btn-sm" @click="employeeStore.summary = null">
          ← All Employees
        </button>
      </div>

      <!-- Actions -->
      <div class="d-flex flex-wrap gap-2 mb-4">
        <RouterLink :to="`/attendance/${employeeStore.summary._id}`" class="btn btn-outline-secondary btn-sm">
          📋 Payslips
        </RouterLink>
        <RouterLink :to="`/loans/${employeeStore.summary._id}`" class="btn btn-outline-success btn-sm">
          💰 Loans
        </RouterLink>
        <RouterLink :to="`/ytd/${employeeStore.summary._id}/${currentYear}`" class="btn btn-outline-info btn-sm">
          📅 YTD Attendance
        </RouterLink>
        <RouterLink :to="`/13thmonth/${employeeStore.summary._id}/${currentYear}`" class="btn btn-outline-warning btn-sm">
          🏆 Monthly Performance
        </RouterLink>
        <button class="btn btn-outline-primary btn-sm" @click="openSalaryModal">
          💵 Update Salary
        </button>
        <button class="btn btn-outline-danger btn-sm" @click="openUserModal">
          👤 Create Account
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card bg-dark text-white h-100">
            <div class="card-body">
              <p class="small text-secondary mb-1">Monthly Rate</p>
              <h5 class="fw-bold mb-0">₱{{ employeeStore.summary.monthlyRate.toLocaleString() }}</h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body">
              <p class="small text-white-50 mb-1">Gross Monthly</p>
              <h5 class="fw-bold mb-0">₱{{ employeeStore.summary.grossMonthlyPay.toLocaleString() }}</h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card bg-danger text-white h-100">
            <div class="card-body">
              <p class="small text-white-50 mb-1">Total Loan Balance</p>
              <h5 class="fw-bold mb-0">₱{{ employeeStore.summary.totalLoanBalance.toLocaleString() }}</h5>
              <small class="text-white-50">{{ employeeStore.summary.activeLoans }} active loan(s)</small>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card bg-warning text-dark h-100">
            <div class="card-body">
              <p class="small mb-1">Monthly Performance Bonus</p>
              <h5 class="fw-bold mb-0">₱{{ employeeStore.summary.ytd13thMonth.toLocaleString() }}</h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Details -->
      <div class="card shadow-sm">
        <div class="card-header bg-white fw-semibold">Employee Details</div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p class="mb-2"><span class="text-muted">Hire Date:</span> <strong>{{ formatDate(employeeStore.summary.hireDate) }}</strong></p>
              <p class="mb-2"><span class="text-muted">Daily Rate:</span> ₱{{ employeeStore.summary.dailyRate?.toFixed(2) }}</p>
              <p class="mb-2"><span class="text-muted">4hrs OT Rate:</span> ₱{{ employeeStore.summary.otRate4hrs?.toFixed(2) }}</p>
              <p class="mb-2"><span class="text-muted">Restday Pay:</span> ₱{{ employeeStore.summary.monthlyRestdayPay?.toLocaleString() }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-2"><span class="text-muted">Variable Bonus:</span> ₱{{ employeeStore.summary.variableBonus?.toLocaleString() }}</p>
              <p class="mb-2">
                <span class="text-muted">YTD Attendance:</span>
                <strong :class="employeeStore.summary.attendanceRate >= 90 ? 'text-success' : 'text-danger'">
                  {{ employeeStore.summary.attendanceRate }}%
                </strong>
              </p>
              <p class="mb-2"><span class="text-muted">Active Loans:</span> {{ employeeStore.summary.activeLoans }}</p>
            </div>
          </div>

          <!-- Salary History -->
          <div class="mt-3" v-if="employeeStore.summary.salaryHistory?.length">
            <p class="fw-semibold mb-2">Salary History</p>
            <table class="table table-sm table-bordered">
              <thead class="table-dark">
                <tr>
                  <th>Effective Date</th>
                  <th>Monthly Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in employeeStore.summary.salaryHistory" :key="h.effectiveDate">
                  <td>{{ formatDate(h.effectiveDate) }}</td>
                  <td>₱{{ h.monthlyRate.toLocaleString() }}</td>
                  <td>
                    <span :class="h.isCurrent ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ h.isCurrent ? 'Current' : 'Previous' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ ALL EMPLOYEES VIEW (default) ═══ -->
    <div v-else>
      <h4 class="fw-bold mb-4">📊 Dashboard</h4>

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
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
        <div class="col-6 col-md-3">
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
        <div class="col-6 col-md-3">
          <div class="card text-white bg-success h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="mb-1 small text-white-50">Total Gross</p>
                  <h3 class="fw-bold mb-0">₱{{ totalGross.toLocaleString() }}</h3>
                </div>
                <span style="font-size: 2rem">💰</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Hide para sa Woodlands -->
        <template v-if="!authStore.isWoodlands">
        <div class="col-6 col-md-3">
          <div class="card text-white bg-info h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="mb-1 small text-white-50">YTD Performance Bonus</p>
                  <h3 class="fw-bold mb-0">₱{{ totalYTD13th.toLocaleString() }}</h3>
                </div>
                <span style="font-size: 2rem">🏆</span>
              </div>
            </div>
          </div>
        </div>
        </template>
      </div>

      <!-- KPI Table -->
      <div class="card shadow-sm d-none d-md-block">
        <div class="card-header bg-white fw-semibold">👥 Employee KPIs</div>
        <div class="card-body p-0">
          <div v-if="employeeStore.loading" class="text-center py-4">
            <div class="spinner-border text-secondary"></div>
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Monthly Rate</th>
                <th>Gross Monthly</th>
                <th>Loan Balance</th>
                <th>YTD Performance Bonus</th>
                <th>YTD Attendance %</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="emp in summaries"
                :key="emp._id"
                style="cursor: pointer"
                @click="selectEmployee(emp)"
                :class="{ 'table-active': employeeStore.summary?._id === emp._id }"
              >
                <td class="fw-semibold">{{ emp.name }}</td>
                <td>{{ emp.position || '—' }}</td>
                <td>₱{{ emp.monthlyRate.toLocaleString() }}</td>
                <td>₱{{ emp.grossMonthlyPay?.toLocaleString() }}</td>
                <td :class="emp.totalLoanBalance > 0 ? 'text-danger fw-bold' : 'text-success'">
                  ₱{{ emp.totalLoanBalance?.toLocaleString() ?? '—' }}
                </td>
                <td>₱{{ emp.ytd13thMonth?.toLocaleString() ?? '—' }}</td>
                <!-- <td>
                  <span v-if="emp.attendanceRate !== undefined"
                    :class="emp.attendanceRate >= 90 ? 'badge bg-success' : 'badge bg-danger'"
                  >
                    {{ emp.attendanceRate }}%
                  </span>
                  <span v-else class="text-muted">—</span>
                </td> -->
                <td>
                  <div v-if="emp.attendanceRate !== undefined" class="d-flex align-items-center gap-2">
                    
                    <!-- Progress Bar -->
                    <div class="progress w-100" style="height: 20px;">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        :style="{ width: emp.attendanceRate + '%' }"
                        :class="emp.attendanceRate >= 90 ? 'bg-success' : 'bg-danger'"
                      >
                        {{ emp.attendanceRate }}%
                      </div>
                    </div>

                  </div>

                  <span v-else class="text-muted">—</span>
                </td>
              </tr>
              <tr v-if="employeeStore.employees.length === 0">
                <td colspan="7" class="text-center text-muted py-4">No employees yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="d-md-none">
        <div
          v-for="emp in summaries"
          :key="emp._id"
          class="card shadow-sm mb-3"
          @click="selectEmployee(emp)"
          style="cursor: pointer"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <p class="fw-bold mb-0">{{ emp.name }}</p>
                <small class="text-muted">{{ emp.position || '—' }}</small>
              </div>
              <span :class="emp.attendanceRate >= 90 ? 'badge bg-success' : 'badge bg-danger'">
                {{ emp.attendanceRate }}%
              </span>
            </div>
            <div class="row text-center small">
              <div class="col-4 border-end">
                <p class="text-muted mb-0">Monthly</p>
                <p class="fw-semibold mb-0">₱{{ emp.monthlyRate.toLocaleString() }}</p>
              </div>
              <div class="col-4 border-end">
                <p class="text-muted mb-0">Loan Bal</p>
                <p class="fw-semibold mb-0" :class="emp.totalLoanBalance > 0 ? 'text-danger' : 'text-success'">
                  ₱{{ emp.totalLoanBalance?.toLocaleString() ?? '—' }}
                </p>
              </div>
              <div class="col-4">
                <p class="text-muted mb-0">Mo Bonus</p>
                <p class="fw-semibold mb-0">₱{{ emp.ytd13thMonth?.toLocaleString() ?? '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Salary Modal -->
    <div class="modal fade" id="salaryModal" tabindex="-1" ref="salaryModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Update Salary — {{ employeeStore.summary?.name }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label fw-semibold">New Monthly Rate (₱)</label>
              <input v-model.number="salaryForm.monthlyRate" type="number" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Effective Date</label>
              <input v-model="salaryForm.effectiveDate" type="date" class="form-control" />
            </div>
            <div class="alert alert-secondary py-2 small" v-if="salaryForm.monthlyRate">
              <strong>Preview:</strong><br/>
              Daily Rate: ₱{{ (salaryForm.monthlyRate / 26).toFixed(2) }}<br/>
              Gross Monthly: ₱{{ (salaryForm.monthlyRate + (salaryForm.monthlyRate / 26) * 4).toLocaleString() }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-dark" :disabled="saving" @click="handleUpdateSalary">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ saving ? 'Saving...' : 'Update Salary' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div class="modal fade" id="createUserModal" tabindex="-1" ref="createUserModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Create Account — {{ employeeStore.summary?.name }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            <div v-if="formSuccess" class="alert alert-success py-2">{{ formSuccess }}</div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Username</label>
              <input v-model="userForm.username" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Password</label>
              <input v-model="userForm.password" type="password" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-dark" :disabled="saving" @click="handleCreateUser">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ saving ? 'Creating...' : 'Create Account' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { useAuthStore } from '@/stores/authStore.js'
import { useEmployeeStore } from '@/stores/employeeStore.js'
import api from '@/api/axios.js'

const router        = useRouter()
const authStore     = useAuthStore()
const employeeStore = useEmployeeStore()
const currentYear   = new Date().getFullYear()

const salaryModalRef     = ref(null)
const createUserModalRef = ref(null)
let salaryModal          = null
let createUserModal      = null

const salaryForm  = ref({ monthlyRate: null, effectiveDate: '' })
const userForm    = ref({ username: '', password: '' })
const saving      = ref(false)
const formError   = ref(null)
const formSuccess = ref(null)

// Summaries — fetched per employee
const summaries = ref([])

const totalPayroll = computed(() =>
  employeeStore.employees.reduce((sum, e) => sum + (e.monthlyRate || 0), 0)
)
const totalGross = computed(() =>
  employeeStore.employees.reduce((sum, e) => sum + (e.grossMonthlyPay || 0), 0)
)
const totalYTD13th = computed(() =>
  summaries.value.reduce((sum, e) => sum + (e.ytd13thMonth || 0), 0)
)

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

const selectEmployee = async (emp) => {
  await employeeStore.fetchSummary(emp._id)
}

const openSalaryModal = () => {
  formError.value   = null
  salaryForm.value  = { monthlyRate: employeeStore.summary.monthlyRate, effectiveDate: '' }
  salaryModal.show()
}

const openUserModal = () => {
  formError.value   = null
  formSuccess.value = null
  userForm.value    = { username: '', password: '' }
  createUserModal.show()
}

const handleUpdateSalary = async () => {
  formError.value = null
  if (!salaryForm.value.monthlyRate || !salaryForm.value.effectiveDate) {
    formError.value = 'All fields are required.'
    return
  }
  saving.value = true
  try {
    await api.put(`/employees/${employeeStore.summary._id}/salary`, salaryForm.value)
    await employeeStore.fetchSummary(employeeStore.summary._id)
    salaryModal.hide()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error updating salary.'
  } finally {
    saving.value = false
  }
}

const handleCreateUser = async () => {
  formError.value   = null
  formSuccess.value = null
  if (!userForm.value.username || !userForm.value.password) {
    formError.value = 'All fields are required.'
    return
  }
  saving.value = true
  try {
    await api.post('/auth/register', {
      name:       employeeStore.summary.name,
      username:   userForm.value.username,
      password:   userForm.value.password,
      role:       'employee',
      employeeId: employeeStore.summary._id,
    })
    formSuccess.value = `Account created for ${employeeStore.summary.name}!`
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error creating account.'
  } finally {
    saving.value = false
  }
}

// onMounted(async () => {
//   salaryModal     = new Modal(salaryModalRef.value)
//   createUserModal = new Modal(createUserModalRef.value)

//   if (authStore.isAdmin) {
//     await employeeStore.fetchEmployees()
//     // Fetch summaries for all employees
//     summaries.value = await Promise.all(
//       employeeStore.employees.map(async (emp) => {
//         const res = await api.get(`/employees/${emp._id}/summary`)
//         return res.data
//       })
//     )
//   } else if (authStore.user?.employee) {
//     await employeeStore.fetchEmployee(authStore.user.employee._id)
//   }
// })

onMounted(async () => {
  salaryModal     = new Modal(salaryModalRef.value)
  createUserModal = new Modal(createUserModalRef.value)

  if (authStore.isAdmin) {
    await employeeStore.fetchEmployees()

    summaries.value = await Promise.all(
      employeeStore.employees.map(async (emp) => {
        const res = await api.get(`/employees/${emp._id}/summary`)
        const data = res.data

        // Re-compute attendance rate — same as YTDAttendanceView
        const ytdRes = await api.get(`/employees/${emp._id}/13thmonth/${currentYear}`)
        const months = ytdRes.data.months
        const now    = new Date()
        const BASE_DAYS = 26

        let ytdPresent     = 0
        let ytdWorkingDays = 0
        let monthCount     = 0 

        for (const month of months) {
          monthCount++                        // ← count lahat ng months
          ytdPresent += month.presentDays     // ← sum ng present days
        }

        // console.log(`FINAL: ytdPresent=${ytdPresent}, ytdWorkingDays=${ytdWorkingDays}, rate=${(ytdPresent/ytdWorkingDays*100).toFixed(1)}%`)

        ytdWorkingDays = 26 * monthCount      // ← 26 × number of months


        const attendanceRate = ytdWorkingDays > 0
          ? (ytdPresent / ytdWorkingDays * 100).toFixed(1)
          : 0

        return { ...data, attendanceRate }
      })
    )
  } else if (authStore.user?.employee) {
    await employeeStore.fetchEmployee(authStore.user.employee._id)
  }
})

</script>