<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-0">📅 YTD Attendance</h4>
        <small class="text-muted" v-if="data">{{ data.employee.name }} — {{ data.year }}</small>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="router.back()">
          ← Back
        </button>
        <select v-model="selectedYear" class="form-select form-select-sm" style="width: auto" @change="fetchData">
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-secondary"></div>
    </div>

    <div v-else-if="data">

      <!-- YTD Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card text-white bg-success h-100">
            <div class="card-body text-center">
              <p class="small mb-1">Total Present</p>
              <h3 class="fw-bold mb-0">{{ ytdSummary.present }}</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-white bg-danger h-100">
            <div class="card-body text-center">
              <p class="small mb-1">Total Absent</p>
              <h3 class="fw-bold mb-0">{{ ytdSummary.absent }}</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-white bg-primary h-100">
            <div class="card-body text-center">
              <p class="small mb-1">Total OT Days</p>
              <h3 class="fw-bold mb-0">{{ ytdSummary.ot }}</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-white bg-dark h-100">
            <div class="card-body text-center">
              <p class="small mb-1">Total Working Days</p>
              <h3 class="fw-bold mb-0">{{ ytdSummary.workingDays }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="card shadow-sm d-none d-md-block">
        <div class="card-header bg-white fw-semibold">
          Monthly Attendance Summary — {{ data.year }}
        </div>
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>Month</th>
                <th>Present</th>
                <th>Absent</th>
                <th>OT Days</th>
                <th>Partial</th>
                <th>SL</th>
                <th>VL</th>
                <th>Rest</th>
                <th>Working Days</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="month in data.months"
                :key="month.month"
                :class="!month.hasData ? 'table-light text-muted' : ''"
              >
                <td class="fw-semibold">{{ month.monthName }}</td>
                <td>
                  <span v-if="month.hasData" class="text-success fw-semibold">{{ month.presentDays }}</span>
                  <span v-else>—</span>
                </td>
                <td>
                  <span v-if="month.hasData" :class="month.absentDays > 0 ? 'text-danger fw-bold' : ''">
                    {{ month.absentDays }}
                  </span>
                  <span v-else>—</span>
                </td>
                <td>{{ month.hasData ? month.otDays : '—' }}</td>
                <td>{{ month.hasData ? month.partialDays : '—' }}</td>
                <td>{{ month.hasData ? month.slDays : '—' }}</td>
                <td>{{ month.hasData ? month.vlDays : '—' }}</td>
                <td>{{ month.hasData ? month.restDays : '—' }}</td>
                <td>{{ month.hasData ? 26 : '—' }}</td>
                <td>
                  <span v-if="month.hasData">
                    <div class="progress" style="height: 8px; min-width: 80px">
                      <div
                        class="progress-bar bg-success"
                        :style="`width: ${month.totalWorkingDays > 0 ? (month.attendanceRate * 100).toFixed(0) : 0}%`"
                      ></div>
                    </div>
                    <small>{{ month.totalWorkingDays > 0 ? (month.attendanceRate * 100).toFixed(1) : 0 }}%</small>
                  </span>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold">
              <tr>
                <td>YTD Total</td>
                <td class="text-success">{{ ytdSummary.present }}</td>
                <td :class="ytdSummary.absent > 0 ? 'text-danger' : ''">{{ ytdSummary.absent }}</td>
                <td>{{ ytdSummary.ot }}</td>
                <td>{{ ytdSummary.partial }}</td>
                <td>{{ ytdSummary.sl }}</td>
                <td>{{ ytdSummary.vl }}</td>
                <td>{{ ytdSummary.rest }}</td>
                <td>{{ ytdSummary.workingDays }}</td>
                <td>
                  <div class="progress" style="height: 8px; min-width: 80px">
                    <div
                      class="progress-bar bg-success"
                      :style="`width: ${ytdSummary.workingDays > 0 ? (ytdSummary.present / ytdSummary.workingDays * 100).toFixed(0) : 0}%`"
                    ></div>
                  </div>
                  <small>
                    {{
                      ytdSummary.workingDays > 0
                        ? (ytdSummary.present / ytdSummary.workingDays * 100).toFixed(1)
                        : 0
                    }}%
                  </small>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="d-md-none">
        <div
          v-for="month in data.months"
          :key="month.month"
          class="card shadow-sm mb-3"
          :class="!month.hasData ? 'border-0 bg-light' : ''"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0">{{ month.monthName }}</h6>
              <span v-if="month.hasData" class="small text-muted">
                {{ month.totalWorkingDays > 0 ? (month.attendanceRate * 100).toFixed(1) : 0 }}% attendance
              </span>
              <span v-else class="badge bg-secondary">No Data</span>
            </div>

            <div v-if="month.hasData">
              <!-- Progress bar -->
              <div class="progress mb-2" style="height: 6px">
                <div
                  class="progress-bar bg-success"
                  :style="`width: ${month.totalWorkingDays > 0 ? (month.attendanceRate * 100).toFixed(0) : 0}%`"
                ></div>
              </div>

              <div class="row text-center small">
                <div class="col-3 border-end">
                  <p class="text-muted mb-0">Present</p>
                  <p class="fw-bold text-success mb-0">{{ month.presentDays }}</p>
                </div>
                <div class="col-3 border-end">
                  <p class="text-muted mb-0">Absent</p>
                  <p class="fw-bold mb-0" :class="month.absentDays > 0 ? 'text-danger' : ''">{{ month.absentDays }}</p>
                </div>
                <div class="col-3 border-end">
                  <p class="text-muted mb-0">OT</p>
                  <p class="fw-bold mb-0">{{ month.otDays }}</p>
                </div>
                <div class="col-3">
                  <p class="text-muted mb-0">Working</p>
                  <p class="fw-bold mb-0">{{ month.totalWorkingDays }}</p>
                </div>
              </div>

              <div class="row text-center small mt-1" v-if="month.slDays > 0 || month.vlDays > 0 || month.partialDays > 0">
                <div class="col-4" v-if="month.slDays > 0">
                  <p class="text-muted mb-0">SL</p>
                  <p class="fw-semibold mb-0">{{ month.slDays }}</p>
                </div>
                <div class="col-4" v-if="month.vlDays > 0">
                  <p class="text-muted mb-0">VL</p>
                  <p class="fw-semibold mb-0">{{ month.vlDays }}</p>
                </div>
                <div class="col-4" v-if="month.partialDays > 0">
                  <p class="text-muted mb-0">Partial</p>
                  <p class="fw-semibold mb-0">{{ month.partialDays }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile YTD Summary -->
        <div class="card bg-dark text-white">
          <div class="card-header border-secondary">
            <span class="fw-bold">YTD Totals</span>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-6 border-end border-secondary mb-2">
                <p class="text-secondary small mb-0">Present</p>
                <p class="fw-bold text-success mb-0 fs-5">{{ ytdSummary.present }}</p>
              </div>
              <div class="col-6 mb-2">
                <p class="text-secondary small mb-0">Absent</p>
                <p class="fw-bold mb-0 fs-5" :class="ytdSummary.absent > 0 ? 'text-danger' : 'text-white'">{{ ytdSummary.absent }}</p>
              </div>
              <div class="col-6 border-end border-secondary">
                <p class="text-secondary small mb-0">OT Days</p>
                <p class="fw-bold text-primary mb-0 fs-5">{{ ytdSummary.ot }}</p>
              </div>
              <div class="col-6">
                <p class="text-secondary small mb-0">Working Days</p>
                <p class="fw-bold text-white mb-0 fs-5">{{ ytdSummary.workingDays }}</p>
              </div>
            </div>
            <hr class="border-secondary"/>
            <div class="text-center">
              <p class="text-secondary small mb-1">Overall Attendance Rate</p>
              <div class="progress mb-1" style="height: 8px">
                <div
                  class="progress-bar bg-success"
                  :style="`width: ${ytdSummary.workingDays > 0 ? (ytdSummary.present / ytdSummary.workingDays * 100).toFixed(0) : 0}%`"
                ></div>
              </div>
              <p class="fw-bold text-success mb-0">
                {{ ytdSummary.workingDays > 0 ? (ytdSummary.present / ytdSummary.workingDays * 100).toFixed(1) : 0 }}%
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import api from '@/api/axios.js'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

const employeeId   = route.params.employeeId
const currentYear  = new Date().getFullYear()
const selectedYear = ref(parseInt(route.params.year) || currentYear)
const data         = ref(null)
const loading      = ref(false)

const availableYears = computed(() => {
  const years = []
  for (let y = currentYear; y >= 2026; y--) {
    years.push(y)
  }
  return years
})

const ytdSummary = computed(() => {
  if (!data.value) return {}
  return data.value.months.reduce((acc, m) => {
    acc.present     += m.presentDays
    acc.absent      += m.absentDays
    acc.ot          += m.otDays
    acc.partial     += m.partialDays
    acc.sl          += m.slDays
    acc.vl          += m.vlDays
    acc.rest        += m.restDays
    acc.workingDays += 26
    return acc
  }, { present: 0, absent: 0, ot: 0, partial: 0, sl: 0, vl: 0, rest: 0, workingDays: 0 })
})

const fetchData = async () => {
  loading.value = true
  try {
    const res  = await api.get(`/employees/${employeeId}/13thmonth/${selectedYear.value}`)
    data.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())
</script>