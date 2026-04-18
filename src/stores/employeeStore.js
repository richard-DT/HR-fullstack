import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref([])
  const employee  = ref(null)
  const loading   = ref(false)
  const error     = ref(null)
  const summary = ref(null)

  const fetchEmployees = async () => {
    loading.value = true
    try {
      const res     = await api.get('/employees')
      employees.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching employees'
    } finally {
      loading.value = false
    }
  }

  const fetchEmployee = async (id) => {
    loading.value = true
    try {
      const res      = await api.get(`/employees/${id}`)
      employee.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching employee'
    } finally {
      loading.value = false
    }
  }

  // const fetchSummary = async (id) => {
  //   loading.value = true
  //   try {
  //     const res    = await api.get(`/employees/${id}/summary`)
  //     summary.value = res.data
  //   } catch (err) {
  //     error.value = err.response?.data?.message || 'Error fetching summary'
  //   } finally {
  //     loading.value = false
  //   }
  // }

  const fetchSummary = async (id) => {
    loading.value = true
    try {
      const [summaryRes, ytdRes] = await Promise.all([
        api.get(`/employees/${id}/summary`),
        api.get(`/employees/${id}/13thmonth/${new Date().getFullYear()}`),
      ])

      const data   = summaryRes.data
      const months = ytdRes.data.months
      const now    = new Date()
      const BASE_DAYS = 26

      let ytdPresent     = 0
      let ytdWorkingDays = 0
      let monthCount     = 0  // ← bagong counter

      for (const month of months) {
        monthCount++                        // ← count lahat ng months
        ytdPresent += month.presentDays     // ← sum ng present days
      }

      ytdWorkingDays = 26 * monthCount      // ← 26 × number of months

      const attendanceRate = ytdWorkingDays > 0
        ? (ytdPresent / ytdWorkingDays * 100).toFixed(1)
        : '0.0'

      summary.value = { ...data, attendanceRate }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching summary'
    } finally {
      loading.value = false
    }
  }

  const createEmployee = async (data) => {
    const res = await api.post('/employees', data)
    employees.value.push(res.data)
    return res.data
  }

  const updateEmployee = async (id, data) => {
    const res = await api.put(`/employees/${id}`, data)
    const idx = employees.value.findIndex(e => e._id === id)
    if (idx !== -1) employees.value[idx] = res.data
    return res.data
  }

  const updateSalary = async (id, data) => {
    const res = await api.put(`/employees/${id}/salary`, data)
    return res.data
  }

  const deleteEmployee = async (id) => {
    await api.delete(`/employees/${id}`)
    employees.value = employees.value.filter(e => e._id !== id)
  }

  return {
    employees, employee, loading, error, summary,
    fetchEmployees, fetchEmployee, fetchSummary,
    createEmployee, updateEmployee, updateSalary, deleteEmployee
  }
})