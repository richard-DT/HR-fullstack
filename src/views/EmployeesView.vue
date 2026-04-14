<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0">👥 Employees</h4>
      <button class="btn btn-dark" @click="openAddModal">
        + Add Employee
      </button>
    </div>

    <!-- Table -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="employeeStore.loading" class="text-center py-4">
          <div class="spinner-border text-secondary"></div>
        </div>
        <table v-else class="table table-hover mb-0">
          <thead class="table-dark">
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Hire Date</th>
              <th>Monthly Rate</th>
              <th>Daily Rate</th>
              <th>Gross Monthly</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employeeStore.employees" :key="emp._id">
              <td class="fw-semibold">{{ emp.name }}</td>
              <td>{{ emp.position || '—' }}</td>
              <td>{{ formatDate(emp.hireDate) }}</td>
              <td>₱{{ emp.monthlyRate.toLocaleString() }}</td>
              <td>₱{{ emp.dailyRate.toFixed(2) }}</td>
              <td>₱{{ emp.grossMonthlyPay.toLocaleString() }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" @click="openSalaryModal(emp)">
                  💰 Salary
                </button>
                <RouterLink :to="`/attendance/${emp._id}`" class="btn btn-sm btn-outline-secondary me-1">
                  📋 Payslips
                </RouterLink>
                <RouterLink :to="`/loans/${emp._id}`" class="btn btn-sm btn-outline-success me-1">
                  🏦 Loans
                </RouterLink>
                <button class="btn btn-sm btn-outline-danger" @click="openCreateUserModal(emp)">
                  👤 Account
                </button>
              </td>
            </tr>
            <tr v-if="employeeStore.employees.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No employees yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <div class="modal fade" id="addEmployeeModal" tabindex="-1" ref="addModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Add Employee</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Full Name</label>
              <input v-model="form.name" type="text" class="form-control" placeholder="e.g. Juan Dela Cruz" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Position</label>
              <input v-model="form.position" type="text" class="form-control" placeholder="e.g. Cook" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Hire Date</label>
              <input v-model="form.hireDate" type="date" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Monthly Rate (₱)</label>
              <input v-model.number="form.monthlyRate" type="number" class="form-control" placeholder="e.g. 13000" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Variable Bonus (₱)</label>
              <input v-model.number="form.variableBonus" type="number" class="form-control" placeholder="0" />
            </div>

            <!-- Computed preview -->
            <div class="alert alert-secondary py-2 small" v-if="form.monthlyRate">
              <strong>Preview:</strong><br/>
              Daily Rate: ₱{{ (form.monthlyRate / 26).toFixed(2) }}<br/>
              Restday Pay: ₱{{ ((form.monthlyRate / 26) * 4).toFixed(2) }}<br/>
              Gross Monthly: ₱{{ (form.monthlyRate + (form.monthlyRate / 26) * 4).toLocaleString() }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-dark" :disabled="saving" @click="handleAddEmployee">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ saving ? 'Saving...' : 'Save Employee' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Salary Modal -->
    <div class="modal fade" id="salaryModal" tabindex="-1" ref="salaryModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Update Salary — {{ selectedEmployee?.name }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>

            <!-- Salary History -->
            <div class="mb-3" v-if="selectedEmployee?.salaryHistory?.length">
              <label class="form-label fw-semibold">Salary History</label>
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Effective Date</th>
                    <th>Monthly Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in selectedEmployee.salaryHistory" :key="h.effectiveDate">
                    <td>{{ formatDate(h.effectiveDate) }}</td>
                    <td>₱{{ h.monthlyRate.toLocaleString() }}</td>
                    <td>
                      <span v-if="h.isCurrent" class="badge bg-success">Current</span>
                      <span v-else class="badge bg-secondary">Previous</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr/>
            <label class="form-label fw-semibold">New Monthly Rate (₱)</label>
            <input v-model.number="salaryForm.monthlyRate" type="number" class="form-control mb-2" />
            <label class="form-label fw-semibold">Effective Date</label>
            <input v-model="salaryForm.effectiveDate" type="date" class="form-control" />

            <!-- Preview -->
            <div class="alert alert-secondary py-2 small mt-3" v-if="salaryForm.monthlyRate">
              <strong>Preview:</strong><br/>
              Daily Rate: ₱{{ (salaryForm.monthlyRate / 26).toFixed(2) }}<br/>
              Restday Pay: ₱{{ ((salaryForm.monthlyRate / 26) * 4).toFixed(2) }}<br/>
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

    <!-- Create User Account Modal -->
    <div class="modal fade" id="createUserModal" tabindex="-1" ref="createUserModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Create Account — {{ selectedEmployee?.name }}</h5>
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
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useEmployeeStore } from '@/stores/employeeStore.js'
import api from '@/api/axios.js'

const employeeStore = useEmployeeStore()

const addModalRef        = ref(null)
const salaryModalRef     = ref(null)
const createUserModalRef = ref(null)

let addModal        = null
let salaryModal     = null
let createUserModal = null

const form             = ref({ name: '', position: '', hireDate: '', monthlyRate: null, variableBonus: 0 })
const salaryForm       = ref({ monthlyRate: null, effectiveDate: '' })
const userForm         = ref({ username: '', password: '' })
const selectedEmployee = ref(null)
const saving           = ref(false)
const formError        = ref(null)
const formSuccess      = ref(null)

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

onMounted(async () => {
  await employeeStore.fetchEmployees()
  addModal        = new Modal(addModalRef.value)
  salaryModal     = new Modal(salaryModalRef.value)
  createUserModal = new Modal(createUserModalRef.value)
})

const openAddModal = () => {
  formError.value = null
  form.value      = { name: '', position: '', hireDate: '', monthlyRate: null, variableBonus: 0 }
  addModal.show()
}

const openSalaryModal = (emp) => {
  formError.value      = null
  selectedEmployee.value = emp
  salaryForm.value     = { monthlyRate: emp.monthlyRate, effectiveDate: '' }
  salaryModal.show()
}

const openCreateUserModal = (emp) => {
  formError.value        = null
  formSuccess.value      = null
  selectedEmployee.value = emp
  userForm.value         = { username: '', password: '' }
  createUserModal.show()
}

const handleAddEmployee = async () => {
  formError.value = null
  if (!form.value.name || !form.value.hireDate || !form.value.monthlyRate) {
    formError.value = 'Name, Hire Date, and Monthly Rate are required.'
    return
  }
  saving.value = true
  try {
    await employeeStore.createEmployee(form.value)
    addModal.hide()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error saving employee.'
  } finally {
    saving.value = false
  }
}

const handleUpdateSalary = async () => {
  formError.value = null
  if (!salaryForm.value.monthlyRate || !salaryForm.value.effectiveDate) {
    formError.value = 'Monthly Rate and Effective Date are required.'
    return
  }
  saving.value = true
  try {
    await employeeStore.updateSalary(selectedEmployee.value._id, salaryForm.value)
    await employeeStore.fetchEmployees()
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
    formError.value = 'Username and Password are required.'
    return
  }
  saving.value = true
  try {
    await api.post('/auth/register', {
      name:       selectedEmployee.value.name,
      username:   userForm.value.username,
      password:   userForm.value.password,
      role:       'employee',
      employeeId: selectedEmployee.value._id,
    })
    formSuccess.value = `Account created for ${selectedEmployee.value.name}!`
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error creating account.'
  } finally {
    saving.value = false
  }
}
</script>