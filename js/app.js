const { createApp, ref, computed, onMounted, watch, nextTick } = Vue
const { createRouter, createWebHashHistory } = VueRouter

// ========================================
// Route Components (Placeholders)
// ========================================

const Dashboard = {
  setup() {
    const fabOpen = ref(false)
    const router = VueRouter.useRouter()

    // Current date in Chinese format
    const now = new Date()
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const currentDate = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`

    // Greeting based on time of day
    const hour = now.getHours()
    const greeting = computed(() => {
      if (hour < 6) return '夜深了，注意休息'
      if (hour < 9) return '早安，新的一天开始了'
      if (hour < 12) return '上午好，保持专注'
      if (hour < 14) return '中午好，记得吃饭'
      if (hour < 18) return '下午好，继续加油'
      if (hour < 21) return '晚上好，辛苦一天了'
      return '夜深了，早点休息'
    })

    // Card 1: Monthly income - expenses
    const monthlyBalance = computed(() => {
      const transactions = GrowthStore.get(GrowthStore.KEYS.TRANSACTIONS)
      if (!transactions.length) return null
      const year = now.getFullYear()
      const month = now.getMonth()
      let income = 0, expense = 0
      transactions.forEach(t => {
        const d = new Date(t.date || t.createdAt)
        if (d.getFullYear() === year && d.getMonth() === month) {
          if (t.type === 'income') income += Number(t.amount) || 0
          else expense += Number(t.amount) || 0
        }
      })
      return { value: income - expense, hasData: true }
    })

    // Card 2: Net assets
    const netAssets = computed(() => {
      const assets = GrowthStore.get(GrowthStore.KEYS.ASSETS)
      if (!assets.length) return null
      const total = assets.reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
      return total
    })

    // Card 3: Learning progress
    const learningProgress = computed(() => {
      const progress = GrowthStore.get(GrowthStore.KEYS.LEARNING_PROGRESS)
      if (!progress.length) return null
      const inProgress = progress.filter(p => p.status !== 'completed' && p.status !== 'done')
      return { count: inProgress.length, total: progress.length }
    })

    // Card 4: Content published this week
    const weeklyContent = computed(() => {
      const content = GrowthStore.get(GrowthStore.KEYS.CONTENT)
      if (!content.length) return null
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const count = content.filter(c => {
        const d = new Date(c.date || c.createdAt)
        return d >= startOfWeek
      }).length
      return count
    })

    // Card 5: Weight trend
    const weightTrend = computed(() => {
      const weights = GrowthStore.get(GrowthStore.KEYS.WEIGHT)
      if (!weights.length) return null
      const sorted = [...weights].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      const latest = Number(sorted[0].weight || sorted[0].value)
      const previous = sorted.length > 1 ? Number(sorted[1].weight || sorted[1].value) : null
      let direction = 'stable'
      if (previous !== null) {
        if (latest > previous) direction = 'up'
        else if (latest < previous) direction = 'down'
      }
      return { latest, direction }
    })

    // Card 6: Side business income this month
    const businessIncome = computed(() => {
      const income = GrowthStore.get(GrowthStore.KEYS.BUSINESS_INCOME)
      if (!income.length) return null
      const year = now.getFullYear()
      const month = now.getMonth()
      const total = income
        .filter(i => {
          const d = new Date(i.date || i.createdAt)
          return d.getFullYear() === year && d.getMonth() === month
        })
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
      return total
    })

    // Today's reminders
    const todayReminders = computed(() => {
      const reminders = GrowthStore.get(GrowthStore.KEYS.REMINDERS)
      if (!reminders.length) return []
      const todayStr = now.toISOString().slice(0, 10)
      return reminders.filter(r => {
        const d = (r.date || r.createdAt || '').slice(0, 10)
        return d === todayStr
      })
    })

    const toggleFab = () => {
      fabOpen.value = !fabOpen.value
    }

    const quickAction = (path) => {
      fabOpen.value = false
      router.push(path)
    }

    const goSettings = () => {
      router.push('/settings')
    }

    const formatMoney = (val) => {
      if (val === null || val === undefined) return '暂无数据'
      const abs = Math.abs(val)
      if (abs >= 10000) {
        return (val >= 0 ? '' : '-') + '\u00A5' + (abs / 10000).toFixed(1) + '万'
      }
      return (val >= 0 ? '' : '-') + '\u00A5' + abs.toFixed(0)
    }

    const moduleColors = {
      finance: '#667eea',
      assets: '#6c5ce7',
      learning: '#00b894',
      content: '#fd79a8',
      weight: '#fdcb6e',
      business: '#e17055'
    }

    // Count-up animation for dashboard numbers
    const animatedBalance = ref(0)
    const animatedAssets = ref(0)
    const animatedLearningCount = ref(0)
    const animatedWeeklyContent = ref(0)
    const animatedWeight = ref(0)
    const animatedBusiness = ref(0)
    const animationMounted = ref(false)

    const animateValue = (targetRef, endValue, duration = 800) => {
      if (endValue === null || endValue === undefined || isNaN(endValue)) return
      const startValue = 0
      const startTime = performance.now()
      const step = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        targetRef.value = startValue + (endValue - startValue) * eased
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          targetRef.value = endValue
        }
      }
      requestAnimationFrame(step)
    }

    onMounted(() => {
      animationMounted.value = true
      nextTick(() => {
        // Animate balance
        if (monthlyBalance.value && monthlyBalance.value.hasData) {
          animateValue(animatedBalance, monthlyBalance.value.value)
        }
        // Animate net assets
        if (netAssets.value !== null) {
          animateValue(animatedAssets, netAssets.value)
        }
        // Animate learning count
        if (learningProgress.value) {
          animateValue(animatedLearningCount, learningProgress.value.count)
        }
        // Animate weekly content
        if (weeklyContent.value !== null) {
          animateValue(animatedWeeklyContent, weeklyContent.value)
        }
        // Animate weight
        if (weightTrend.value) {
          animateValue(animatedWeight, weightTrend.value.latest, 1000)
        }
        // Animate business income
        if (businessIncome.value !== null) {
          animateValue(animatedBusiness, businessIncome.value)
        }
      })
    })

    // Formatted animated values
    const displayBalance = computed(() => {
      if (!monthlyBalance.value || !monthlyBalance.value.hasData) return '\u00A50'
      if (!animationMounted.value) return '\u00A50'
      return formatMoney(Math.round(animatedBalance.value))
    })

    const displayAssets = computed(() => {
      if (netAssets.value === null) return '\u00A50'
      if (!animationMounted.value) return '\u00A50'
      return formatMoney(Math.round(animatedAssets.value))
    })

    const displayLearning = computed(() => {
      if (!learningProgress.value) return '暂无数据'
      if (!animationMounted.value) return '0 项进行中'
      return Math.round(animatedLearningCount.value) + ' 项进行中'
    })

    const displayWeeklyContent = computed(() => {
      if (weeklyContent.value === null) return '暂无数据'
      if (!animationMounted.value) return '0 条内容'
      return Math.round(animatedWeeklyContent.value) + ' 条内容'
    })

    const displayWeight = computed(() => {
      if (!weightTrend.value) return null
      if (!animationMounted.value) return '0'
      return animatedWeight.value.toFixed(1)
    })

    const displayBusiness = computed(() => {
      if (businessIncome.value === null) return '\u00A50'
      if (!animationMounted.value) return '\u00A50'
      return formatMoney(Math.round(animatedBusiness.value))
    })

    return {
      fabOpen,
      currentDate,
      greeting,
      monthlyBalance,
      netAssets,
      learningProgress,
      weeklyContent,
      weightTrend,
      businessIncome,
      todayReminders,
      toggleFab,
      quickAction,
      goSettings,
      formatMoney,
      moduleColors,
      displayBalance,
      displayAssets,
      displayLearning,
      displayWeeklyContent,
      displayWeight,
      displayBusiness
    }
  },
  template: `
    <div class="page dashboard-page">
      <!-- Gradient Banner -->
      <div class="dashboard-banner">
        <button class="banner-settings" @click="goSettings">
          <span>&#9881;</span>
        </button>
        <h1 class="banner-title">2026 我的成长之旅</h1>
        <p class="banner-date">{{ currentDate }}</p>
        <p class="banner-greeting">{{ greeting }}</p>
      </div>

      <!-- Overview Cards Grid -->
      <div class="dashboard-cards-grid">
        <!-- Card 1: Monthly Balance -->
        <div class="dashboard-card" style="border-left-color: #667eea;">
          <div class="dashboard-card-icon" style="color: #667eea;">&#128176;</div>
          <div class="dashboard-card-value" :class="{ 'text-positive': monthlyBalance && monthlyBalance.value >= 0, 'text-negative': monthlyBalance && monthlyBalance.value < 0 }">
            {{ displayBalance }}
          </div>
          <div class="dashboard-card-label">本月收支</div>
        </div>

        <!-- Card 2: Net Assets -->
        <div class="dashboard-card" style="border-left-color: #6c5ce7;">
          <div class="dashboard-card-icon" style="color: #6c5ce7;">&#128188;</div>
          <div class="dashboard-card-value">
            {{ displayAssets }}
          </div>
          <div class="dashboard-card-label">净资产</div>
        </div>

        <!-- Card 3: Learning Progress -->
        <div class="dashboard-card" style="border-left-color: #00b894;">
          <div class="dashboard-card-icon" style="color: #00b894;">&#128218;</div>
          <div class="dashboard-card-value">
            {{ displayLearning }}
          </div>
          <div class="dashboard-card-label">学习进度</div>
          <div class="dashboard-card-progress" v-if="learningProgress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (learningProgress.total > 0 ? ((learningProgress.total - learningProgress.count) / learningProgress.total * 100) : 0) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Card 4: Weekly Content -->
        <div class="dashboard-card" style="border-left-color: #fd79a8;">
          <div class="dashboard-card-icon" style="color: #fd79a8;">&#128241;</div>
          <div class="dashboard-card-value">
            {{ displayWeeklyContent }}
          </div>
          <div class="dashboard-card-label">本周发布</div>
        </div>

        <!-- Card 5: Weight Trend -->
        <div class="dashboard-card" style="border-left-color: #fdcb6e;">
          <div class="dashboard-card-icon" style="color: #fdcb6e;">&#9878;</div>
          <div class="dashboard-card-value">
            <template v-if="weightTrend">
              {{ displayWeight }} kg
              <span v-if="weightTrend.direction === 'up'" class="trend-arrow trend-up">&#8593;</span>
              <span v-else-if="weightTrend.direction === 'down'" class="trend-arrow trend-down">&#8595;</span>
              <span v-else class="trend-arrow trend-stable">&#8596;</span>
            </template>
            <template v-else>暂无数据</template>
          </div>
          <div class="dashboard-card-label">体重趋势</div>
        </div>

        <!-- Card 6: Business Income -->
        <div class="dashboard-card" style="border-left-color: #e17055;">
          <div class="dashboard-card-icon" style="color: #e17055;">&#128178;</div>
          <div class="dashboard-card-value">
            {{ displayBusiness }}
          </div>
          <div class="dashboard-card-label">副业收入</div>
        </div>
      </div>

      <!-- Today's Reminders -->
      <div class="dashboard-reminders">
        <div class="reminders-header">
          <h3>今日提醒</h3>
          <router-link to="/reminders" class="reminders-link">查看全部 &rsaquo;</router-link>
        </div>
        <div v-if="todayReminders.length === 0" class="reminders-empty">
          今天没有提醒，享受美好的一天吧！
        </div>
        <div v-else class="reminders-list">
          <div v-for="reminder in todayReminders" :key="reminder.id" class="reminder-item">
            <span class="reminder-dot" :style="{ background: moduleColors[reminder.module] || '#667eea' }"></span>
            <span class="reminder-content">{{ reminder.content || reminder.title }}</span>
            <span class="reminder-time" v-if="reminder.time">{{ reminder.time }}</span>
          </div>
        </div>
      </div>

      <!-- FAB Overlay -->
      <div class="fab-overlay" v-if="fabOpen" @click="toggleFab"></div>

      <!-- Quick Action FAB -->
      <div class="fab-container">
        <transition name="fab-menu">
          <div class="fab-menu" v-if="fabOpen">
            <div class="fab-action" @click="quickAction('/finance')">
              <span class="fab-action-icon">&#128181;</span>
              <span class="fab-action-label">记一笔</span>
            </div>
            <div class="fab-action" @click="quickAction('/beauty')">
              <span class="fab-action-icon">&#9878;</span>
              <span class="fab-action-label">记体重</span>
            </div>
            <div class="fab-action" @click="quickAction('/business')">
              <span class="fab-action-icon">&#9998;</span>
              <span class="fab-action-label">发内容</span>
            </div>
            <div class="fab-action" @click="quickAction('/reminders')">
              <span class="fab-action-icon">&#128276;</span>
              <span class="fab-action-label">提醒我</span>
            </div>
          </div>
        </transition>
        <button class="fab-button" :class="{ 'fab-active': fabOpen }" @click="toggleFab">
          <span class="fab-icon">+</span>
        </button>
      </div>
    </div>
  `
}

// Finance component is defined in finance.js as FinanceComponent
const Finance = FinanceComponent

// Beauty component is defined in beauty.js as BeautyComponent
const Beauty = BeautyComponent

// Learning component is defined in learning.js as LearningComponent
const Learning = LearningComponent

// Business component is defined in business.js as BusinessComponent
const Business = BusinessComponent

// Reminder component is defined in reminder.js as ReminderComponent
const Reminders = ReminderComponent

const Settings = {
  setup() {
    const router = VueRouter.useRouter()
    const lastBackup = ref(null)
    const notificationStatus = ref('default')
    const fileInputRef = ref(null)

    const formatBackupDate = computed(() => {
      if (!lastBackup.value) return '从未备份'
      const d = new Date(lastBackup.value)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    })

    const notificationLabel = computed(() => {
      if (notificationStatus.value === 'granted') return '已开启'
      if (notificationStatus.value === 'denied') return '已关闭 (请在浏览器设置中开启)'
      return '未设置'
    })

    const notificationIcon = computed(() => {
      if (notificationStatus.value === 'granted') return '\u2705'
      if (notificationStatus.value === 'denied') return '\u274C'
      return ''
    })

    const refreshNotificationStatus = () => {
      if ('Notification' in window) {
        notificationStatus.value = Notification.permission
      } else {
        notificationStatus.value = 'denied'
      }
    }

    const goBack = () => {
      router.push('/')
    }

    const exportData = () => {
      GrowthStore.exportAll()
      lastBackup.value = localStorage.getItem('growth_last_backup')
    }

    const triggerImport = () => {
      if (fileInputRef.value) {
        fileInputRef.value.click()
      }
    }

    const handleImport = (event) => {
      const file = event.target.files[0]
      if (!file) return
      if (!confirm('导入将覆盖现有数据，确定继续吗？')) {
        event.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          GrowthStore.importAll(e.target.result)
          alert('数据导入成功！')
          location.reload()
        } catch (err) {
          alert('导入失败，请检查文件格式是否正确。')
        }
      }
      reader.readAsText(file)
      event.target.value = ''
    }

    const requestNotification = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        notificationStatus.value = permission
      }
    }

    const clearAllData = () => {
      if (!confirm('确定要清除所有数据吗？此操作不可恢复！')) return
      if (!confirm('再次确认：清除后数据将无法找回，是否继续？')) return
      Object.values(GrowthStore.KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      localStorage.removeItem('growth_last_backup')
      alert('所有数据已清除。')
      location.reload()
    }

    onMounted(() => {
      lastBackup.value = localStorage.getItem('growth_last_backup')
      refreshNotificationStatus()
    })

    return {
      lastBackup,
      notificationStatus,
      fileInputRef,
      formatBackupDate,
      notificationLabel,
      notificationIcon,
      goBack,
      exportData,
      triggerImport,
      handleImport,
      requestNotification,
      clearAllData
    }
  },
  template: `
    <div class="page settings-page">
      <button class="settings-back-btn" @click="goBack">&larr; 返回首页</button>

      <h1 class="settings-title">设置</h1>

      <!-- Section 1: Data Backup -->
      <div class="settings-section">
        <div class="settings-section-header">
          <span class="settings-section-icon">&#128190;</span>
          <h2>数据备份</h2>
        </div>
        <div class="settings-section-body">
          <div class="settings-backup-status">
            <span class="settings-label">上次备份：</span>
            <span class="settings-value">{{ formatBackupDate }}</span>
          </div>
          <p class="settings-hint">建议每周备份一次数据</p>
          <div class="settings-actions">
            <button class="settings-btn settings-btn-export" @click="exportData">导出数据</button>
            <button class="settings-btn settings-btn-import" @click="triggerImport">导入数据</button>
            <input
              type="file"
              ref="fileInputRef"
              accept=".json"
              style="display:none"
              @change="handleImport"
            />
          </div>
        </div>
      </div>

      <!-- Section 2: Notification Settings -->
      <div class="settings-section">
        <div class="settings-section-header">
          <span class="settings-section-icon">&#128276;</span>
          <h2>通知设置</h2>
        </div>
        <div class="settings-section-body">
          <div class="settings-notification-row">
            <span class="settings-label">通知权限：</span>
            <span class="settings-value">{{ notificationLabel }} {{ notificationIcon }}</span>
          </div>
          <button
            v-if="notificationStatus === 'default'"
            class="settings-btn settings-btn-export"
            @click="requestNotification"
          >开启通知</button>
        </div>
      </div>

      <!-- Section 3: About -->
      <div class="settings-section">
        <div class="settings-section-header">
          <span class="settings-section-icon">&#9432;</span>
          <h2>关于</h2>
        </div>
        <div class="settings-section-body">
          <div class="settings-about-info">
            <p class="settings-app-name">2026 我的成长之旅</p>
            <p class="settings-version">v1.0</p>
            <p class="settings-desc">记录成长的每一步 — 财务、学习、健康、副业，一站式管理你的 2026 年度目标。</p>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="settings-danger-zone">
        <button class="settings-btn settings-btn-danger" @click="clearAllData">清除所有数据</button>
      </div>
    </div>
  `
}

// ========================================
// Router Configuration
// ========================================

const routes = [
  { path: '/', component: Dashboard },
  { path: '/finance', component: Finance },
  { path: '/beauty', component: Beauty },
  { path: '/learning', component: Learning },
  { path: '/business', component: Business },
  { path: '/reminders', component: Reminders },
  { path: '/settings', component: Settings }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ========================================
// App Instance
// ========================================

const app = createApp({
  template: `
    <div class="app-container">
      <router-view></router-view>
      <nav class="bottom-nav">
        <router-link to="/" class="nav-tab" exact-active-class="active">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">首页</span>
        </router-link>
        <router-link to="/finance" class="nav-tab" active-class="active">
          <span class="nav-icon">💰</span>
          <span class="nav-label">财务</span>
        </router-link>
        <router-link to="/beauty" class="nav-tab" active-class="active">
          <span class="nav-icon">✨</span>
          <span class="nav-label">变美</span>
        </router-link>
        <router-link to="/learning" class="nav-tab" active-class="active">
          <span class="nav-icon">📚</span>
          <span class="nav-label">学习</span>
        </router-link>
        <router-link to="/business" class="nav-tab" active-class="active">
          <span class="nav-icon">📱</span>
          <span class="nav-label">副业</span>
        </router-link>
      </nav>
    </div>
  `
})

app.use(router)
app.mount('#app')
