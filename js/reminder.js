// ========================================
// Reminder Component - Reminder System & Browser Notifications
// ========================================

// Notification helpers (global scope)
async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

function shouldFireNow(reminder, now) {
  if (reminder.completed) return false
  if (!reminder.time) return false

  const nowHour = now.getHours()
  const nowMinute = now.getMinutes()
  const [rHour, rMinute] = reminder.time.split(':').map(Number)

  if (nowHour !== rHour || nowMinute !== rMinute) return false

  const todayStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0')

  // Check if already fired this minute
  if (reminder.lastFired) {
    const firedStr = reminder.lastFired.slice(0, 16) // "YYYY-MM-DDTHH:MM"
    const nowCheck = now.toISOString().slice(0, 16)
    if (firedStr === nowCheck) return false
  }

  const rDate = reminder.date

  switch (reminder.repeat) {
    case 'none':
      return rDate === todayStr
    case 'daily':
      // Fire every day as long as today >= original date
      return todayStr >= rDate
    case 'weekly': {
      // Fire on the same weekday as the original date
      if (todayStr < rDate) return false
      const origDay = new Date(rDate + 'T00:00:00').getDay()
      return now.getDay() === origDay
    }
    case 'monthly': {
      // Fire on the same day-of-month as the original date
      if (todayStr < rDate) return false
      const origDayOfMonth = parseInt(rDate.slice(8, 10), 10)
      return now.getDate() === origDayOfMonth
    }
    default:
      return rDate === todayStr
  }
}

function startReminderChecker() {
  setInterval(() => {
    const now = new Date()
    const reminders = GrowthStore.get(GrowthStore.KEYS.REMINDERS)
    reminders.forEach(r => {
      if (!r.completed && shouldFireNow(r, now)) {
        new Notification('2026 \u6210\u957f\u63d0\u9192', {
          body: r.content,
          icon: '\u23f0',
          tag: r.id
        })
        // Update lastFired to prevent duplicate
        GrowthStore.update(GrowthStore.KEYS.REMINDERS, r.id, {
          lastFired: now.toISOString()
        })
      }
    })
  }, 60000)
}

const ReminderComponent = {
  setup() {
    const { ref, computed, onMounted } = Vue

    // Data
    const reminders = ref([])
    const showModal = ref(false)
    const editingId = ref(null)
    const notificationStatus = ref('default')

    // Form state
    const formContent = ref('')
    const formDate = ref(new Date().toISOString().slice(0, 10))
    const formTime = ref('')
    const formRepeat = ref('none')
    const formModule = ref('other')

    // Module definitions
    const moduleOptions = [
      { value: 'finance', label: '\u8d22\u52a1', icon: '\uD83D\uDCB0', color: '#667eea' },
      { value: 'beauty', label: '\u53d8\u7f8e', icon: '\u2728', color: '#fd79a8' },
      { value: 'learning', label: '\u5b66\u4e60', icon: '\uD83D\uDCDA', color: '#00b894' },
      { value: 'business', label: '\u526f\u4e1a', icon: '\uD83D\uDCF1', color: '#e17055' },
      { value: 'other', label: '\u5176\u4ed6', icon: '\u23f0', color: '#95a5a6' }
    ]

    // Repeat options
    const repeatOptions = [
      { value: 'none', label: '\u4e0d\u91cd\u590d' },
      { value: 'daily', label: '\u6bcf\u5929' },
      { value: 'weekly', label: '\u6bcf\u5468' },
      { value: 'monthly', label: '\u6bcf\u6708' }
    ]

    const repeatLabels = {
      none: '',
      daily: '\u6bcf\u5929',
      weekly: '\u6bcf\u5468',
      monthly: '\u6bcf\u6708'
    }

    const getModuleInfo = (mod) => {
      return moduleOptions.find(m => m.value === mod) || moduleOptions[4]
    }

    // Load data
    const loadReminders = () => {
      reminders.value = GrowthStore.get(GrowthStore.KEYS.REMINDERS)
    }

    // Check notification permission
    const checkPermission = () => {
      if ('Notification' in window) {
        notificationStatus.value = Notification.permission
      } else {
        notificationStatus.value = 'unsupported'
      }
    }

    const enableNotifications = async () => {
      const granted = await requestNotificationPermission()
      checkPermission()
    }

    // Grouping logic
    const getTodayStr = () => {
      const d = new Date()
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0')
    }

    const getTomorrowStr = () => {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0')
    }

    const getEndOfWeekStr = () => {
      const d = new Date()
      const dayOfWeek = d.getDay()
      const daysUntilEnd = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
      d.setDate(d.getDate() + daysUntilEnd)
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0')
    }

    const groupedReminders = computed(() => {
      const todayStr = getTodayStr()
      const tomorrowStr = getTomorrowStr()
      const endOfWeek = getEndOfWeekStr()

      const groups = {
        today: { label: '\u4eca\u5929', items: [] },
        tomorrow: { label: '\u660e\u5929', items: [] },
        week: { label: '\u672c\u5468', items: [] },
        later: { label: '\u4ee5\u540e', items: [] }
      }

      // Sort by date+time
      const sorted = [...reminders.value].sort((a, b) => {
        const da = a.date + (a.time || '99:99')
        const db = b.date + (b.time || '99:99')
        return da.localeCompare(db)
      })

      sorted.forEach(r => {
        const d = r.date || ''

        // For repeating reminders, check if they should appear in today/tomorrow/week
        if (r.repeat === 'daily') {
          // Daily repeats always show in today
          groups.today.items.push(r)
          return
        }

        if (r.repeat === 'weekly') {
          // Show in this week if the weekday matches
          const origDay = new Date(r.date + 'T00:00:00').getDay()
          const now = new Date()
          const todayDay = now.getDay()
          if (origDay === todayDay) {
            groups.today.items.push(r)
          } else {
            // Calculate next occurrence this week
            let daysUntil = origDay - todayDay
            if (daysUntil < 0) daysUntil += 7
            if (daysUntil === 1) {
              groups.tomorrow.items.push(r)
            } else if (daysUntil <= (7 - todayDay)) {
              groups.week.items.push(r)
            } else {
              groups.later.items.push(r)
            }
          }
          return
        }

        if (r.repeat === 'monthly') {
          const origDayOfMonth = parseInt(r.date.slice(8, 10), 10)
          const now = new Date()
          if (origDayOfMonth === now.getDate()) {
            groups.today.items.push(r)
          } else if (origDayOfMonth === now.getDate() + 1) {
            groups.tomorrow.items.push(r)
          } else {
            groups.later.items.push(r)
          }
          return
        }

        // Non-repeating
        if (d === todayStr) {
          groups.today.items.push(r)
        } else if (d === tomorrowStr) {
          groups.tomorrow.items.push(r)
        } else if (d > tomorrowStr && d <= endOfWeek) {
          groups.week.items.push(r)
        } else if (d > endOfWeek) {
          groups.later.items.push(r)
        } else {
          // Past non-completed items still show in today
          if (!r.completed) {
            groups.today.items.push(r)
          } else {
            groups.later.items.push(r)
          }
        }
      })

      // Return only non-empty groups
      return Object.values(groups).filter(g => g.items.length > 0)
    })

    const totalCount = computed(() => reminders.value.length)

    // Modal operations
    const openAddModal = () => {
      editingId.value = null
      formContent.value = ''
      formDate.value = new Date().toISOString().slice(0, 10)
      formTime.value = ''
      formRepeat.value = 'none'
      formModule.value = 'other'
      showModal.value = true
    }

    const openEditModal = (reminder) => {
      editingId.value = reminder.id
      formContent.value = reminder.content
      formDate.value = reminder.date
      formTime.value = reminder.time || ''
      formRepeat.value = reminder.repeat || 'none'
      formModule.value = reminder.module || 'other'
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }

    const saveReminder = async () => {
      if (!formContent.value.trim()) {
        alert('\u8bf7\u8f93\u5165\u63d0\u9192\u5185\u5bb9')
        return
      }

      const modInfo = getModuleInfo(formModule.value)
      const data = {
        content: formContent.value.trim(),
        date: formDate.value,
        time: formTime.value || null,
        repeat: formRepeat.value,
        module: formModule.value,
        moduleIcon: modInfo.icon,
        moduleColor: modInfo.color,
        completed: false,
        lastFired: null
      }

      if (editingId.value) {
        GrowthStore.update(GrowthStore.KEYS.REMINDERS, editingId.value, data)
      } else {
        GrowthStore.add(GrowthStore.KEYS.REMINDERS, data)
        // Request notification permission on first reminder
        if (notificationStatus.value === 'default') {
          await requestNotificationPermission()
          checkPermission()
        }
      }

      loadReminders()
      closeModal()
    }

    const deleteReminder = () => {
      if (!editingId.value) return
      if (confirm('\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u4e2a\u63d0\u9192\u5417\uff1f')) {
        GrowthStore.remove(GrowthStore.KEYS.REMINDERS, editingId.value)
        loadReminders()
        closeModal()
      }
    }

    const toggleCompleted = (reminder) => {
      GrowthStore.update(GrowthStore.KEYS.REMINDERS, reminder.id, {
        completed: !reminder.completed
      })
      loadReminders()
    }

    onMounted(() => {
      loadReminders()
      checkPermission()
      startReminderChecker()
    })

    return {
      reminders,
      showModal,
      editingId,
      notificationStatus,
      formContent,
      formDate,
      formTime,
      formRepeat,
      formModule,
      moduleOptions,
      repeatOptions,
      repeatLabels,
      getModuleInfo,
      groupedReminders,
      totalCount,
      openAddModal,
      openEditModal,
      closeModal,
      saveReminder,
      deleteReminder,
      toggleCompleted,
      enableNotifications
    }
  },
  template: `
    <div class="page reminder-page">
      <!-- Page Header -->
      <div class="page-header" style="background: linear-gradient(135deg, #667eea, #764ba2);">
        <h1>\u23f0 \u63d0\u9192\u7cfb\u7edf</h1>
        <p>\u7ba1\u7406\u4f60\u7684\u65e5\u7a0b\u63d0\u9192</p>
      </div>

      <!-- Notification Permission Banner -->
      <div v-if="notificationStatus === 'default'" class="reminder-permission-banner" @click="enableNotifications">
        <span class="permission-icon">\uD83D\uDD14</span>
        <span class="permission-text">\u70b9\u51fb\u5f00\u542f\u901a\u77e5\uff0c\u8ba9\u63d0\u9192\u4e0d\u518d\u9519\u8fc7</span>
        <span class="permission-arrow">&rsaquo;</span>
      </div>
      <div v-else-if="notificationStatus === 'denied'" class="reminder-permission-banner reminder-permission-denied">
        <span class="permission-icon">\uD83D\uDD15</span>
        <span class="permission-text">\u901a\u77e5\u5df2\u88ab\u7981\u6b62\uff0c\u8bf7\u5728\u6d4f\u89c8\u5668\u8bbe\u7f6e\u4e2d\u5f00\u542f</span>
      </div>
      <div v-else-if="notificationStatus === 'granted'" class="reminder-permission-banner reminder-permission-granted">
        <span class="permission-icon">\u2705</span>
        <span class="permission-text">\u901a\u77e5\u5df2\u5f00\u542f\uff0c\u4f1a\u6309\u65f6\u63d0\u9192\u4f60</span>
      </div>

      <!-- Empty State -->
      <div v-if="totalCount === 0" class="empty-state">
        <div class="empty-icon">\u23f0</div>
        <p>\u8fd8\u6ca1\u6709\u63d0\u9192\uff0c\u70b9\u51fb+\u6dfb\u52a0\u4e00\u4e2a\u5427\uff01</p>
      </div>

      <!-- Reminder List (Grouped) -->
      <div v-else class="reminder-groups">
        <div v-for="group in groupedReminders" :key="group.label" class="reminder-group">
          <div class="reminder-group-header">
            <span class="group-label">{{ group.label }}</span>
            <span class="group-count">{{ group.items.length }}</span>
          </div>
          <div class="reminder-cards">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="reminder-card"
              :class="{ 'reminder-completed': item.completed }"
              :style="{ borderLeftColor: item.moduleColor || '#95a5a6' }"
              @click="openEditModal(item)"
            >
              <div class="reminder-card-left">
                <label class="reminder-checkbox-wrapper" @click.stop>
                  <input
                    type="checkbox"
                    class="reminder-checkbox"
                    :checked="item.completed"
                    @change="toggleCompleted(item)"
                  />
                  <span class="reminder-checkbox-custom" :style="{ borderColor: item.moduleColor || '#95a5a6' }"></span>
                </label>
                <div class="reminder-card-info">
                  <span class="reminder-card-content">{{ item.content }}</span>
                  <div class="reminder-card-meta">
                    <span v-if="item.time" class="reminder-card-time">{{ item.time }}</span>
                    <span v-if="item.repeat && item.repeat !== 'none'" class="reminder-repeat-badge">{{ item.repeat === 'daily' ? '\u6bcf\u5929' : item.repeat === 'weekly' ? '\u6bcf\u5468' : '\u6bcf\u6708' }}</span>
                    <span class="reminder-module-dot" :style="{ background: item.moduleColor || '#95a5a6' }"></span>
                    <span class="reminder-module-label">{{ item.moduleIcon }} {{ getModuleInfo(item.module).label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Button -->
      <button class="finance-add-btn" @click="openAddModal">+</button>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content reminder-modal">
          <div class="modal-header">
            <span class="modal-title">{{ editingId ? '\u7f16\u8f91\u63d0\u9192' : '\u65b0\u5efa\u63d0\u9192' }}</span>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>

          <!-- Content Input -->
          <div class="form-group">
            <label class="form-label">\u63d0\u9192\u5185\u5bb9</label>
            <input type="text" class="form-input" v-model="formContent" placeholder="\u4f8b\u5982\uff1a\u5b66\u4e60SQL\u3001\u5403\u836f..." />
          </div>

          <!-- Date Picker -->
          <div class="form-group">
            <label class="form-label">\u65e5\u671f</label>
            <input type="date" class="form-input" v-model="formDate" />
          </div>

          <!-- Time Picker -->
          <div class="form-group">
            <label class="form-label">\u65f6\u95f4</label>
            <input type="time" class="form-input reminder-time-input" v-model="formTime" />
          </div>

          <!-- Repeat Rule -->
          <div class="form-group">
            <label class="form-label">\u91cd\u590d</label>
            <div class="reminder-pill-group">
              <button
                v-for="opt in repeatOptions"
                :key="opt.value"
                class="reminder-pill"
                :class="{ 'reminder-pill-active': formRepeat === opt.value }"
                @click="formRepeat = opt.value"
              >{{ opt.label }}</button>
            </div>
          </div>

          <!-- Module Association -->
          <div class="form-group">
            <label class="form-label">\u5173\u8054\u6a21\u5757</label>
            <div class="reminder-pill-group">
              <button
                v-for="mod in moduleOptions"
                :key="mod.value"
                class="reminder-pill reminder-module-pill"
                :class="{ 'reminder-pill-active': formModule === mod.value }"
                :style="formModule === mod.value ? { background: mod.color, borderColor: mod.color, color: '#fff' } : {}"
                @click="formModule = mod.value"
              >{{ mod.icon }} {{ mod.label }}</button>
            </div>
          </div>

          <!-- Save Button -->
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg finance-save-btn" @click="saveReminder">
            {{ editingId ? '\u4fdd\u5b58\u4fee\u6539' : '\u4fdd\u5b58' }}
          </button>
          <!-- Delete Button (edit mode only) -->
          <button v-if="editingId" class="btn btn-block reminder-delete-btn" @click="deleteReminder">
            \u5220\u9664\u63d0\u9192
          </button>
          </div>
        </div>
      </div>
    </div>
  `
}
