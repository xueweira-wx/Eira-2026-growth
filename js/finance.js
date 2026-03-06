// ========================================
// Finance Component - Expense Tracking
// ========================================

const FinanceComponent = {
  setup() {
    const { ref, computed, onMounted, watch, nextTick } = Vue

    // Sub-tab state
    const activeTab = ref('tracking') // 'tracking' or 'assets'

    // Current month navigation
    const currentYear = ref(new Date().getFullYear())
    const currentMonth = ref(new Date().getMonth()) // 0-indexed

    // Transaction data (reactive)
    const transactions = ref([])

    // Modal state
    const showModal = ref(false)
    const editingId = ref(null)

    // Form state
    const formType = ref('expense') // 'income' or 'expense'
    const formAmount = ref('')
    const formCategory = ref('')
    const formCategoryIcon = ref('')
    const formDate = ref(new Date().toISOString().slice(0, 10))
    const formNotes = ref('')

    // Category definitions
    const expenseCategories = [
      { name: '\u9910\u996e', icon: '\uD83C\uDF5C' },
      { name: '\u4ea4\u901a', icon: '\uD83D\uDE97' },
      { name: '\u8d2d\u7269', icon: '\uD83D\uDED2' },
      { name: '\u5a31\u4e50', icon: '\uD83C\uDFAE' },
      { name: '\u5c45\u4f4f', icon: '\uD83C\uDFE0' },
      { name: '\u7f8e\u5bb9', icon: '\uD83D\uDC84' },
      { name: '\u5b66\u4e60', icon: '\uD83D\uDCDA' },
      { name: '\u5176\u4ed6', icon: '\uD83D\uDCE6' }
    ]

    const incomeCategories = [
      { name: '\u5de5\u8d44', icon: '\uD83D\uDCB0' },
      { name: '\u526f\u4e1a', icon: '\uD83D\uDCBB' },
      { name: '\u6295\u8d44', icon: '\uD83D\uDCC8' },
      { name: '\u5176\u4ed6', icon: '\uD83D\uDCE6' }
    ]

    const currentCategories = computed(() => {
      return formType.value === 'expense' ? expenseCategories : incomeCategories
    })

    // Chart refs
    const barChartRef = ref(null)
    const pieChartRef = ref(null)
    const lineChartRef = ref(null)
    let barChartInstance = null
    let pieChartInstance = null
    let lineChartInstance = null

    // Load transactions from store
    const loadTransactions = () => {
      transactions.value = GrowthStore.get(GrowthStore.KEYS.TRANSACTIONS)
    }

    // Month display string
    const monthDisplay = computed(() => {
      return `${currentYear.value}\u5e74${currentMonth.value + 1}\u6708`
    })

    // Navigate months
    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }

    // Filtered transactions for current month
    const monthTransactions = computed(() => {
      return transactions.value.filter(t => {
        const d = new Date(t.date)
        return d.getFullYear() === currentYear.value && d.getMonth() === currentMonth.value
      })
    })

    // Monthly summary
    const monthIncome = computed(() => {
      return monthTransactions.value
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    })

    const monthExpense = computed(() => {
      return monthTransactions.value
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    })

    const monthBalance = computed(() => {
      return monthIncome.value - monthExpense.value
    })

    // Group transactions by date
    const groupedTransactions = computed(() => {
      const sorted = [...monthTransactions.value].sort((a, b) => new Date(b.date) - new Date(a.date))
      const groups = {}
      sorted.forEach(t => {
        const dateKey = t.date
        if (!groups[dateKey]) {
          groups[dateKey] = { date: dateKey, label: formatDateLabel(dateKey), items: [] }
        }
        groups[dateKey].items.push(t)
      })
      return Object.values(groups)
    })

    // Format date label like "3\u670806\u65e5 \u661f\u671f\u56db"
    const formatDateLabel = (dateStr) => {
      const d = new Date(dateStr + 'T00:00:00')
      const weekdays = ['\u661f\u671f\u65e5', '\u661f\u671f\u4e00', '\u661f\u671f\u4e8c', '\u661f\u671f\u4e09', '\u661f\u671f\u56db', '\u661f\u671f\u4e94', '\u661f\u671f\u516d']
      return `${d.getMonth() + 1}\u6708${d.getDate()}\u65e5 ${weekdays[d.getDay()]}`
    }

    // Format money
    const formatMoney = (val) => {
      return '\u00A5' + Number(val).toFixed(2)
    }

    // Open add modal
    const openAddModal = () => {
      editingId.value = null
      formType.value = 'expense'
      formAmount.value = ''
      formCategory.value = ''
      formCategoryIcon.value = ''
      formDate.value = new Date().toISOString().slice(0, 10)
      formNotes.value = ''
      showModal.value = true
    }

    // Open edit modal
    const openEditModal = (transaction) => {
      editingId.value = transaction.id
      formType.value = transaction.type
      formAmount.value = String(transaction.amount)
      formCategory.value = transaction.category
      formCategoryIcon.value = transaction.categoryIcon
      formDate.value = transaction.date
      formNotes.value = transaction.notes || ''
      showModal.value = true
    }

    // Close modal
    const closeModal = () => {
      showModal.value = false
    }

    // Select category
    const selectCategory = (cat) => {
      formCategory.value = cat.name
      formCategoryIcon.value = cat.icon
    }

    // Save transaction
    const saveTransaction = () => {
      const amount = parseFloat(formAmount.value)
      if (!amount || amount <= 0) {
        alert('\u8bf7\u8f93\u5165\u6709\u6548\u91d1\u989d')
        return
      }
      if (!formCategory.value) {
        alert('\u8bf7\u9009\u62e9\u5206\u7c7b')
        return
      }

      const data = {
        type: formType.value,
        amount: amount,
        category: formCategory.value,
        categoryIcon: formCategoryIcon.value,
        date: formDate.value,
        notes: formNotes.value
      }

      if (editingId.value) {
        GrowthStore.update(GrowthStore.KEYS.TRANSACTIONS, editingId.value, data)
      } else {
        GrowthStore.add(GrowthStore.KEYS.TRANSACTIONS, data)
      }

      loadTransactions()
      closeModal()
    }

    // Delete transaction
    const deleteTransaction = (id) => {
      if (confirm('\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u7b14\u8bb0\u5f55\u5417\uff1f')) {
        GrowthStore.remove(GrowthStore.KEYS.TRANSACTIONS, id)
        loadTransactions()
      }
    }

    // Reset category when type changes
    watch(formType, () => {
      formCategory.value = ''
      formCategoryIcon.value = ''
    })

    // ========================================
    // Charts
    // ========================================

    const vibrantColors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
      '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
      '#01a3a4', '#f368e0', '#ff6348', '#7bed9f'
    ]

    const renderCharts = () => {
      nextTick(() => {
        renderBarChart()
        renderPieChart()
        renderLineChart()
      })
    }

    const renderBarChart = () => {
      const canvas = barChartRef.value
      if (!canvas) return
      if (barChartInstance) barChartInstance.destroy()

      // Gather monthly data for the current year
      const yearTx = transactions.value.filter(t => {
        const d = new Date(t.date)
        return d.getFullYear() === currentYear.value
      })

      const monthsWithData = new Set()
      yearTx.forEach(t => {
        const d = new Date(t.date)
        monthsWithData.add(d.getMonth())
      })

      const sortedMonths = [...monthsWithData].sort((a, b) => a - b)
      if (sortedMonths.length === 0) return

      const labels = sortedMonths.map(m => `${m + 1}\u6708`)
      const incomeData = sortedMonths.map(m => {
        return yearTx
          .filter(t => t.type === 'income' && new Date(t.date).getMonth() === m)
          .reduce((s, t) => s + (Number(t.amount) || 0), 0)
      })
      const expenseData = sortedMonths.map(m => {
        return yearTx
          .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m)
          .reduce((s, t) => s + (Number(t.amount) || 0), 0)
      })

      barChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: '\u6536\u5165',
              data: incomeData,
              backgroundColor: 'rgba(0, 184, 148, 0.7)',
              borderColor: '#00b894',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: '\u652f\u51fa',
              data: expenseData,
              backgroundColor: 'rgba(255, 107, 107, 0.7)',
              borderColor: '#ff6b6b',
              borderWidth: 1,
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { size: 12 } } }
          },
          scales: {
            y: { beginAtZero: true, ticks: { font: { size: 11 } } },
            x: { ticks: { font: { size: 11 } } }
          }
        }
      })
    }

    const renderPieChart = () => {
      const canvas = pieChartRef.value
      if (!canvas) return
      if (pieChartInstance) pieChartInstance.destroy()

      const expenses = monthTransactions.value.filter(t => t.type === 'expense')
      if (expenses.length === 0) return

      const catMap = {}
      expenses.forEach(t => {
        const key = t.category
        catMap[key] = (catMap[key] || 0) + (Number(t.amount) || 0)
      })

      const labels = Object.keys(catMap)
      const data = Object.values(catMap)
      const total = data.reduce((s, v) => s + v, 0)

      pieChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: vibrantColors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 11 }, padding: 12 }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  const val = ctx.raw
                  const pct = ((val / total) * 100).toFixed(1)
                  return `${ctx.label}: \u00A5${val.toFixed(2)} (${pct}%)`
                }
              }
            }
          }
        }
      })
    }

    const renderLineChart = () => {
      const canvas = lineChartRef.value
      if (!canvas) return
      if (lineChartInstance) lineChartInstance.destroy()

      const yearTx = transactions.value.filter(t => {
        const d = new Date(t.date)
        return d.getFullYear() === currentYear.value
      })

      const monthsWithData = new Set()
      yearTx.forEach(t => {
        const d = new Date(t.date)
        monthsWithData.add(d.getMonth())
      })

      const sortedMonths = [...monthsWithData].sort((a, b) => a - b)
      if (sortedMonths.length === 0) return

      const labels = sortedMonths.map(m => `${m + 1}\u6708`)
      const balanceData = sortedMonths.map(m => {
        const inc = yearTx
          .filter(t => t.type === 'income' && new Date(t.date).getMonth() === m)
          .reduce((s, t) => s + (Number(t.amount) || 0), 0)
        const exp = yearTx
          .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m)
          .reduce((s, t) => s + (Number(t.amount) || 0), 0)
        return inc - exp
      })

      lineChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '\u6708\u7ed3\u4f59',
            data: balanceData,
            borderColor: '#6c5ce7',
            backgroundColor: 'rgba(108, 92, 231, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#6c5ce7',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { size: 12 } } }
          },
          scales: {
            y: { ticks: { font: { size: 11 } } },
            x: { ticks: { font: { size: 11 } } }
          }
        }
      })
    }

    // Watch for data / month changes to re-render charts
    watch([transactions, currentMonth, currentYear], () => {
      if (activeTab.value === 'tracking') {
        renderCharts()
      }
    }, { deep: true })

    watch(activeTab, (val) => {
      if (val === 'tracking') {
        renderCharts()
      }
    })

    onMounted(() => {
      loadTransactions()
      nextTick(() => {
        renderCharts()
      })
    })

    return {
      activeTab,
      currentYear,
      currentMonth,
      transactions,
      showModal,
      editingId,
      formType,
      formAmount,
      formCategory,
      formCategoryIcon,
      formDate,
      formNotes,
      currentCategories,
      monthDisplay,
      prevMonth,
      nextMonth,
      monthIncome,
      monthExpense,
      monthBalance,
      groupedTransactions,
      formatMoney,
      openAddModal,
      openEditModal,
      closeModal,
      selectCategory,
      saveTransaction,
      deleteTransaction,
      barChartRef,
      pieChartRef,
      lineChartRef
    }
  },
  template: `
    <div class="page finance-page">
      <!-- Sub-tabs -->
      <div class="finance-tabs">
        <button
          class="finance-tab"
          :class="{ active: activeTab === 'tracking' }"
          @click="activeTab = 'tracking'"
        >\u8bb0\u8d26</button>
        <button
          class="finance-tab"
          :class="{ active: activeTab === 'assets' }"
          @click="activeTab = 'assets'"
        >\u8d44\u4ea7</button>
      </div>

      <!-- Tracking Tab -->
      <div v-if="activeTab === 'tracking'">
        <!-- Month Navigation & Summary -->
        <div class="finance-summary-bar">
          <div class="month-nav">
            <button class="month-arrow" @click="prevMonth">&lsaquo;</button>
            <span class="month-label">{{ monthDisplay }}</span>
            <button class="month-arrow" @click="nextMonth">&rsaquo;</button>
          </div>
          <div class="summary-figures">
            <span class="summary-item income">\u6536\u5165 \u00A5{{ monthIncome.toFixed(2) }}</span>
            <span class="summary-divider">|</span>
            <span class="summary-item expense">\u652f\u51fa \u00A5{{ monthExpense.toFixed(2) }}</span>
            <span class="summary-divider">|</span>
            <span class="summary-item" :class="monthBalance >= 0 ? 'income' : 'expense'">\u7ed3\u4f59 \u00A5{{ monthBalance.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Transaction List -->
        <div class="transaction-list">
          <div v-if="groupedTransactions.length === 0" class="empty-state">
            <div class="empty-icon">\uD83D\uDCDD</div>
            <p>\u672c\u6708\u8fd8\u6ca1\u6709\u8bb0\u5f55\uff0c\u70b9\u51fb + \u5f00\u59cb\u8bb0\u8d26\u5427</p>
          </div>
          <div v-for="group in groupedTransactions" :key="group.date" class="transaction-group">
            <div class="transaction-date-header">{{ group.label }}</div>
            <div class="transaction-card">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="transaction-row"
                @click="openEditModal(item)"
              >
                <div class="transaction-left">
                  <span class="transaction-emoji">{{ item.categoryIcon }}</span>
                  <div class="transaction-info">
                    <span class="transaction-category">{{ item.category }}</span>
                    <span v-if="item.notes" class="transaction-notes">{{ item.notes }}</span>
                  </div>
                </div>
                <div class="transaction-right">
                  <span
                    class="transaction-amount"
                    :class="item.type === 'income' ? 'amount-income' : 'amount-expense'"
                  >{{ item.type === 'income' ? '+' : '-' }}\u00A5{{ Number(item.amount).toFixed(2) }}</span>
                  <button class="transaction-delete" @click.stop="deleteTransaction(item.id)">&times;</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="finance-charts">
          <div class="chart-card">
            <h3 class="chart-title">\u6708\u5ea6\u6536\u652f\u5bf9\u6bd4</h3>
            <div class="chart-container">
              <canvas :ref="el => barChartRef = el"></canvas>
            </div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">\u672c\u6708\u652f\u51fa\u5206\u5e03</h3>
            <div class="chart-container">
              <canvas :ref="el => pieChartRef = el"></canvas>
            </div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">\u5e74\u5ea6\u7ed3\u4f59\u8d8b\u52bf</h3>
            <div class="chart-container">
              <canvas :ref="el => lineChartRef = el"></canvas>
            </div>
          </div>
        </div>

        <!-- Add Button -->
        <button class="finance-add-btn" @click="openAddModal">+</button>
      </div>

      <!-- Assets Tab (placeholder) -->
      <div v-if="activeTab === 'assets'">
        <div class="placeholder-page">
          <div class="icon">\uD83C\uDFE6</div>
          <h2>\u8d44\u4ea7\u89c4\u5212</h2>
          <p>\u8d44\u4ea7\u7ba1\u7406\u529f\u80fd\u5373\u5c06\u4e0a\u7ebf</p>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content finance-modal">
          <div class="modal-header">
            <span class="modal-title">{{ editingId ? '\u7f16\u8f91\u8bb0\u5f55' : '\u65b0\u589e\u8bb0\u5f55' }}</span>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>

          <!-- Type Toggle -->
          <div class="type-toggle">
            <button
              class="type-btn"
              :class="{ 'type-expense-active': formType === 'expense' }"
              @click="formType = 'expense'"
            >\u652f\u51fa</button>
            <button
              class="type-btn"
              :class="{ 'type-income-active': formType === 'income' }"
              @click="formType = 'income'"
            >\u6536\u5165</button>
          </div>

          <!-- Amount Input -->
          <div class="amount-input-wrapper">
            <span class="amount-prefix">\u00A5</span>
            <input
              type="number"
              class="amount-input"
              v-model="formAmount"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <!-- Category Grid -->
          <div class="form-group">
            <label class="form-label">\u9009\u62e9\u5206\u7c7b</label>
            <div class="category-grid">
              <div
                v-for="cat in currentCategories"
                :key="cat.name"
                class="category-cell"
                :class="{ 'category-selected': formCategory === cat.name, 'category-expense-selected': formCategory === cat.name && formType === 'expense', 'category-income-selected': formCategory === cat.name && formType === 'income' }"
                @click="selectCategory(cat)"
              >
                <span class="category-icon">{{ cat.icon }}</span>
                <span class="category-name">{{ cat.name }}</span>
              </div>
            </div>
          </div>

          <!-- Date Picker -->
          <div class="form-group">
            <label class="form-label">\u65e5\u671f</label>
            <input type="date" class="form-input" v-model="formDate" />
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label">\u5907\u6ce8</label>
            <input type="text" class="form-input" v-model="formNotes" placeholder="\u53ef\u9009\uff0c\u8bb0\u5f55\u8be6\u60c5..." />
          </div>

          <!-- Save Button -->
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="saveTransaction">
            {{ editingId ? '\u4fdd\u5b58\u4fee\u6539' : '\u4fdd\u5b58' }}
          </button>
        </div>
      </div>
    </div>
  `
}
