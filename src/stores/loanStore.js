import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'

export const useLoanStore = defineStore('loan', () => {
  const loans   = ref([])
  const loan    = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  const fetchLoans = async (employeeId) => {
    loading.value = true
    try {
      const res   = await api.get(`/loans/${employeeId}`)
      loans.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching loans'
    } finally {
      loading.value = false
    }
  }

  const createLoan = async (employeeId, data) => {
    const res = await api.post(`/loans/${employeeId}`, data)
    loans.value.unshift(res.data)
    return res.data
  }

  const addPayment = async (loanId, data) => {
    const res = await api.post(`/loans/detail/${loanId}/pay`, data)
    const idx = loans.value.findIndex(l => l._id === loanId)
    if (idx !== -1) loans.value[idx] = res.data
    return res.data
  }

  const deleteLoan = async (loanId) => {
    await api.delete(`/loans/detail/${loanId}`)
    loans.value = loans.value.filter(l => l._id !== loanId)
  }

  return {
    loans, loan, loading, error,
    fetchLoans, createLoan, addPayment, deleteLoan
  }
})