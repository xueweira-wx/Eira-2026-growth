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

    // ========================================
    // Asset Planning
    // ========================================
    const assets = ref([])
    const assetSnapshots = ref([])
    const showAssetModal = ref(false)
    const editingAssetId = ref(null)
    const assetFormName = ref('')
    const assetFormType = ref('bank')
    const assetFormBalance = ref('')

    // Quick balance update state
    const showBalanceModal = ref(false)
    const balanceUpdateAssetId = ref(null)
    const balanceUpdateValue = ref('')

    // Net worth chart ref
    const netWorthChartRef = ref(null)
    let netWorthChartInstance = null

    const assetTypeOptions = [
      { value: 'bank', label: '\u94f6\u884c\u5b58\u6b3e', icon: '\uD83C\uDFE6' },
      { value: 'fund', label: '\u57fa\u91d1', icon: '\uD83D\uDCCA' },
      { value: 'stock', label: '\u80a1\u7968', icon: '\uD83D\uDCC8' },
      { value: 'investment', label: '\u5176\u4ed6\u6295\u8d44', icon: '\uD83D\uDC8E' },
      { value: 'debt', label: '\u8d1f\u503a', icon: '\uD83D\uDCB3' }
    ]

    const loadAssets = () => {
      assets.value = GrowthStore.get(GrowthStore.KEYS.ASSETS)
      assetSnapshots.value = GrowthStore.get(GrowthStore.KEYS.ASSET_SNAPSHOTS)
    }

    const totalAssets = computed(() => {
      return assets.value
        .filter(a => a.type !== 'debt')
        .reduce((sum, a) => sum + (Number(a.balance) || 0), 0)
    })

    const totalDebts = computed(() => {
      return assets.value
        .filter(a => a.type === 'debt')
        .reduce((sum, a) => sum + (Number(a.balance) || 0), 0)
    })

    const netWorth = computed(() => {
      return totalAssets.value - totalDebts.value
    })

    const getAssetTypeInfo = (type) => {
      return assetTypeOptions.find(o => o.value === type) || assetTypeOptions[0]
    }

    const getAssetLastUpdated = (assetId) => {
      const snaps = assetSnapshots.value
        .filter(s => s.assetId === assetId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      if (snaps.length > 0) return snaps[0].date
      const asset = assets.value.find(a => a.id === assetId)
      return asset ? asset.createdAt.slice(0, 10) : ''
    }

    const openAddAssetModal = () => {
      editingAssetId.value = null
      assetFormName.value = ''
      assetFormType.value = 'bank'
      assetFormBalance.value = ''
      showAssetModal.value = true
    }

    const openEditAssetModal = (asset) => {
      editingAssetId.value = asset.id
      assetFormName.value = asset.name
      assetFormType.value = asset.type
      assetFormBalance.value = String(asset.balance)
      showAssetModal.value = true
    }

    const closeAssetModal = () => {
      showAssetModal.value = false
    }

    const saveAsset = () => {
      const balance = parseFloat(assetFormBalance.value)
      if (!assetFormName.value.trim()) {
        alert('\u8bf7\u8f93\u5165\u8d26\u6237\u540d\u79f0')
        return
      }
      if (isNaN(balance)) {
        alert('\u8bf7\u8f93\u5165\u6709\u6548\u4f59\u989d')
        return
      }

      const typeInfo = getAssetTypeInfo(assetFormType.value)
      const data = {
        name: assetFormName.value.trim(),
        type: assetFormType.value,
        typeLabel: typeInfo.label,
        typeIcon: typeInfo.icon,
        balance: balance
      }

      if (editingAssetId.value) {
        GrowthStore.update(GrowthStore.KEYS.ASSETS, editingAssetId.value, data)
        // Also add a snapshot for the balance update
        GrowthStore.add(GrowthStore.KEYS.ASSET_SNAPSHOTS, {
          assetId: editingAssetId.value,
          balance: balance,
          date: new Date().toISOString().slice(0, 10)
        })
      } else {
        const saved = GrowthStore.add(GrowthStore.KEYS.ASSETS, data)
        // Create initial snapshot
        GrowthStore.add(GrowthStore.KEYS.ASSET_SNAPSHOTS, {
          assetId: saved.id,
          balance: balance,
          date: new Date().toISOString().slice(0, 10)
        })
      }

      loadAssets()
      closeAssetModal()
      nextTick(() => renderNetWorthChart())
    }

    const deleteAsset = () => {
      if (!editingAssetId.value) return
      if (confirm('\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u4e2a\u8d26\u6237\u5417\uff1f')) {
        // Remove snapshots for this asset
        const snaps = assetSnapshots.value.filter(s => s.assetId === editingAssetId.value)
        snaps.forEach(s => GrowthStore.remove(GrowthStore.KEYS.ASSET_SNAPSHOTS, s.id))
        GrowthStore.remove(GrowthStore.KEYS.ASSETS, editingAssetId.value)
        loadAssets()
        closeAssetModal()
        nextTick(() => renderNetWorthChart())
      }
    }

    // Quick balance update
    const openBalanceUpdate = (asset) => {
      balanceUpdateAssetId.value = asset.id
      balanceUpdateValue.value = String(asset.balance)
      showBalanceModal.value = true
    }

    const closeBalanceModal = () => {
      showBalanceModal.value = false
    }

    const saveBalanceUpdate = () => {
      const balance = parseFloat(balanceUpdateValue.value)
      if (isNaN(balance)) {
        alert('\u8bf7\u8f93\u5165\u6709\u6548\u4f59\u989d')
        return
      }

      GrowthStore.update(GrowthStore.KEYS.ASSETS, balanceUpdateAssetId.value, { balance: balance })
      GrowthStore.add(GrowthStore.KEYS.ASSET_SNAPSHOTS, {
        assetId: balanceUpdateAssetId.value,
        balance: balance,
        date: new Date().toISOString().slice(0, 10)
      })

      loadAssets()
      closeBalanceModal()
      nextTick(() => renderNetWorthChart())
    }

    // Net Worth Trend Chart
    const netWorthSnapshots = computed(() => {
      // Group snapshots by date, calculate net worth for each date
      const dateMap = {}
      assetSnapshots.value.forEach(s => {
        if (!dateMap[s.date]) dateMap[s.date] = {}
        // Keep the latest snapshot per asset per date
        dateMap[s.date][s.assetId] = s.balance
      })

      // For each date, compute the net worth using the last known balance for each asset
      const allDates = Object.keys(dateMap).sort()
      if (allDates.length < 2) return []

      const assetBalances = {} // running balance per asset
      const result = []

      allDates.forEach(date => {
        // Update known balances
        Object.entries(dateMap[date]).forEach(([assetId, bal]) => {
          assetBalances[assetId] = bal
        })

        // Calculate net worth from all known balances
        let totalA = 0
        let totalD = 0
        Object.entries(assetBalances).forEach(([assetId, bal]) => {
          const asset = assets.value.find(a => a.id === assetId)
          if (asset && asset.type === 'debt') {
            totalD += Number(bal) || 0
          } else {
            totalA += Number(bal) || 0
          }
        })

        result.push({ date, netWorth: totalA - totalD })
      })

      return result
    })

    const renderNetWorthChart = () => {
      const canvas = netWorthChartRef.value
      if (!canvas) return
      if (netWorthChartInstance) netWorthChartInstance.destroy()

      const data = netWorthSnapshots.value
      if (data.length < 2) return

      const labels = data.map(d => d.date.slice(5)) // MM-DD
      const values = data.map(d => d.netWorth)

      const ctx = canvas.getContext('2d')
      const gradient = ctx.createLinearGradient(0, 0, 0, 220)
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)')
      gradient.addColorStop(1, 'rgba(102, 126, 234, 0.02)')

      netWorthChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '\u51c0\u8d44\u4ea7',
            data: values,
            borderColor: '#667eea',
            backgroundColor: gradient,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  return '\u51c0\u8d44\u4ea7: \u00A5' + ctx.raw.toLocaleString()
                }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                font: { size: 11 },
                callback: function(val) { return '\u00A5' + (val >= 10000 ? (val / 10000).toFixed(1) + '\u4e07' : val) }
              }
            },
            x: { ticks: { font: { size: 10 } } }
          }
        }
      })
    }

    const formatAssetMoney = (val) => {
      const num = Number(val)
      if (Math.abs(num) >= 10000) {
        return '\u00A5' + (num / 10000).toFixed(2) + '\u4e07'
      }
      return '\u00A5' + num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }

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
      if (val === 'assets') {
        loadAssets()
        nextTick(() => renderNetWorthChart())
      }
    })

    onMounted(() => {
      loadTransactions()
      loadAssets()
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
      lineChartRef,
      // Asset planning
      assets,
      assetSnapshots,
      showAssetModal,
      editingAssetId,
      assetFormName,
      assetFormType,
      assetFormBalance,
      showBalanceModal,
      balanceUpdateAssetId,
      balanceUpdateValue,
      netWorthChartRef,
      assetTypeOptions,
      totalAssets,
      totalDebts,
      netWorth,
      netWorthSnapshots,
      getAssetTypeInfo,
      getAssetLastUpdated,
      openAddAssetModal,
      openEditAssetModal,
      closeAssetModal,
      saveAsset,
      deleteAsset,
      openBalanceUpdate,
      closeBalanceModal,
      saveBalanceUpdate,
      formatAssetMoney
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

      <!-- Assets Tab -->
      <div v-if="activeTab === 'assets'" class="asset-tab-content">
        <!-- Net Worth Summary -->
        <div class="net-worth-summary" :class="netWorth >= 0 ? 'nw-positive' : 'nw-negative'">
          <div class="nw-label">\u51C0\u8D44\u4EA7</div>
          <div class="nw-amount">{{ formatAssetMoney(netWorth) }}</div>
          <div class="nw-details">
            <span class="nw-detail-item nw-assets">\u603B\u8D44\u4EA7 {{ formatAssetMoney(totalAssets) }}</span>
            <span class="nw-divider">|</span>
            <span class="nw-detail-item nw-debts">\u603B\u8D1F\u503A {{ formatAssetMoney(totalDebts) }}</span>
          </div>
        </div>

        <!-- Net Worth Trend Chart -->
        <div v-if="netWorthSnapshots.length >= 2" class="chart-card" style="margin: 12px 16px;">
          <h3 class="chart-title">\u51C0\u8D44\u4EA7\u8D8B\u52BF</h3>
          <div class="chart-container">
            <canvas :ref="el => netWorthChartRef = el"></canvas>
          </div>
        </div>

        <!-- Account List -->
        <div class="asset-list">
          <div v-if="assets.length === 0" class="empty-state">
            <div class="empty-icon">\uD83C\uDFE6</div>
            <p>\u8FD8\u6CA1\u6709\u8D26\u6237\uFF0C\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u6DFB\u52A0</p>
          </div>
          <div
            v-for="account in assets"
            :key="account.id"
            class="asset-card"
            @click="openBalanceUpdate(account)"
          >
            <div class="asset-card-top">
              <div class="asset-card-left">
                <span class="asset-icon">{{ account.typeIcon || getAssetTypeInfo(account.type).icon }}</span>
                <div class="asset-card-info">
                  <span class="asset-name">{{ account.name }}</span>
                  <span class="asset-type-badge" :class="'asset-type-' + account.type">{{ account.typeLabel || getAssetTypeInfo(account.type).label }}</span>
                </div>
              </div>
              <button class="asset-edit-btn" @click.stop="openEditAssetModal(account)">\u2022\u2022\u2022</button>
            </div>
            <div class="asset-card-bottom">
              <span class="asset-balance" :class="{ 'asset-debt': account.type === 'debt' }">{{ formatAssetMoney(account.balance) }}</span>
              <span class="asset-updated">\u66F4\u65B0\u4E8E {{ getAssetLastUpdated(account.id) }}</span>
            </div>
          </div>
        </div>

        <!-- Add Account Button -->
        <button class="finance-add-btn" @click="openAddAssetModal">+</button>
      </div>

      <!-- Add/Edit Asset Modal -->
      <div v-if="showAssetModal" class="modal-overlay" @click.self="closeAssetModal">
        <div class="modal-content finance-modal">
          <div class="modal-header">
            <span class="modal-title">{{ editingAssetId ? '\u7F16\u8F91\u8D26\u6237' : '\u6DFB\u52A0\u8D26\u6237' }}</span>
            <button class="modal-close" @click="closeAssetModal">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">\u8D26\u6237\u540D\u79F0</label>
            <input type="text" class="form-input" v-model="assetFormName" placeholder="\u4F8B\u5982\uFF1A\u62DB\u5546\u94F6\u884C\u50A8\u84C4" />
          </div>
          <div class="form-group">
            <label class="form-label">\u8D26\u6237\u7C7B\u578B</label>
            <select class="form-select" v-model="assetFormType">
              <option v-for="opt in assetTypeOptions" :key="opt.value" :value="opt.value">{{ opt.icon }} {{ opt.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">\u5F53\u524D\u4F59\u989D</label>
            <input type="number" class="form-input" v-model="assetFormBalance" placeholder="0.00" step="0.01" />
          </div>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="saveAsset">
            \u4FDD\u5B58
          </button>
          <button v-if="editingAssetId" class="btn btn-block asset-delete-btn" @click="deleteAsset">
            \u5220\u9664\u8D26\u6237
          </button>
          </div>
        </div>
      </div>

      <!-- Quick Balance Update Modal -->
      <div v-if="showBalanceModal" class="modal-overlay" @click.self="closeBalanceModal">
        <div class="modal-content finance-modal">
          <div class="modal-header">
            <span class="modal-title">\u66F4\u65B0\u4F59\u989D</span>
            <button class="modal-close" @click="closeBalanceModal">&times;</button>
          </div>
          <div class="amount-input-wrapper">
            <span class="amount-prefix">\u00A5</span>
            <input
              type="number"
              class="amount-input"
              v-model="balanceUpdateValue"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="saveBalanceUpdate">
            \u786E\u8BA4\u66F4\u65B0
          </button>
          </div>
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
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="saveTransaction">
            {{ editingId ? '\u4fdd\u5b58\u4fee\u6539' : '\u4fdd\u5b58' }}
          </button>
          </div>
        </div>
      </div>
    </div>
  `
}
