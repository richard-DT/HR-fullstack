<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-0">📋 Payslips</h4>
        <small class="text-muted" v-if="selectedEmployee">{{ selectedEmployee.name }}</small>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="router.back()">
          ← Back
        </button>
        <button class="btn btn-dark" @click="openAddModal" v-if="authStore.isAdmin">
          + Add Payslip
        </button>
      </div>
    </div>

    <!-- Payslip Header Info -->
    <div class="card shadow-sm mb-4" v-if="selectedEmployee">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <p class="mb-1"><span class="text-muted">Employee:</span> <strong>{{ selectedEmployee.name }}</strong></p>
            <p class="mb-1"><span class="text-muted">Hire Date:</span> {{ formatDate(selectedEmployee.hireDate) }}</p>
            <p class="mb-1"><span class="text-muted">Daily Rate:</span> ₱{{ selectedEmployee.dailyRate?.toFixed(2) }}</p>
            <p class="mb-0"><span class="text-muted">4hrs OT Rate:</span> ₱{{ selectedEmployee.otRate4hrs?.toFixed(2) }}</p>
          </div>
          <div class="col-md-6">
            <p class="mb-1"><span class="text-muted">Monthly Rate:</span> <strong>₱{{ selectedEmployee.monthlyRate?.toLocaleString() }}</strong></p>
            <p class="mb-1"><span class="text-muted">Monthly Restday Pay:</span> ₱{{ selectedEmployee.monthlyRestdayPay?.toLocaleString() }}</p>
            <p class="mb-1"><span class="text-muted">Variable Bonus:</span> ₱{{ selectedEmployee.variableBonus?.toLocaleString() }}</p>
            <p class="mb-0"><span class="text-muted">Gross Monthly Pay:</span> <strong class="text-success">₱{{ selectedEmployee.grossMonthlyPay?.toLocaleString() }}</strong></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payslips List — Desktop Table -->
    <div class="card shadow-sm d-none d-md-block">
      <div class="card-body p-0">
        <div v-if="attendanceStore.loading" class="text-center py-4">
          <div class="spinner-border text-secondary"></div>
        </div>
        <table v-else class="table table-hover mb-0">
          <thead class="table-dark">
            <tr>
              <th>Pay Period</th>
              <th>Daily Pay</th>
              <th>Overtime</th>
              <th>Advances</th>
              <th>Net Pay</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="week in attendanceStore.weeks" :key="week._id">
              <td>{{ formatDate(week.periodStart) }} — {{ formatDate(week.periodEnd) }}</td>
              <td>₱{{ week.totalDailyPay.toLocaleString() }}</td>
              <td>₱{{ week.totalOvertime.toLocaleString() }}</td>
              <td>₱{{ week.totalAdvances.toLocaleString() }}</td>
              <td class="fw-bold text-success">₱{{ week.netPay.toLocaleString() }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" @click="openViewModal(week)">
                  👁️ View
                </button>
                <button class="btn btn-sm btn-outline-warning me-1" @click="openEditModal(week)" v-if="authStore.isAdmin">
                  ✏️ Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="handleDelete(week._id)" v-if="authStore.isAdmin">
                  🗑️
                </button>
              </td>
            </tr>
            <tr v-if="attendanceStore.weeks.length === 0">
              <td colspan="6" class="text-center text-muted py-4">No payslips yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payslips List — Mobile Cards -->
    <div class="d-md-none">
      <div v-if="attendanceStore.loading" class="text-center py-4">
        <div class="spinner-border text-secondary"></div>
      </div>
      <div v-else>
        <div
          v-for="week in attendanceStore.weeks"
          :key="week._id"
          class="card shadow-sm mb-3"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <p class="fw-bold mb-0 small">
                  {{ formatDate(week.periodStart) }} — {{ formatDate(week.periodEnd) }}
                </p>
              </div>
              <span class="badge bg-success fs-6">₱{{ week.netPay.toLocaleString() }}</span>
            </div>
            <div class="row text-center small mt-2">
              <div class="col-4 border-end">
                <p class="text-muted mb-0">Daily Pay</p>
                <p class="fw-semibold mb-0">₱{{ week.totalDailyPay.toLocaleString() }}</p>
              </div>
              <div class="col-4 border-end">
                <p class="text-muted mb-0">Overtime</p>
                <p class="fw-semibold mb-0">₱{{ week.totalOvertime.toLocaleString() }}</p>
              </div>
              <div class="col-4">
                <p class="text-muted mb-0">Advances</p>
                <p class="fw-semibold mb-0">₱{{ week.totalAdvances.toLocaleString() }}</p>
              </div>
            </div>
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-sm btn-outline-primary flex-grow-1" @click="openViewModal(week)">
                👁️ View Details
              </button>
              <button class="btn btn-sm btn-outline-warning me-1" @click="openEditModal(week)" v-if="authStore.isAdmin">
                ✏️ Edit
              </button>
              <button
                v-if="authStore.isAdmin"
                class="btn btn-sm btn-outline-danger"
                @click="handleDelete(week._id)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        <p v-if="attendanceStore.weeks.length === 0" class="text-center text-muted py-4">
          No payslips yet.
        </p>
      </div>
    </div>

    <!-- View Payslip Modal -->
    <div class="modal fade" id="viewWeekModal" tabindex="-1" ref="viewModalRef">
      <div class="modal-dialog modal-lg modal-fullscreen-sm-down">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title small">
              📋 {{ formatDate(selectedWeek?.periodStart) }} — {{ formatDate(selectedWeek?.periodEnd) }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedWeek">

            <!-- Desktop Table -->
            <div class="d-none d-md-block">
              <table class="table table-bordered table-sm">
                <thead class="table-dark">
                  <tr>
                    <th>Day</th>
                    <th>Date</th>
                    <th>Attendance</th>
                    <th v-if="authStore.isAdmin">Hours</th>
                    <th v-if="authStore.isAdmin">OT Hrs</th>
                    <th>Daily Pay</th>
                    <th>OT Pay</th>
                    <th>Advances</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="day in selectedWeek.days" :key="day.dayNumber">
                    <td>{{ day.weekday }}</td>
                    <td>{{ day.dayNumber }}</td>
                    <td><span :class="attendanceBadge(day.attendance)">{{ day.attendance }}</span></td>
                    <td v-if="authStore.isAdmin">{{ day.hoursWorked ?? 8 }}</td>
                    <td v-if="authStore.isAdmin">{{ day.otHours ?? 0 }}</td>
                    <td>₱{{ day.dailyPay.toLocaleString() }}</td>
                    <td>₱{{ day.overtime.toLocaleString() }}</td>
                    <td>₱{{ day.advances.toLocaleString() }}</td>
                    <td>{{ day.remarks || '—' }}</td>
                  </tr>
                </tbody>
                <tfoot class="table-light fw-bold">
                  <tr>
                    <td :colspan="authStore.isAdmin ? 5 : 3" class="text-end">Totals:</td>
                    <td>₱{{ selectedWeek.totalDailyPay.toLocaleString() }}</td>
                    <td>₱{{ selectedWeek.totalOvertime.toLocaleString() }}</td>
                    <td>₱{{ selectedWeek.totalAdvances.toLocaleString() }}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td :colspan="authStore.isAdmin ? 8 : 6" class="text-end text-success">Net Pay:</td>
                    <td class="text-success">₱{{ selectedWeek.netPay.toLocaleString() }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Mobile Cards per day -->
            <div class="d-md-none">
              <div
                v-for="day in selectedWeek.days"
                :key="day.dayNumber"
                class="card mb-2 border"
              >
                <div class="card-body py-2 px-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="fw-bold">{{ day.weekday }}, Day {{ day.dayNumber }}</span>
                      <span :class="['badge ms-2', attendanceBadge(day.attendance)]">
                        {{ day.attendance }}
                      </span>
                    </div>
                    <div class="text-end">
                      <p class="mb-0 fw-bold text-success small">
                        ₱{{ (day.dailyPay + day.overtime).toLocaleString() }}
                      </p>
                      <p class="mb-0 text-danger small" v-if="day.advances > 0">
                        -₱{{ day.advances.toLocaleString() }}
                      </p>
                    </div>
                  </div>
                  <div class="row text-muted small mt-1" v-if="day.attendance !== 'absent' && day.attendance !== 'rest'">
                    <!-- <div class="col-4">Hrs: { day.hoursWorked ?? 8 }}</div>
                    <div class="col-4">OT: { day.otHours ?? 0 }}hrs</div> -->
                    <div class="col-4" v-if="day.remarks">📝 {{ day.remarks }}</div>
                  </div>
                </div>
              </div>

              <!-- Mobile Totals -->
              <div class="card bg-dark text-white mt-3">
                <div class="card-body py-2">
                  <div class="d-flex justify-content-between small">
                    <span>Daily Pay:</span>
                    <span>₱{{ selectedWeek.totalDailyPay.toLocaleString() }}</span>
                  </div>
                  <div class="d-flex justify-content-between small">
                    <span>Overtime:</span>
                    <span>₱{{ selectedWeek.totalOvertime.toLocaleString() }}</span>
                  </div>
                  <div class="d-flex justify-content-between small">
                    <span>Advances:</span>
                    <span>-₱{{ selectedWeek.totalAdvances.toLocaleString() }}</span>
                  </div>
                  <hr class="border-secondary my-2"/>
                  <div class="d-flex justify-content-between fw-bold">
                    <span>Net Pay:</span>
                    <span class="text-success">₱{{ selectedWeek.netPay.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Add Payslip Modal -->
    <div class="modal fade" id="addWeekModal" tabindex="-1" ref="addModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Add Payslip</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label fw-semibold">Period Start</label>
                <input v-model="form.periodStart" type="date" class="form-control" @change="generateDays" />
              </div>
              <div class="col">
                <label class="form-label fw-semibold">Period End</label>
                <input v-model="form.periodEnd" type="date" class="form-control" @change="generateDays" />
              </div>
            </div>

            <!-- Days Table -->
            <table class="table table-bordered table-sm" v-if="form.days.length">
              <thead class="table-dark">
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>Attendance</th>
                  <th>Hours Worked</th>
                  <th>OT Hours</th>
                  <th>Advances (₱)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(day, idx) in form.days" :key="idx">
                  <td>{{ day.weekday }}</td>
                  <td>{{ day.dayNumber }}</td>
                  <td>
                    <select v-model="day.attendance" class="form-select form-select-sm">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="ot">OT</option>
                      <option value="partial">Partial</option>
                      <option value="rest">Rest</option>
                      <option value="sl">Sick Leave</option>
                      <option value="vl">Vacation Leave</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </td>
                  <td>
                    <input
                      v-model.number="day.hoursWorked"
                      type="number"
                      class="form-control form-control-sm"
                      min="0" max="8"
                      :disabled="['absent','rest','sl','vl','holiday'].includes(day.attendance)"
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="day.otHours"
                      type="number"
                      class="form-control form-control-sm"
                      min="0"
                      :disabled="day.attendance !== 'ot'"
                    />
                  </td>
                  <td>
                    <input v-model.number="day.advances" type="number" class="form-control form-control-sm" min="0" />
                  </td>
                  <td>
                    <input v-model="day.remarks" type="text" class="form-control form-control-sm" />
                  </td>
                </tr>
              </tbody>
            </table>

            <p class="text-muted small" v-else>Select a period start and end date to generate the days.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-dark" :disabled="saving" @click="handleAddPayslip">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ saving ? 'Saving...' : (isEditMode ? 'Update Payslip' : 'Save Payslip') }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { useAuthStore } from '@/stores/authStore.js'
import { useEmployeeStore } from '@/stores/employeeStore.js'
import { useAttendanceStore } from '@/stores/attendanceStore.js'

const route           = useRoute()
const router          = useRouter()
const authStore       = useAuthStore()
const employeeStore   = useEmployeeStore()
const attendanceStore = useAttendanceStore()

const employeeId       = route.params.employeeId
const selectedEmployee = ref(null)
const selectedWeek     = ref(null)
const viewModalRef     = ref(null)
const addModalRef      = ref(null)
const formError        = ref(null)
const saving           = ref(false)

const isEditMode = ref(false)
const editingWeekId = ref(null)

let viewModal = null
let addModal  = null

const form = ref({ periodStart: '', periodEnd: '', days: [] })

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

const attendanceBadge = (attendance) => {
  const map = {
    present: 'badge bg-success',
    ot:      'badge bg-primary',
    partial: 'badge bg-warning text-dark',
    absent:  'badge bg-danger',
    rest:    'badge bg-secondary',
    sl:      'badge bg-info text-dark',
    vl:      'badge bg-info text-dark',
    holiday: 'badge bg-dark',
  }
  return map[attendance] || 'badge bg-secondary'
}

const generateDays = () => {
  if (!form.value.periodStart || !form.value.periodEnd) return

  const start = new Date(form.value.periodStart)
  const end   = new Date(form.value.periodEnd)
  const days  = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({
      weekday:     weekdays[d.getDay()],
      dayNumber:   d.getDate(),
      attendance:  'present',
      hoursWorked: 8,
      otHours:     0,
      advances:    0,
      remarks:     '',
    })
  }

  form.value.days = days
}

const openViewModal = (week) => {
  selectedWeek.value = week
  viewModal.show()
}

// original
// const openAddModal = () => {
//   formError.value = null
//   form.value      = { periodStart: '', periodEnd: '', days: [] }
//   addModal.show()
// }

const openAddModal = () => {
  formError.value = null
  isEditMode.value = false
  editingWeekId.value = null

  form.value = { periodStart: '', periodEnd: '', days: [] }
  addModal.show()
}

// original
// const handleAddPayslip = async () => {
//   formError.value = null
//   if (!form.value.periodStart || !form.value.periodEnd || !form.value.days.length) {
//     formError.value = 'Please select a pay period.'
//     return
//   }
//   saving.value = true
//   try {
//     await attendanceStore.createWeek(employeeId, form.value)
//     addModal.hide()
//   } catch (err) {
//     formError.value = err.response?.data?.message || 'Error saving payslip.'
//   } finally {
//     saving.value = false
//   }
// }

const handleAddPayslip = async () => {
  formError.value = null

  if (!form.value.periodStart || !form.value.periodEnd || !form.value.days.length) {
    formError.value = 'Please select a pay period.'
    return
  }

  saving.value = true

  try {
    if (isEditMode.value) {
      await attendanceStore.updateWeek(editingWeekId.value, form.value)
    } else {
      await attendanceStore.createWeek(employeeId, form.value)
    }

    addModal.hide()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error saving payslip.'
  } finally {
    saving.value = false
  }
}

const handleDelete = async (weekId) => {
  if (!confirm('Delete this payslip?')) return
  await attendanceStore.deleteWeek(weekId)
}

const openEditModal = (week) => {
  formError.value = null
  isEditMode.value = true
  editingWeekId.value = week._id

  // deep clone so we don't mutate original table data
  form.value = {
    periodStart: week.periodStart?.slice(0, 10),
    periodEnd: week.periodEnd?.slice(0, 10),
    days: JSON.parse(JSON.stringify(week.days))
  }

  addModal.show()
}

onMounted(async () => {
  await employeeStore.fetchEmployee(employeeId)
  selectedEmployee.value = employeeStore.employee
  await attendanceStore.fetchWeeks(employeeId)
  viewModal = new Modal(viewModalRef.value)
  addModal  = new Modal(addModalRef.value)
})
</script>