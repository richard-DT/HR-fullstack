import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'

export const useAttendanceStore = defineStore('attendance', () => {
  const weeks   = ref([])
  const week    = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  const fetchWeeks = async (employeeId) => {
    loading.value = true
    try {
      const res   = await api.get(`/attendance/${employeeId}`)
      weeks.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching attendance'
    } finally {
      loading.value = false
    }
  }

  const fetchWeek = async (weekId) => {
    loading.value = true
    try {
      const res  = await api.get(`/attendance/week/${weekId}`)
      week.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching payslip'
    } finally {
      loading.value = false
    }
  }

  const createWeek = async (employeeId, data) => {
    const res = await api.post(`/attendance/${employeeId}`, data)
    weeks.value.unshift(res.data)
    return res.data
  }

  const updateWeek = async (weekId, data) => {
    const res = await api.put(`/attendance/week/${weekId}`, data)
    const idx = weeks.value.findIndex(w => w._id === weekId)
    if (idx !== -1) weeks.value[idx] = res.data
    return res.data
  }

  const deleteWeek = async (weekId) => {
    await api.delete(`/attendance/week/${weekId}`)
    weeks.value = weeks.value.filter(w => w._id !== weekId)
  }

  // async updateWeek(weekId, data) {
  //   await api.put(`/attendance/${weekId}`, data)
  //   await this.fetchWeeks(this.employeeId)
  // }

  // const fetchYTD = async (employeeId, year) => {
  //   const res = await api.get(`/employees/${employeeId}/13thmonth/${year}`)
  //   return res.data
  // }

  return {
    weeks, week, loading, error,
    fetchWeeks, fetchWeek,
    createWeek, updateWeek, deleteWeek
  }
})