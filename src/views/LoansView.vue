<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-0">💰 Loans</h4>
        <small class="text-muted" v-if="selectedEmployee">{{ selectedEmployee.name }}</small>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="router.back()">
          ← Back
        </button>
        <button class="btn btn-dark" @click="openAddModal" v-if="authStore.isAdmin">
          + Add Loan
        </button>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="card shadow-sm d-none d-md-block">
      <div class="card-body p-0">
        <div v-if="loanStore.loading" class="text-center py-4">
          <div class="spinner-border text-secondary"></div>
        </div>
        <table v-else class="table table-hover mb-0">
          <thead class="table-dark">
            <tr>
              <th>Date Taken</th>
              <th>Principal</th>
              <!-- <th>Monthly Payment</th> -->
              <th>Balance</th>
              <th>Status</th>
              <th v-if="authStore.isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in loanStore.loans" :key="loan._id">
              <td>{{ formatDate(loan.dateTaken) }}</td>
              <td>₱{{ loan.principalAmount.toLocaleString() }}</td>
              <!-- <td>₱{ loan.monthlyPayment.toLocaleString() }}</td> -->
              <td class="fw-bold" :class="loan.balance > 0 ? 'text-danger' : 'text-success'">
                ₱{{ loan.balance.toLocaleString() }}
              </td>
              <td>
                <span :class="loan.isSettled ? 'badge bg-success' : 'badge bg-warning text-dark'">
                  {{ loan.isSettled ? 'Settled' : 'Active' }}
                </span>
              </td>
              <td v-if="authStore.isAdmin">
                <button
                  class="btn btn-sm btn-outline-primary me-1"
                  @click="openPaymentModal(loan)"
                  :disabled="loan.isSettled"
                >
                  💳 Pay
                </button>
                <button
                  class="btn btn-sm btn-outline-secondary me-1"
                  @click="openHistoryModal(loan)"
                >
                  📋 History
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="handleDelete(loan._id)"
                >
                  🗑️
                </button>
              </td>
            </tr>
            <tr v-if="loanStore.loans.length === 0">
              <td :colspan="authStore.isAdmin ? 6 : 5" class="text-center text-muted py-4">
                No loans found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="d-md-none">
      <div v-if="loanStore.loading" class="text-center py-4">
        <div class="spinner-border text-secondary"></div>
      </div>
      <div v-else>
        <div
          v-for="loan in loanStore.loans"
          :key="loan._id"
          class="card shadow-sm mb-3"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <p class="fw-bold mb-0">{{ formatDate(loan.dateTaken) }}</p>
                <small class="text-muted">Principal: ₱{{ loan.principalAmount.toLocaleString() }}</small>
              </div>
              <span :class="loan.isSettled ? 'badge bg-success' : 'badge bg-warning text-dark'">
                {{ loan.isSettled ? 'Settled' : 'Active' }}
              </span>
            </div>

            <div class="row text-center small mt-2">
              <div class="col-6 border-end">
                <!-- <p class="text-muted mb-0">Monthly Payment</p>
                <p class="fw-semibold mb-0">₱{ loan.monthlyPayment.toLocaleString() }}</p> -->
              </div>
              <div class="col-6">
                <p class="text-muted mb-0">Remaining Balance</p>
                <p class="fw-bold mb-0" :class="loan.balance > 0 ? 'text-danger' : 'text-success'">
                  ₱{{ loan.balance.toLocaleString() }}
                </p>
              </div>
            </div>

            <div class="d-flex gap-2 mt-3" v-if="authStore.isAdmin">
              <button
                class="btn btn-sm btn-outline-primary flex-grow-1"
                @click="openPaymentModal(loan)"
                :disabled="loan.isSettled"
              >
                💳 Pay
              </button>
              <button
                class="btn btn-sm btn-outline-secondary flex-grow-1"
                @click="openHistoryModal(loan)"
              >
                📋 History
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="handleDelete(loan._id)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        <p v-if="loanStore.loans.length === 0" class="text-center text-muted py-4">
          No loans found.
        </p>
      </div>
    </div>

    <!-- Add Loan Modal -->
    <div class="modal fade" id="addLoanModal" tabindex="-1" ref="addModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Add Loan</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Date Taken</label>
              <input v-model="form.dateTaken" type="date" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Principal Amount (₱)</label>
              <input v-model.number="form.principalAmount" type="number" class="form-control" placeholder="e.g. 10000" />
            </div>
            <!-- <div class="mb-3">
              <label class="form-label fw-semibold">Monthly Payment (₱)</label>
              <input v-model.number="form.monthlyPayment" type="number" class="form-control" placeholder="e.g. 1500" />
            </div> -->

            <!-- Preview -->
            <div class="alert alert-secondary py-2 small" v-if="form.principalAmount && form.monthlyPayment">
              <strong>Preview:</strong><br/>
              Estimated months to settle:
              {{ Math.ceil(form.principalAmount / form.monthlyPayment) }} months
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-dark" :disabled="saving" @click="handleAddLoan">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ saving ? 'Saving...' : 'Save Loan' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Payment Modal -->
    <div class="modal fade" id="paymentModal" tabindex="-1" ref="paymentModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Add Payment</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedLoan">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>

            <div class="alert alert-secondary py-2 small mb-3">
              <strong>Current Balance:</strong>
              ₱{{ selectedLoan.balance.toLocaleString() }}<br/>
              <!-- <strong>Monthly Payment:</strong>
              ₱{ selectedLoan.monthlyPayment.toLocaleString() }} -->
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Payment Date</label>
              <input v-model="paymentForm.month" type="date" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Amount Paid (₱)</label>
              <input v-model.number="paymentForm.amountPaid" type="number" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-dark" :disabled="saving" @click="handleAddPayment">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ saving ? 'Saving...' : 'Add Payment' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History Modal -->
    <div class="modal fade" id="historyModal" tabindex="-1" ref="historyModalRef">
      <div class="modal-dialog modal-fullscreen-sm-down">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">📋 Payment History</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedLoan">
            <div class="alert alert-secondary py-2 small mb-3">
              <strong>Principal:</strong> ₱{{ selectedLoan.principalAmount.toLocaleString() }}<br/>
              <strong>Remaining Balance:</strong>
              <span :class="selectedLoan.balance > 0 ? 'text-danger' : 'text-success'">
                ₱{{ selectedLoan.balance.toLocaleString() }}
              </span>
            </div>

            <table class="table table-sm table-bordered">
              <thead class="table-dark">
                <tr>
                  <th>Month</th>
                  <th>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in selectedLoan.payments" :key="payment.month">
                  <td>{{ formatDate(payment.month) }}</td>
                  <td>₱{{ payment.amountPaid.toLocaleString() }}</td>
                </tr>
                <tr v-if="selectedLoan.payments.length === 0">
                  <td colspan="2" class="text-center text-muted">No payments yet.</td>
                </tr>
              </tbody>
              <tfoot class="table-light fw-bold" v-if="selectedLoan.payments.length > 0">
                <tr>
                  <td>Total Paid:</td>
                  <td>₱{{ totalPaid.toLocaleString() }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { useAuthStore } from '@/stores/authStore.js'
import { useEmployeeStore } from '@/stores/employeeStore.js'
import { useLoanStore } from '@/stores/loanStore.js'

const route         = useRoute()
const router        = useRouter()
const authStore     = useAuthStore()
const employeeStore = useEmployeeStore()
const loanStore     = useLoanStore()

const employeeId       = route.params.employeeId
const selectedEmployee = ref(null)
const selectedLoan     = ref(null)

const addModalRef     = ref(null)
const paymentModalRef = ref(null)
const historyModalRef = ref(null)

let addModal     = null
let paymentModal = null
let historyModal = null

const form        = ref({ dateTaken: '', principalAmount: null, monthlyPayment: null })
const paymentForm = ref({ month: '', amountPaid: null })
const saving      = ref(false)
const formError   = ref(null)

const totalPaid = computed(() =>
  selectedLoan.value?.payments.reduce((sum, p) => sum + p.amountPaid, 0) || 0
)

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

onMounted(async () => {
  await employeeStore.fetchEmployee(employeeId)
  selectedEmployee.value = employeeStore.employee
  await loanStore.fetchLoans(employeeId)
  addModal     = new Modal(addModalRef.value)
  paymentModal = new Modal(paymentModalRef.value)
  historyModal = new Modal(historyModalRef.value)
})

const openAddModal = () => {
  formError.value = null
  form.value      = { dateTaken: '', principalAmount: null, monthlyPayment: null }
  addModal.show()
}

const openPaymentModal = (loan) => {
  formError.value  = null
  selectedLoan.value = loan
  paymentForm.value  = { month: '', amountPaid: loan.monthlyPayment }
  paymentModal.show()
}

const openHistoryModal = (loan) => {
  selectedLoan.value = loan
  historyModal.show()
}

const handleAddLoan = async () => {
  formError.value = null
  if (!form.value.dateTaken || !form.value.principalAmount || !form.value.monthlyPayment) {
    formError.value = 'All fields are required.'
    return
  }
  saving.value = true
  try {
    await loanStore.createLoan(employeeId, form.value)
    addModal.hide()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error saving loan.'
  } finally {
    saving.value = false
  }
}

const handleAddPayment = async () => {
  formError.value = null
  if (!paymentForm.value.month || !paymentForm.value.amountPaid) {
    formError.value = 'All fields are required.'
    return
  }
  saving.value = true
  try {
    await loanStore.addPayment(selectedLoan.value._id, paymentForm.value)
    paymentModal.hide()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error adding payment.'
  } finally {
    saving.value = false
  }
}

const handleDelete = async (loanId) => {
  if (!confirm('Delete this loan?')) return
  await loanStore.deleteLoan(loanId)
}
</script>