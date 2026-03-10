// ========================================
// Business Component - Side Business Management
// ========================================

const BusinessComponent = {
  setup() {
    const { ref, computed, onMounted, watch, nextTick } = Vue

    // Sub-tab state
    const activeTab = ref('content') // 'content' | 'calendar' | 'income' | 'followers' | 'trending'

    // Platform definitions
    const platforms = [
      { name: '\u6296\u97F3', color: '#000000' },
      { name: '\u5C0F\u7EA2\u4E66', color: '#FF2442' },
      { name: 'B\u7AD9', color: '#00A1D6' },
      { name: '\u5FAE\u4FE1\u516C\u4F17\u53F7', color: '#07C160' },
      { name: '\u5FEB\u624B', color: '#FF4906' },
      { name: '\u5176\u4ED6', color: '#999999' }
    ]

    const getPlatformColor = (name) => {
      const p = platforms.find(pl => pl.name === name)
      return p ? p.color : '#999999'
    }

    // ========================================
    // Tab 1: Content Records
    // ========================================
    const contentRecords = ref([])
    const showContentModal = ref(false)
    const editingContentId = ref(null)
    const contentFormTitle = ref('')
    const contentFormPlatform = ref('\u6296\u97F3')
    const contentFormDate = ref(new Date().toISOString().slice(0, 10))
    const contentFormStatus = ref('published')
    const contentFormViews = ref('')
    const contentFormLikes = ref('')
    const contentFormComments = ref('')
    const contentFormSaves = ref('')
    const contentFormShares = ref('')
    const contentFilterPlatform = ref('all')

    const loadContent = () => {
      contentRecords.value = GrowthStore.get(GrowthStore.KEYS.CONTENT)
    }

    const filteredContent = computed(() => {
      let list = [...contentRecords.value]
      if (contentFilterPlatform.value !== 'all') {
        list = list.filter(c => c.platform === contentFilterPlatform.value)
      }
      return list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    })

    const openAddContentModal = () => {
      editingContentId.value = null
      contentFormTitle.value = ''
      contentFormPlatform.value = '\u6296\u97F3'
      contentFormDate.value = new Date().toISOString().slice(0, 10)
      contentFormStatus.value = 'published'
      contentFormViews.value = ''
      contentFormLikes.value = ''
      contentFormComments.value = ''
      contentFormSaves.value = ''
      contentFormShares.value = ''
      showContentModal.value = true
    }

    const openEditContentModal = (item) => {
      editingContentId.value = item.id
      contentFormTitle.value = item.title
      contentFormPlatform.value = item.platform
      contentFormDate.value = item.date
      contentFormStatus.value = item.status
      contentFormViews.value = item.views ? String(item.views) : ''
      contentFormLikes.value = item.likes ? String(item.likes) : ''
      contentFormComments.value = item.comments ? String(item.comments) : ''
      contentFormSaves.value = item.saves ? String(item.saves) : ''
      contentFormShares.value = item.shares ? String(item.shares) : ''
      showContentModal.value = true
    }

    const closeContentModal = () => {
      showContentModal.value = false
    }

    const saveContent = () => {
      if (!contentFormTitle.value.trim()) {
        alert('\u8BF7\u8F93\u5165\u6807\u9898')
        return
      }

      const data = {
        title: contentFormTitle.value.trim(),
        platform: contentFormPlatform.value,
        platformColor: getPlatformColor(contentFormPlatform.value),
        date: contentFormDate.value,
        status: contentFormStatus.value,
        views: contentFormStatus.value === 'published' ? (parseInt(contentFormViews.value) || 0) : 0,
        likes: contentFormStatus.value === 'published' ? (parseInt(contentFormLikes.value) || 0) : 0,
        comments: contentFormStatus.value === 'published' ? (parseInt(contentFormComments.value) || 0) : 0,
        saves: contentFormStatus.value === 'published' ? (parseInt(contentFormSaves.value) || 0) : 0,
        shares: contentFormStatus.value === 'published' ? (parseInt(contentFormShares.value) || 0) : 0
      }

      if (editingContentId.value) {
        GrowthStore.update(GrowthStore.KEYS.CONTENT, editingContentId.value, data)
      } else {
        GrowthStore.add(GrowthStore.KEYS.CONTENT, data)
      }

      loadContent()
      closeContentModal()
    }

    const deleteContent = (id) => {
      if (confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u5185\u5BB9\u8BB0\u5F55\u5417\uFF1F')) {
        GrowthStore.remove(GrowthStore.KEYS.CONTENT, id)
        loadContent()
      }
    }

    // ========================================
    // Tab 2: Content Calendar
    // ========================================
    const calYear = ref(new Date().getFullYear())
    const calMonth = ref(new Date().getMonth())
    const selectedDay = ref(null)
    const showPlanModal = ref(false)
    const planFormTitle = ref('')
    const planFormPlatform = ref('\u6296\u97F3')
    const planFormNotes = ref('')
    const planFormDate = ref('')
    const contentPlans = ref([])

    const loadPlans = () => {
      contentPlans.value = GrowthStore.get(GrowthStore.KEYS.CONTENT_PLANS)
    }

    const calMonthLabel = computed(() => {
      return `${calYear.value}\u5E74${calMonth.value + 1}\u6708`
    })

    const prevCalMonth = () => {
      if (calMonth.value === 0) {
        calMonth.value = 11
        calYear.value--
      } else {
        calMonth.value--
      }
      selectedDay.value = null
    }

    const nextCalMonth = () => {
      if (calMonth.value === 11) {
        calMonth.value = 0
        calYear.value++
      } else {
        calMonth.value++
      }
      selectedDay.value = null
    }

    const calendarDays = computed(() => {
      const firstDay = new Date(calYear.value, calMonth.value, 1)
      // Get day of week, Monday-based (0=Mon, 6=Sun)
      let startDay = firstDay.getDay() - 1
      if (startDay < 0) startDay = 6
      const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()

      // Build map of content and plans for the month
      const dayContentMap = {}
      contentRecords.value.forEach(c => {
        const d = new Date(c.date)
        if (d.getFullYear() === calYear.value && d.getMonth() === calMonth.value) {
          const day = d.getDate()
          if (!dayContentMap[day]) dayContentMap[day] = []
          dayContentMap[day].push({ type: 'content', platform: c.platform, status: c.status, color: c.platformColor || getPlatformColor(c.platform) })
        }
      })
      contentPlans.value.forEach(p => {
        const d = new Date(p.plannedDate)
        if (d.getFullYear() === calYear.value && d.getMonth() === calMonth.value) {
          const day = d.getDate()
          if (!dayContentMap[day]) dayContentMap[day] = []
          dayContentMap[day].push({ type: 'plan', platform: p.platform, status: 'planned', color: getPlatformColor(p.platform) })
        }
      })

      const today = new Date()
      const isCurrentMonth = today.getFullYear() === calYear.value && today.getMonth() === calMonth.value
      const todayDate = today.getDate()

      const cells = []
      for (let i = 0; i < startDay; i++) {
        cells.push({ day: null, items: [], isToday: false })
      }
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({
          day: d,
          items: dayContentMap[d] || [],
          isToday: isCurrentMonth && d === todayDate
        })
      }
      return cells
    })

    const selectDay = (day) => {
      if (!day) return
      selectedDay.value = day
    }

    const selectedDayContent = computed(() => {
      if (!selectedDay.value) return []
      const dateStr = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
      const items = []
      contentRecords.value.forEach(c => {
        if (c.date === dateStr) {
          items.push({ ...c, itemType: 'content' })
        }
      })
      contentPlans.value.forEach(p => {
        if (p.plannedDate === dateStr) {
          items.push({ ...p, itemType: 'plan' })
        }
      })
      return items
    })

    const openAddPlanModal = () => {
      const dateStr = selectedDay.value
        ? `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
        : new Date().toISOString().slice(0, 10)
      planFormTitle.value = ''
      planFormPlatform.value = '\u6296\u97F3'
      planFormNotes.value = ''
      planFormDate.value = dateStr
      showPlanModal.value = true
    }

    const closePlanModal = () => {
      showPlanModal.value = false
    }

    const savePlan = () => {
      if (!planFormTitle.value.trim()) {
        alert('\u8BF7\u8F93\u5165\u8BA1\u5212\u6807\u9898')
        return
      }
      GrowthStore.add(GrowthStore.KEYS.CONTENT_PLANS, {
        title: planFormTitle.value.trim(),
        platform: planFormPlatform.value,
        notes: planFormNotes.value,
        plannedDate: planFormDate.value
      })
      loadPlans()
      loadContent()
      closePlanModal()
    }

    const deletePlan = (id) => {
      if (confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8BA1\u5212\u5417\uFF1F')) {
        GrowthStore.remove(GrowthStore.KEYS.CONTENT_PLANS, id)
        loadPlans()
      }
    }

    // ========================================
    // Tab 3: Income Records
    // ========================================
    const businessIncomeRecords = ref([])
    const showIncomeModal = ref(false)
    const incomeFormAmount = ref('')
    const incomeFormSource = ref('\u5E7F\u544A')
    const incomeFormPlatform = ref('\u6296\u97F3')
    const incomeFormDate = ref(new Date().toISOString().slice(0, 10))
    const incomeFormNotes = ref('')
    const incomeChartRef = ref(null)
    let incomeChartInstance = null

    const incomeSources = ['\u5E7F\u544A', '\u5E26\u8D27', '\u6253\u8D4F', '\u5408\u4F5C', '\u5176\u4ED6']

    const incomeCurrentYear = ref(new Date().getFullYear())
    const incomeCurrentMonth = ref(new Date().getMonth())

    const loadBusinessIncome = () => {
      businessIncomeRecords.value = GrowthStore.get(GrowthStore.KEYS.BUSINESS_INCOME)
    }

    const incomeMonthLabel = computed(() => {
      return `${incomeCurrentYear.value}\u5E74${incomeCurrentMonth.value + 1}\u6708`
    })

    const prevIncomeMonth = () => {
      if (incomeCurrentMonth.value === 0) {
        incomeCurrentMonth.value = 11
        incomeCurrentYear.value--
      } else {
        incomeCurrentMonth.value--
      }
    }

    const nextIncomeMonth = () => {
      if (incomeCurrentMonth.value === 11) {
        incomeCurrentMonth.value = 0
        incomeCurrentYear.value++
      } else {
        incomeCurrentMonth.value++
      }
    }

    const monthIncomeRecords = computed(() => {
      return businessIncomeRecords.value
        .filter(i => {
          const d = new Date(i.date)
          return d.getFullYear() === incomeCurrentYear.value && d.getMonth() === incomeCurrentMonth.value
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const monthIncomeTotal = computed(() => {
      return monthIncomeRecords.value.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    })

    const openIncomeModal = () => {
      incomeFormAmount.value = ''
      incomeFormSource.value = '\u5E7F\u544A'
      incomeFormPlatform.value = '\u6296\u97F3'
      incomeFormDate.value = new Date().toISOString().slice(0, 10)
      incomeFormNotes.value = ''
      showIncomeModal.value = true
    }

    const closeIncomeModal = () => {
      showIncomeModal.value = false
    }

    const saveIncome = () => {
      const amount = parseFloat(incomeFormAmount.value)
      if (!amount || amount <= 0) {
        alert('\u8BF7\u8F93\u5165\u6709\u6548\u91D1\u989D')
        return
      }

      const data = {
        amount: amount,
        source: incomeFormSource.value,
        platform: incomeFormPlatform.value,
        date: incomeFormDate.value,
        notes: incomeFormNotes.value
      }

      // Save to business income
      GrowthStore.add(GrowthStore.KEYS.BUSINESS_INCOME, data)

      // Auto-sync: also create a transaction record
      GrowthStore.add(GrowthStore.KEYS.TRANSACTIONS, {
        type: 'income',
        amount: amount,
        category: '\u526F\u4E1A',
        categoryIcon: '\uD83D\uDCBB',
        date: incomeFormDate.value,
        notes: `\u526F\u4E1A\u6536\u5165: ${incomeFormSource.value} (${incomeFormPlatform.value})${incomeFormNotes.value ? ' - ' + incomeFormNotes.value : ''}`
      })

      loadBusinessIncome()
      closeIncomeModal()
      nextTick(() => renderIncomeChart())
    }

    const deleteIncome = (id) => {
      if (confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u6536\u5165\u8BB0\u5F55\u5417\uFF1F')) {
        GrowthStore.remove(GrowthStore.KEYS.BUSINESS_INCOME, id)
        loadBusinessIncome()
        nextTick(() => renderIncomeChart())
      }
    }

    const renderIncomeChart = () => {
      const canvas = incomeChartRef.value
      if (!canvas) return
      if (incomeChartInstance) incomeChartInstance.destroy()

      // Gather monthly data for the current year
      const yearIncome = businessIncomeRecords.value.filter(i => {
        const d = new Date(i.date)
        return d.getFullYear() === incomeCurrentYear.value
      })

      const monthsWithData = new Set()
      yearIncome.forEach(i => {
        const d = new Date(i.date)
        monthsWithData.add(d.getMonth())
      })

      const sortedMonths = [...monthsWithData].sort((a, b) => a - b)
      if (sortedMonths.length === 0) return

      const labels = sortedMonths.map(m => `${m + 1}\u6708`)
      const data = sortedMonths.map(m => {
        return yearIncome
          .filter(i => new Date(i.date).getMonth() === m)
          .reduce((s, i) => s + (Number(i.amount) || 0), 0)
      })

      const ctx = canvas.getContext('2d')
      const gradient = ctx.createLinearGradient(0, 0, 0, 220)
      gradient.addColorStop(0, 'rgba(225, 112, 85, 0.8)')
      gradient.addColorStop(1, 'rgba(253, 121, 168, 0.3)')

      incomeChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '\u526F\u4E1A\u6536\u5165',
            data,
            backgroundColor: gradient,
            borderColor: '#e17055',
            borderWidth: 1,
            borderRadius: 6
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
                  return '\u6536\u5165: \u00A5' + ctx.raw.toLocaleString()
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: { size: 11 },
                callback: function(val) { return '\u00A5' + val }
              }
            },
            x: { ticks: { font: { size: 11 } } }
          }
        }
      })
    }

    // ========================================
    // Tab 4: Follower Growth
    // ========================================
    const followerRecords = ref([])
    const showFollowerModal = ref(false)
    const followerFormPlatform = ref('\u6296\u97F3')
    const followerFormCount = ref('')
    const followerChartRef = ref(null)
    let followerChartInstance = null

    const loadFollowers = () => {
      followerRecords.value = GrowthStore.get(GrowthStore.KEYS.FOLLOWERS)
    }

    // Platform cards: latest count and change per platform
    const platformCards = computed(() => {
      const map = {}
      followerRecords.value.forEach(r => {
        if (!map[r.platform]) map[r.platform] = []
        map[r.platform].push(r)
      })

      const cards = []
      Object.entries(map).forEach(([platform, records]) => {
        const sorted = [...records].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        const latest = sorted[0]
        const previous = sorted.length > 1 ? sorted[1] : null
        const change = previous ? (Number(latest.count) - Number(previous.count)) : 0
        cards.push({
          platform,
          color: getPlatformColor(platform),
          count: Number(latest.count),
          change,
          lastDate: latest.date || latest.createdAt.slice(0, 10)
        })
      })
      return cards
    })

    const openFollowerModal = () => {
      followerFormPlatform.value = '\u6296\u97F3'
      followerFormCount.value = ''
      showFollowerModal.value = true
    }

    const closeFollowerModal = () => {
      showFollowerModal.value = false
    }

    const saveFollower = () => {
      const count = parseInt(followerFormCount.value)
      if (isNaN(count) || count < 0) {
        alert('\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7C89\u4E1D\u6570')
        return
      }
      GrowthStore.add(GrowthStore.KEYS.FOLLOWERS, {
        platform: followerFormPlatform.value,
        count: count,
        date: new Date().toISOString().slice(0, 10)
      })
      loadFollowers()
      closeFollowerModal()
      nextTick(() => renderFollowerChart())
    }

    const formatFollowerCount = (count) => {
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '\u4E07'
      }
      return count.toLocaleString()
    }

    const renderFollowerChart = () => {
      const canvas = followerChartRef.value
      if (!canvas) return
      if (followerChartInstance) followerChartInstance.destroy()

      // Group by platform
      const platformMap = {}
      followerRecords.value.forEach(r => {
        if (!platformMap[r.platform]) platformMap[r.platform] = []
        platformMap[r.platform].push(r)
      })

      if (Object.keys(platformMap).length === 0) return

      // Collect all unique dates and sort
      const allDates = [...new Set(followerRecords.value.map(r => r.date || r.createdAt.slice(0, 10)))].sort()
      if (allDates.length < 1) return

      const labels = allDates.map(d => d.slice(5)) // MM-DD

      const datasets = Object.entries(platformMap).map(([platform, records]) => {
        const sorted = [...records].sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
        const color = getPlatformColor(platform)

        // Map data to dates; use null for dates with no record, carry forward last known value
        let lastKnown = null
        const data = allDates.map(date => {
          const record = sorted.find(r => (r.date || r.createdAt.slice(0, 10)) === date)
          if (record) {
            lastKnown = Number(record.count)
            return lastKnown
          }
          return lastKnown
        })

        return {
          label: platform,
          data,
          borderColor: color,
          backgroundColor: color + '20',
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      })

      followerChartInstance = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { font: { size: 11 }, usePointStyle: true }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  return ctx.dataset.label + ': ' + (ctx.raw !== null ? ctx.raw.toLocaleString() : '--')
                }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                font: { size: 11 },
                callback: function(val) {
                  if (val >= 10000) return (val / 10000).toFixed(1) + '\u4E07'
                  return val
                }
              }
            },
            x: { ticks: { font: { size: 10 } } }
          }
        }
      })
    }

    // ========================================
    // Tab 5: Trending Links
    // ========================================
    const trendingLinks = [
      { name: '\u6296\u97F3\u70ED\u699C', url: 'https://www.douyin.com/hot', color: '#000000', bgColor: '#000000', textColor: '#ffffff' },
      { name: '\u5FAE\u535A\u70ED\u641C', url: 'https://s.weibo.com/top/summary', color: '#FF8200', bgColor: '#FF8200', textColor: '#ffffff' },
      { name: 'B\u7AD9\u70ED\u95E8', url: 'https://www.bilibili.com/v/popular/rank/all', color: '#00A1D6', bgColor: '#00A1D6', textColor: '#ffffff' },
      { name: '\u5C0F\u7EA2\u4E66', url: 'https://www.xiaohongshu.com/explore', color: '#FF2442', bgColor: '#FF2442', textColor: '#ffffff' },
      { name: '\u5FEB\u624B\u70ED\u95E8', url: 'https://www.kuaishou.com/brilliant', color: '#FF4906', bgColor: '#FF4906', textColor: '#ffffff' }
    ]

    const openTrending = (url) => {
      window.open(url, '_blank')
    }

    // ========================================
    // Lifecycle & Watchers
    // ========================================
    watch(activeTab, (val) => {
      if (val === 'income') {
        nextTick(() => renderIncomeChart())
      }
      if (val === 'followers') {
        nextTick(() => renderFollowerChart())
      }
    })

    watch([incomeCurrentMonth, incomeCurrentYear], () => {
      nextTick(() => renderIncomeChart())
    })

    onMounted(() => {
      loadContent()
      loadPlans()
      loadBusinessIncome()
      loadFollowers()
    })

    return {
      activeTab,
      platforms,
      getPlatformColor,
      // Content
      contentRecords, showContentModal, editingContentId,
      contentFormTitle, contentFormPlatform, contentFormDate, contentFormStatus,
      contentFormViews, contentFormLikes, contentFormComments, contentFormSaves, contentFormShares,
      contentFilterPlatform, filteredContent,
      openAddContentModal, openEditContentModal, closeContentModal, saveContent, deleteContent,
      // Calendar
      calYear, calMonth, calMonthLabel, prevCalMonth, nextCalMonth,
      calendarDays, selectedDay, selectDay, selectedDayContent,
      showPlanModal, planFormTitle, planFormPlatform, planFormNotes, planFormDate,
      openAddPlanModal, closePlanModal, savePlan, deletePlan,
      contentPlans,
      // Income
      businessIncomeRecords, showIncomeModal,
      incomeFormAmount, incomeFormSource, incomeFormPlatform, incomeFormDate, incomeFormNotes,
      incomeSources,
      incomeCurrentYear, incomeCurrentMonth, incomeMonthLabel, prevIncomeMonth, nextIncomeMonth,
      monthIncomeRecords, monthIncomeTotal,
      openIncomeModal, closeIncomeModal, saveIncome, deleteIncome,
      incomeChartRef,
      // Followers
      followerRecords, showFollowerModal,
      followerFormPlatform, followerFormCount,
      platformCards, formatFollowerCount,
      openFollowerModal, closeFollowerModal, saveFollower,
      followerChartRef,
      // Trending
      trendingLinks, openTrending
    }
  },
  template: `
    <div class="page business-page">
      <!-- Sub-tabs -->
      <div class="business-tabs">
        <button class="business-tab" :class="{ active: activeTab === 'content' }" @click="activeTab = 'content'">\u5185\u5BB9</button>
        <button class="business-tab" :class="{ active: activeTab === 'calendar' }" @click="activeTab = 'calendar'">\u65E5\u5386</button>
        <button class="business-tab" :class="{ active: activeTab === 'income' }" @click="activeTab = 'income'">\u6536\u5165</button>
        <button class="business-tab" :class="{ active: activeTab === 'followers' }" @click="activeTab = 'followers'">\u7C89\u4E1D</button>
        <button class="business-tab" :class="{ active: activeTab === 'trending' }" @click="activeTab = 'trending'">\u70ED\u699C</button>
      </div>

      <!-- ===================== Content Tab ===================== -->
      <div v-if="activeTab === 'content'" class="business-content">
        <!-- Filter bar -->
        <div class="content-filter-bar">
          <button class="content-filter-pill" :class="{ active: contentFilterPlatform === 'all' }" @click="contentFilterPlatform = 'all'">\u5168\u90E8</button>
          <button v-for="p in platforms" :key="p.name" class="content-filter-pill"
            :class="{ active: contentFilterPlatform === p.name }"
            :style="contentFilterPlatform === p.name ? { background: p.color, color: p.color === '#000000' ? '#fff' : '#fff', borderColor: p.color } : {}"
            @click="contentFilterPlatform = p.name"
          >{{ p.name }}</button>
        </div>

        <!-- Content list -->
        <div class="content-list">
          <div v-if="filteredContent.length === 0" class="empty-state">
            <div class="empty-icon">\u270D\uFE0F</div>
            <p>\u8FD8\u6CA1\u6709\u5185\u5BB9\u8BB0\u5F55\uFF0C\u70B9\u51FB + \u6DFB\u52A0\u5427</p>
          </div>
          <div v-for="item in filteredContent" :key="item.id" class="content-card" @click="openEditContentModal(item)">
            <div class="content-card-top">
              <span class="platform-badge" :style="{ background: item.platformColor || getPlatformColor(item.platform), color: '#fff' }">{{ item.platform }}</span>
              <span class="content-status-badge" :class="item.status === 'published' ? 'status-published' : 'status-draft'">
                {{ item.status === 'published' ? '\u5DF2\u53D1\u5E03' : '\u8349\u7A3F' }}
              </span>
            </div>
            <div class="content-card-title">{{ item.title }}</div>
            <div class="content-card-meta">
              <span class="content-card-date">{{ item.date }}</span>
              <div v-if="item.status === 'published'" class="content-card-metrics">
                <span class="content-metric">\u25B6 {{ item.views || 0 }}</span>
                <span class="content-metric">\u2764 {{ item.likes || 0 }}</span>
              </div>
            </div>
            <button class="content-delete-btn" @click.stop="deleteContent(item.id)">&times;</button>
          </div>
        </div>

        <!-- Add Button -->
        <button class="business-add-btn" @click="openAddContentModal">+</button>
      </div>

      <!-- ===================== Calendar Tab ===================== -->
      <div v-if="activeTab === 'calendar'" class="business-content">
        <div class="card business-calendar-card">
          <div class="month-nav">
            <button class="month-arrow" @click="prevCalMonth">&lsaquo;</button>
            <span class="month-label">{{ calMonthLabel }}</span>
            <button class="month-arrow" @click="nextCalMonth">&rsaquo;</button>
          </div>
          <div class="biz-cal-weekdays">
            <span v-for="wd in ['\u5468\u4E00','\u5468\u4E8C','\u5468\u4E09','\u5468\u56DB','\u5468\u4E94','\u5468\u516D','\u5468\u65E5']" :key="wd" class="biz-cal-weekday">{{ wd }}</span>
          </div>
          <div class="biz-cal-grid">
            <div v-for="(cell, idx) in calendarDays" :key="idx"
              class="biz-cal-cell"
              :class="{ 'biz-cal-today': cell.isToday, 'biz-cal-selected': cell.day === selectedDay, 'biz-cal-empty': !cell.day }"
              @click="selectDay(cell.day)"
            >
              <span v-if="cell.day" class="biz-cal-day-num">{{ cell.day }}</span>
              <div v-if="cell.items.length > 0" class="biz-cal-dots">
                <span v-for="(item, i) in cell.items.slice(0, 3)" :key="i"
                  class="biz-cal-dot"
                  :class="{ 'biz-cal-dot-planned': item.status === 'planned' }"
                  :style="{ background: item.status !== 'planned' ? item.color : 'transparent', borderColor: item.color }"
                ></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected day content -->
        <div v-if="selectedDay" class="selected-day-section">
          <div class="selected-day-header">
            <h3>{{ calMonth + 1 }}\u6708{{ selectedDay }}\u65E5 \u5185\u5BB9</h3>
            <button class="btn btn-sm btn-outline" @click="openAddPlanModal">+ \u6DFB\u52A0\u8BA1\u5212</button>
          </div>
          <div v-if="selectedDayContent.length === 0" class="empty-state" style="padding: 16px;">
            <p>\u8FD9\u5929\u8FD8\u6CA1\u6709\u5185\u5BB9</p>
          </div>
          <div v-for="item in selectedDayContent" :key="item.id" class="selected-day-item">
            <span class="platform-badge" :style="{ background: getPlatformColor(item.platform), color: '#fff' }">{{ item.platform }}</span>
            <span class="selected-day-title">{{ item.title }}</span>
            <span v-if="item.itemType === 'plan'" class="plan-tag">\u8BA1\u5212</span>
            <span v-else class="content-status-badge" :class="item.status === 'published' ? 'status-published' : 'status-draft'">
              {{ item.status === 'published' ? '\u5DF2\u53D1\u5E03' : '\u8349\u7A3F' }}
            </span>
            <button v-if="item.itemType === 'plan'" class="transaction-delete" @click="deletePlan(item.id)">&times;</button>
          </div>
        </div>
      </div>

      <!-- ===================== Income Tab ===================== -->
      <div v-if="activeTab === 'income'" class="business-content">
        <!-- Month nav & total -->
        <div class="income-summary-bar">
          <div class="month-nav">
            <button class="month-arrow" @click="prevIncomeMonth">&lsaquo;</button>
            <span class="month-label">{{ incomeMonthLabel }}</span>
            <button class="month-arrow" @click="nextIncomeMonth">&rsaquo;</button>
          </div>
          <div class="income-total">
            \u672C\u6708\u6536\u5165\uFF1A<span class="income-total-amount">\u00A5{{ monthIncomeTotal.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Income Chart -->
        <div class="chart-card" v-if="businessIncomeRecords.length > 0">
          <h3 class="chart-title">\u6708\u5EA6\u526F\u4E1A\u6536\u5165</h3>
          <div class="chart-container">
            <canvas :ref="el => incomeChartRef = el"></canvas>
          </div>
        </div>

        <!-- Income list -->
        <div class="income-list">
          <div v-if="monthIncomeRecords.length === 0" class="empty-state">
            <div class="empty-icon">\uD83D\uDCB0</div>
            <p>\u672C\u6708\u8FD8\u6CA1\u6709\u526F\u4E1A\u6536\u5165\u8BB0\u5F55</p>
          </div>
          <div v-for="item in monthIncomeRecords" :key="item.id" class="income-card">
            <div class="income-card-left">
              <span class="income-amount">\u00A5{{ Number(item.amount).toFixed(2) }}</span>
              <div class="income-card-tags">
                <span class="income-source-badge">{{ item.source }}</span>
                <span class="platform-badge platform-badge-sm" :style="{ background: getPlatformColor(item.platform), color: '#fff' }">{{ item.platform }}</span>
              </div>
              <span class="income-card-date">{{ item.date }}</span>
              <span v-if="item.notes" class="income-card-notes">{{ item.notes }}</span>
            </div>
            <button class="transaction-delete" @click="deleteIncome(item.id)">&times;</button>
          </div>
        </div>

        <!-- Add Button -->
        <button class="business-add-btn" @click="openIncomeModal">+</button>
      </div>

      <!-- ===================== Followers Tab ===================== -->
      <div v-if="activeTab === 'followers'" class="business-content">
        <!-- Platform cards -->
        <div class="follower-cards-grid">
          <div v-if="platformCards.length === 0" class="empty-state" style="grid-column: 1/-1;">
            <div class="empty-icon">\uD83D\uDC65</div>
            <p>\u8FD8\u6CA1\u6709\u7C89\u4E1D\u6570\u636E\uFF0C\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u6DFB\u52A0</p>
          </div>
          <div v-for="card in platformCards" :key="card.platform" class="follower-card" :style="{ borderTopColor: card.color }">
            <div class="follower-card-platform" :style="{ color: card.color }">{{ card.platform }}</div>
            <div class="follower-card-count">{{ formatFollowerCount(card.count) }}</div>
            <div class="follower-card-change" :class="card.change >= 0 ? 'change-up' : 'change-down'">
              {{ card.change >= 0 ? '\u2191' : '\u2193' }} {{ Math.abs(card.change) }}
            </div>
            <div class="follower-card-date">\u66F4\u65B0\u4E8E {{ card.lastDate }}</div>
          </div>
        </div>

        <!-- Update Button -->
        <button class="btn btn-primary btn-block beauty-log-btn" @click="openFollowerModal">
          \u66F4\u65B0\u7C89\u4E1D\u6570
        </button>

        <!-- Growth Chart -->
        <div class="chart-card" v-if="followerRecords.length > 0">
          <h3 class="chart-title">\u7C89\u4E1D\u589E\u957F\u8D8B\u52BF</h3>
          <div class="chart-container">
            <canvas :ref="el => followerChartRef = el"></canvas>
          </div>
        </div>
      </div>

      <!-- ===================== Trending Tab ===================== -->
      <div v-if="activeTab === 'trending'" class="business-content">
        <div class="trending-section">
          <h3 class="trending-title">\u5E73\u53F0\u70ED\u699C</h3>
          <p class="trending-desc">\u5FEB\u901F\u67E5\u770B\u5404\u5E73\u53F0\u70ED\u95E8\u5185\u5BB9\uFF0C\u627E\u5230\u521B\u4F5C\u7075\u611F</p>
          <div class="trending-buttons">
            <button v-for="link in trendingLinks" :key="link.name"
              class="trending-btn"
              :style="{ background: link.bgColor, color: link.textColor }"
              @click="openTrending(link.url)"
            >
              {{ link.name }}
              <span class="trending-arrow">\u2192</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ===================== Modals ===================== -->

      <!-- Content Modal -->
      <div v-if="showContentModal" class="modal-overlay" @click.self="closeContentModal">
        <div class="modal-content business-modal">
          <div class="modal-header">
            <span class="modal-title">{{ editingContentId ? '\u7F16\u8F91\u5185\u5BB9' : '\u6DFB\u52A0\u5185\u5BB9' }}</span>
            <button class="modal-close" @click="closeContentModal">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">\u6807\u9898</label>
            <input type="text" class="form-input" v-model="contentFormTitle" placeholder="\u5185\u5BB9\u6807\u9898..." />
          </div>
          <div class="form-group">
            <label class="form-label">\u5E73\u53F0</label>
            <div class="platform-selector">
              <button v-for="p in platforms" :key="p.name"
                class="platform-pill"
                :class="{ 'platform-pill-active': contentFormPlatform === p.name }"
                :style="contentFormPlatform === p.name ? { background: p.color, color: '#fff', borderColor: p.color } : {}"
                @click="contentFormPlatform = p.name"
              >{{ p.name }}</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">\u65E5\u671F</label>
            <input type="date" class="form-input" v-model="contentFormDate" />
          </div>
          <div class="form-group">
            <label class="form-label">\u72B6\u6001</label>
            <div class="type-toggle">
              <button class="type-btn" :class="{ 'type-published-active': contentFormStatus === 'published' }" @click="contentFormStatus = 'published'">\u5DF2\u53D1\u5E03</button>
              <button class="type-btn" :class="{ 'type-draft-active': contentFormStatus === 'draft' }" @click="contentFormStatus = 'draft'">\u8349\u7A3F</button>
            </div>
          </div>
          <template v-if="contentFormStatus === 'published'">
            <div class="form-group">
              <label class="form-label">\u6570\u636E\u6307\u6807</label>
              <div class="metrics-grid">
                <div class="metric-input-group">
                  <label>\u64AD\u653E</label>
                  <input type="number" class="form-input" v-model="contentFormViews" placeholder="0" min="0" />
                </div>
                <div class="metric-input-group">
                  <label>\u70B9\u8D5E</label>
                  <input type="number" class="form-input" v-model="contentFormLikes" placeholder="0" min="0" />
                </div>
                <div class="metric-input-group">
                  <label>\u8BC4\u8BBA</label>
                  <input type="number" class="form-input" v-model="contentFormComments" placeholder="0" min="0" />
                </div>
                <div class="metric-input-group">
                  <label>\u6536\u85CF</label>
                  <input type="number" class="form-input" v-model="contentFormSaves" placeholder="0" min="0" />
                </div>
                <div class="metric-input-group">
                  <label>\u5206\u4EAB</label>
                  <input type="number" class="form-input" v-model="contentFormShares" placeholder="0" min="0" />
                </div>
              </div>
            </div>
          </template>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="saveContent">
            {{ editingContentId ? '\u4FDD\u5B58\u4FEE\u6539' : '\u4FDD\u5B58' }}
          </button>
          </div>
        </div>
      </div>

      <!-- Plan Modal -->
      <div v-if="showPlanModal" class="modal-overlay" @click.self="closePlanModal">
        <div class="modal-content business-modal">
          <div class="modal-header">
            <span class="modal-title">\u6DFB\u52A0\u5185\u5BB9\u8BA1\u5212</span>
            <button class="modal-close" @click="closePlanModal">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">\u6807\u9898</label>
            <input type="text" class="form-input" v-model="planFormTitle" placeholder="\u8BA1\u5212\u6807\u9898..." />
          </div>
          <div class="form-group">
            <label class="form-label">\u5E73\u53F0</label>
            <div class="platform-selector">
              <button v-for="p in platforms" :key="p.name"
                class="platform-pill"
                :class="{ 'platform-pill-active': planFormPlatform === p.name }"
                :style="planFormPlatform === p.name ? { background: p.color, color: '#fff', borderColor: p.color } : {}"
                @click="planFormPlatform = p.name"
              >{{ p.name }}</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">\u8BA1\u5212\u65E5\u671F</label>
            <input type="date" class="form-input" v-model="planFormDate" />
          </div>
          <div class="form-group">
            <label class="form-label">\u5907\u6CE8</label>
            <textarea class="form-textarea" v-model="planFormNotes" placeholder="\u53EF\u9009\uFF0C\u8BB0\u5F55\u8BA1\u5212\u8BE6\u60C5..." rows="2"></textarea>
          </div>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="savePlan">\u4FDD\u5B58</button>
          </div>
        </div>
      </div>

      <!-- Income Modal -->
      <div v-if="showIncomeModal" class="modal-overlay" @click.self="closeIncomeModal">
        <div class="modal-content business-modal">
          <div class="modal-header">
            <span class="modal-title">\u6DFB\u52A0\u526F\u4E1A\u6536\u5165</span>
            <button class="modal-close" @click="closeIncomeModal">&times;</button>
          </div>
          <div class="amount-input-wrapper">
            <span class="amount-prefix">\u00A5</span>
            <input type="number" class="amount-input" v-model="incomeFormAmount" placeholder="0.00" step="0.01" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">\u6536\u5165\u6765\u6E90</label>
            <div class="platform-selector">
              <button v-for="src in incomeSources" :key="src"
                class="platform-pill"
                :class="{ 'platform-pill-active': incomeFormSource === src }"
                :style="incomeFormSource === src ? { background: '#e17055', color: '#fff', borderColor: '#e17055' } : {}"
                @click="incomeFormSource = src"
              >{{ src }}</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">\u5E73\u53F0</label>
            <div class="platform-selector">
              <button v-for="p in platforms" :key="p.name"
                class="platform-pill"
                :class="{ 'platform-pill-active': incomeFormPlatform === p.name }"
                :style="incomeFormPlatform === p.name ? { background: p.color, color: '#fff', borderColor: p.color } : {}"
                @click="incomeFormPlatform = p.name"
              >{{ p.name }}</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">\u65E5\u671F</label>
            <input type="date" class="form-input" v-model="incomeFormDate" />
          </div>
          <div class="form-group">
            <label class="form-label">\u5907\u6CE8</label>
            <input type="text" class="form-input" v-model="incomeFormNotes" placeholder="\u53EF\u9009..." />
          </div>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="saveIncome">\u4FDD\u5B58</button>
          </div>
        </div>
      </div>

      <!-- Follower Modal -->
      <div v-if="showFollowerModal" class="modal-overlay" @click.self="closeFollowerModal">
        <div class="modal-content business-modal">
          <div class="modal-header">
            <span class="modal-title">\u66F4\u65B0\u7C89\u4E1D\u6570</span>
            <button class="modal-close" @click="closeFollowerModal">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">\u5E73\u53F0</label>
            <div class="platform-selector">
              <button v-for="p in platforms" :key="p.name"
                class="platform-pill"
                :class="{ 'platform-pill-active': followerFormPlatform === p.name }"
                :style="followerFormPlatform === p.name ? { background: p.color, color: '#fff', borderColor: p.color } : {}"
                @click="followerFormPlatform = p.name"
              >{{ p.name }}</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">\u5F53\u524D\u7C89\u4E1D\u6570</label>
            <input type="number" class="form-input" v-model="followerFormCount" placeholder="\u8F93\u5165\u7C89\u4E1D\u6570..." min="0" />
          </div>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="saveFollower">\u4FDD\u5B58</button>
          </div>
        </div>
      </div>
    </div>
  `
}
