<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-0">📊 13th Month Pay</h4>
        <small class="text-muted" v-if="data">{{ data.employee.name }} — {{ data.year }}</small>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="router.back()">
          ← Back
        </button>
        <!-- Year selector -->
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
      <!-- YTD Summary Card -->
      <div class="card bg-dark text-white shadow-sm mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col">
              <p class="text-secondary mb-1 small">Year-to-Date 13th Month Pay</p>
              <h2 class="fw-bold mb-0">₱{{ data.ytdTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</h2>
            </div>
            <div class="col-auto">
              <span style="font-size: 3rem">🎄</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="card shadow-sm d-none d-md-block">
        <div class="card-header bg-white fw-semibold">
          Monthly Breakdown — {{ data.year }}
        </div>
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>Month</th>
                <th>Present</th>
                <th>Absent</th>
                <th>OT Days</th>
                <th>SL</th>
                <th>VL</th>
                <th>Working Days</th>
                <th>Monthly Rate</th>
                <th>13th Month Share</th>
                <th v-if="authStore.isAdmin">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="month in data.months" :key="month.month"
                :class="!month.hasData ? 'table-light text-muted' : ''"
              >
                <td class="fw-semibold">{{ month.monthName }}</td>
                <td>{{ month.hasData ? month.presentDays : '—' }}</td>
                <td>
                  <span v-if="month.hasData" :class="month.absentDays > 0 ? 'text-danger fw-bold' : ''">
                    {{ month.absentDays }}
                  </span>
                  <span v-else>—</span>
                </td>
                <td>{{ month.hasData ? month.otDays : '—' }}</td>
                <td>{{ month.hasData ? month.slDays : '—' }}</td>
                <td>{{ month.hasData ? month.vlDays : '—' }}</td>
                <td>{{ month.hasData ? month.totalWorkingDays : '—' }}</td>
                <td>{{ month.hasData ? `₱${month.monthlyRate.toLocaleString()}` : '—' }}</td>
                <td class="fw-bold" :class="month.share > 0 ? 'text-success' : ''">
                  {{ month.hasData ? `₱${month.share.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—' }}
                </td>
                <td v-if="authStore.isAdmin">
                  <span v-if="!month.hasData" class="badge bg-secondary">No Data</span>
                  <span v-else class="badge bg-success">Computed</span>
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light">
              <tr>
                <td colspan="8" class="text-end fw-bold">YTD Total:</td>
                <td class="fw-bold text-success">
                  ₱{{ data.ytdTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
                </td>
                <td v-if="authStore.isAdmin"></td>
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
              <span v-if="month.hasData" class="fw-bold text-success">
                ₱{{ month.share.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
              </span>
              <span v-else class="badge bg-secondary">No Data</span>
            </div>

            <div v-if="month.hasData">
              <div class="row text-center small">
                <div class="col-3 border-end">
                  <p class="text-muted mb-0">Present</p>
                  <p class="fw-semibold mb-0">{{ month.presentDays }}</p>
                </div>
                <div class="col-3 border-end">
                  <p class="text-muted mb-0">Absent</p>
                  <p class="fw-semibold mb-0" :class="month.absentDays > 0 ? 'text-danger' : ''">
                    {{ month.absentDays }}
                  </p>
                </div>
                <div class="col-3 border-end">
                  <p class="text-muted mb-0">OT Days</p>
                  <p class="fw-semibold mb-0">{{ month.otDays }}</p>
                </div>
                <div class="col-3">
                  <p class="text-muted mb-0">Working</p>
                  <p class="fw-semibold mb-0">{{ month.totalWorkingDays }}</p>
                </div>
              </div>
              <div class="mt-2 small text-muted text-center">
                Rate: ₱{{ month.monthlyRate.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile YTD Total -->
        <div class="card bg-dark text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <span class="fw-bold">YTD Total:</span>
            <span class="fw-bold text-success fs-5">
              ₱{{ data.ytdTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import api from '@/api/axios.js'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

const employeeId  = route.params.employeeId
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const data         = ref(null)
const loading      = ref(false)

const availableYears = computed(() => {
  const years = []
  for (let y = currentYear; y >= 2026; y--) {
    years.push(y)
  }
  return years
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

onMounted(() => {
  console.log('employeeId:', employeeId)
  console.log('year:', selectedYear.value)
  fetchData()
})

</script>