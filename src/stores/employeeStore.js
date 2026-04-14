import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref([])
  const employee  = ref(null)
  const loading   = ref(false)
  const error     = ref(null)

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
    employees, employee, loading, error,
    fetchEmployees, fetchEmployee,
    createEmployee, updateEmployee, updateSalary, deleteEmployee
  }
})