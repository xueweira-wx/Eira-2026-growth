// ========================================
// Beauty Component - Weight, Exercise & Skincare
// ========================================

const BeautyComponent = {
  setup() {
    const { ref, computed, onMounted, watch, nextTick } = Vue

    // Sub-tab state
    const activeTab = ref('weight') // 'weight' | 'exercise' | 'skincare'

    // ========================================
    // Tab 1: Weight Tracking
    // ========================================
    const weightRecords = ref([])
    const showWeightModal = ref(false)
    const weightFormValue = ref('')
    const weightFormDate = ref(new Date().toISOString().slice(0, 10))
    const weightChartRef = ref(null)
    let weightChartInstance = null

    // Target weight from settings
    const targetWeight = computed(() => {
      const settings = GrowthStore.getObj(GrowthStore.KEYS.SETTINGS)
      return settings.targetWeight || null
    })

    const showTargetModal = ref(false)
    const targetFormValue = ref('')

    const openTargetModal = () => {
      targetFormValue.value = targetWeight.value ? String(targetWeight.value) : ''
      showTargetModal.value = true
    }

    const saveTarget = () => {
      const val = parseFloat(targetFormValue.value)
      if (isNaN(val) || val <= 0) {
        alert('\u8BF7\u8F93\u5165\u6709\u6548\u7684\u76EE\u6807\u4F53\u91CD')
        return
      }
      const settings = GrowthStore.getObj(GrowthStore.KEYS.SETTINGS)
      settings.targetWeight = val
      GrowthStore.set(GrowthStore.KEYS.SETTINGS, settings)
      showTargetModal.value = false
      nextTick(() => renderWeightChart())
    }

    const loadWeight = () => {
      weightRecords.value = GrowthStore.get(GrowthStore.KEYS.WEIGHT)
    }

    const sortedWeights = computed(() => {
      return [...weightRecords.value].sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    const sortedWeightsDesc = computed(() => {
      return [...weightRecords.value].sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const startingWeight = computed(() => {
      if (!sortedWeights.value.length) return null
      return Number(sortedWeights.value[0].weight)
    })

    const currentWeight = computed(() => {
      if (!sortedWeightsDesc.value.length) return null
      return Number(sortedWeightsDesc.value[0].weight)
    })

    const weightProgress = computed(() => {
      if (!startingWeight.value || !currentWeight.value || !targetWeight.value) return null
      const totalDiff = startingWeight.value - targetWeight.value
      if (totalDiff === 0) return 100
      const currentDiff = startingWeight.value - currentWeight.value
      const pct = Math.min(100, Math.max(0, (currentDiff / totalDiff) * 100))
      return Math.round(pct)
    })

    const weightGap = computed(() => {
      if (!currentWeight.value || !targetWeight.value) return null
      return Math.abs(currentWeight.value - targetWeight.value).toFixed(1)
    })

    const daysSinceLastRecord = computed(() => {
      if (!sortedWeightsDesc.value.length) return null
      const lastDate = new Date(sortedWeightsDesc.value[0].date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      lastDate.setHours(0, 0, 0, 0)
      return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
    })

    const openWeightModal = () => {
      weightFormValue.value = ''
      weightFormDate.value = new Date().toISOString().slice(0, 10)
      showWeightModal.value = true
    }

    const saveWeight = () => {
      const w = parseFloat(weightFormValue.value)
      if (isNaN(w) || w <= 0) {
        alert('\u8BF7\u8F93\u5165\u6709\u6548\u7684\u4F53\u91CD')
        return
      }
      GrowthStore.add(GrowthStore.KEYS.WEIGHT, {
        weight: Math.round(w * 10) / 10,
        date: weightFormDate.value
      })
      loadWeight()
      showWeightModal.value = false
      nextTick(() => renderWeightChart())
    }

    const deleteWeight = (id) => {
      if (confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u8BB0\u5F55\u5417\uFF1F')) {
        GrowthStore.remove(GrowthStore.KEYS.WEIGHT, id)
        loadWeight()
        nextTick(() => renderWeightChart())
      }
    }

    const renderWeightChart = () => {
      const canvas = weightChartRef.value
      if (!canvas) return
      if (weightChartInstance) weightChartInstance.destroy()

      const data = sortedWeights.value
      if (data.length < 1) return

      const labels = data.map(d => d.date.slice(5))
      const values = data.map(d => Number(d.weight))

      const ctx = canvas.getContext('2d')
      const gradient = ctx.createLinearGradient(0, 0, 0, 220)
      gradient.addColorStop(0, 'rgba(255, 217, 61, 0.4)')
      gradient.addColorStop(1, 'rgba(255, 217, 61, 0.02)')

      const datasets = [{
        label: '\u4F53\u91CD',
        data: values,
        borderColor: '#ffd93d',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ffd93d',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]

      // Target weight line
      if (targetWeight.value) {
        datasets.push({
          label: '\u76EE\u6807\u4F53\u91CD',
          data: new Array(labels.length).fill(targetWeight.value),
          borderColor: '#ff6b6b',
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        })
      }

      weightChartInstance = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top', labels: { font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  return ctx.dataset.label + ': ' + ctx.raw + ' kg'
                }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                font: { size: 11 },
                callback: function(val) { return val + ' kg' }
              }
            },
            x: { ticks: { font: { size: 10 } } }
          }
        }
      })
    }

    // ========================================
    // Tab 2: Exercise
    // ========================================
    const exerciseRecords = ref([])
    const showExerciseModal = ref(false)
    const exerciseFormType = ref('\u8DD1\u6B65')
    const exerciseFormIcon = ref('\uD83C\uDFC3')
    const exerciseFormDuration = ref('')
    const exerciseFormCalories = ref('')
    const exerciseFormDate = ref(new Date().toISOString().slice(0, 10))

    // Calendar state
    const calYear = ref(new Date().getFullYear())
    const calMonth = ref(new Date().getMonth()) // 0-indexed

    const exerciseTypes = [
      { name: '\u8DD1\u6B65', icon: '\uD83C\uDFC3' },
      { name: '\u745C\u4F3D', icon: '\uD83E\uDDD8' },
      { name: '\u529B\u91CF', icon: '\uD83D\uDCAA' },
      { name: '\u6E38\u6CF3', icon: '\uD83C\uDFCA' },
      { name: '\u9A91\u884C', icon: '\uD83D\uDEB4' },
      { name: '\u5176\u4ED6', icon: '\uD83C\uDFAF' }
    ]

    const loadExercise = () => {
      exerciseRecords.value = GrowthStore.get(GrowthStore.KEYS.EXERCISE)
    }

    const selectExerciseType = (t) => {
      exerciseFormType.value = t.name
      exerciseFormIcon.value = t.icon
    }

    const openExerciseModal = () => {
      exerciseFormType.value = '\u8DD1\u6B65'
      exerciseFormIcon.value = '\uD83C\uDFC3'
      exerciseFormDuration.value = ''
      exerciseFormCalories.value = ''
      exerciseFormDate.value = new Date().toISOString().slice(0, 10)
      showExerciseModal.value = true
    }

    const saveExercise = () => {
      const dur = parseInt(exerciseFormDuration.value)
      if (isNaN(dur) || dur <= 0) {
        alert('\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8FD0\u52A8\u65F6\u957F')
        return
      }
      const cal = exerciseFormCalories.value ? parseInt(exerciseFormCalories.value) : 0
      GrowthStore.add(GrowthStore.KEYS.EXERCISE, {
        type: exerciseFormType.value,
        typeIcon: exerciseFormIcon.value,
        duration: dur,
        calories: cal,
        date: exerciseFormDate.value
      })
      loadExercise()
      showExerciseModal.value = false
    }

    const deleteExercise = (id) => {
      if (confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u8BB0\u5F55\u5417\uFF1F')) {
        GrowthStore.remove(GrowthStore.KEYS.EXERCISE, id)
        loadExercise()
      }
    }

    // Calendar helpers
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
    }

    const nextCalMonth = () => {
      if (calMonth.value === 11) {
        calMonth.value = 0
        calYear.value++
      } else {
        calMonth.value++
      }
    }

    const calendarDays = computed(() => {
      const firstDay = new Date(calYear.value, calMonth.value, 1).getDay()
      const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()

      // Build exercise map for the month
      const exerciseMap = {}
      exerciseRecords.value.forEach(e => {
        const d = new Date(e.date)
        if (d.getFullYear() === calYear.value && d.getMonth() === calMonth.value) {
          const day = d.getDate()
          if (!exerciseMap[day]) exerciseMap[day] = 0
          exerciseMap[day] += (e.duration || 0)
        }
      })

      const cells = []
      // Blank cells for days before the 1st
      for (let i = 0; i < firstDay; i++) {
        cells.push({ day: null, minutes: 0 })
      }
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, minutes: exerciseMap[d] || 0 })
      }
      return cells
    })

    const getHeatColor = (minutes) => {
      if (minutes === 0) return '#f0f0f0'
      if (minutes < 15) return '#c6efce'
      if (minutes < 30) return '#7bc96f'
      if (minutes < 60) return '#239a3b'
      return '#196127'
    }

    // Monthly stats
    const monthExercises = computed(() => {
      return exerciseRecords.value.filter(e => {
        const d = new Date(e.date)
        return d.getFullYear() === calYear.value && d.getMonth() === calMonth.value
      })
    })

    const monthExerciseDays = computed(() => {
      const days = new Set()
      monthExercises.value.forEach(e => {
        days.add(new Date(e.date).getDate())
      })
      return days.size
    })

    const monthTotalDuration = computed(() => {
      return monthExercises.value.reduce((sum, e) => sum + (e.duration || 0), 0)
    })

    const monthTotalCalories = computed(() => {
      return monthExercises.value.reduce((sum, e) => sum + (e.calories || 0), 0)
    })

    const formatDuration = (mins) => {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      if (h > 0) return `${h}\u5C0F\u65F6${m}\u5206\u949F`
      return `${m}\u5206\u949F`
    }

    // Exercise log for current month, sorted desc
    const monthExerciseLog = computed(() => {
      return [...monthExercises.value].sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    // ========================================
    // Tab 3: Skincare & Beauty Projects
    // ========================================
    const skincareRecords = ref([])
    const beautyPlans = ref([])
    const skincareRoutine = ref('morning') // 'morning' | 'evening'
    const skincareNotes = ref('')

    const morningSteps = ['\u6D01\u9762', '\u723D\u80A4\u6C34', '\u7CBE\u534E', '\u4E73\u6DB2/\u9762\u971C', '\u9632\u6652', '\u7F8E\u5BB9\u6DB2', '\u773C\u971C']
    const eveningSteps = ['\u6D01\u9762', '\u723D\u80A4\u6C34', '\u7CBE\u534E', '\u4E73\u6DB2/\u9762\u971C', '\u9762\u819C', '\u773C\u971C']

    const currentSteps = computed(() => {
      return skincareRoutine.value === 'morning' ? morningSteps : eveningSteps
    })

    const checkedSteps = ref([])

    const loadSkincare = () => {
      skincareRecords.value = GrowthStore.get(GrowthStore.KEYS.SKINCARE)
      beautyPlans.value = GrowthStore.get(GrowthStore.KEYS.BEAUTY_PLANS)
    }

    // Load today's checked steps for the current routine
    const loadTodayRoutine = () => {
      const todayStr = new Date().toISOString().slice(0, 10)
      const existing = skincareRecords.value.find(
        r => r.date === todayStr && r.routine === skincareRoutine.value
      )
      if (existing) {
        checkedSteps.value = [...(existing.steps || [])]
        skincareNotes.value = existing.notes || ''
      } else {
        checkedSteps.value = []
        skincareNotes.value = ''
      }
    }

    watch(skincareRoutine, () => {
      loadTodayRoutine()
    })

    const toggleStep = (step) => {
      const idx = checkedSteps.value.indexOf(step)
      if (idx >= 0) {
        checkedSteps.value.splice(idx, 1)
      } else {
        checkedSteps.value.push(step)
      }
    }

    const saveSkincare = () => {
      const todayStr = new Date().toISOString().slice(0, 10)
      const existing = skincareRecords.value.find(
        r => r.date === todayStr && r.routine === skincareRoutine.value
      )
      if (existing) {
        GrowthStore.update(GrowthStore.KEYS.SKINCARE, existing.id, {
          steps: [...checkedSteps.value],
          notes: skincareNotes.value
        })
      } else {
        GrowthStore.add(GrowthStore.KEYS.SKINCARE, {
          routine: skincareRoutine.value,
          steps: [...checkedSteps.value],
          notes: skincareNotes.value,
          date: todayStr
        })
      }
      loadSkincare()
      alert('\u62A4\u80A4\u8BB0\u5F55\u5DF2\u4FDD\u5B58')
    }

    // Skincare streak
    const skincareStreak = computed(() => {
      const records = skincareRecords.value
      if (!records.length) return 0

      // Get unique dates with skincare records
      const dates = [...new Set(records.map(r => r.date))].sort().reverse()
      if (!dates.length) return 0

      // Count consecutive days from today
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateStr = checkDate.toISOString().slice(0, 10)
        if (dates.includes(dateStr)) {
          streak++
        } else {
          // Allow today to not yet be recorded for streak
          if (i === 0) continue
          break
        }
      }
      return streak
    })

    // Beauty plans
    const showPlanModal = ref(false)
    const planFormName = ref('')
    const planFormFrequency = ref(2)
    const planFormPeriod = ref('week')

    const openPlanModal = () => {
      planFormName.value = ''
      planFormFrequency.value = 2
      planFormPeriod.value = 'week'
      showPlanModal.value = true
    }

    const savePlan = () => {
      if (!planFormName.value.trim()) {
        alert('\u8BF7\u8F93\u5165\u8BA1\u5212\u540D\u79F0')
        return
      }
      GrowthStore.add(GrowthStore.KEYS.BEAUTY_PLANS, {
        name: planFormName.value.trim(),
        frequency: parseInt(planFormFrequency.value) || 1,
        period: planFormPeriod.value,
        checkins: []
      })
      loadSkincare()
      showPlanModal.value = false
    }

    const deletePlan = (id) => {
      if (confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8BA1\u5212\u5417\uFF1F')) {
        GrowthStore.remove(GrowthStore.KEYS.BEAUTY_PLANS, id)
        loadSkincare()
      }
    }

    const checkinPlan = (plan) => {
      const todayStr = new Date().toISOString().slice(0, 10)
      const checkins = plan.checkins || []
      if (checkins.includes(todayStr)) {
        alert('\u4ECA\u5929\u5DF2\u7ECF\u6253\u5361\u8FC7\u4E86')
        return
      }
      checkins.push(todayStr)
      GrowthStore.update(GrowthStore.KEYS.BEAUTY_PLANS, plan.id, { checkins })
      loadSkincare()
    }

    const getPlanProgress = (plan) => {
      const checkins = plan.checkins || []
      const now = new Date()

      if (plan.period === 'week') {
        // Get start of current week (Monday)
        const startOfWeek = new Date(now)
        const dayOfWeek = now.getDay()
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startOfWeek.setDate(now.getDate() - diff)
        startOfWeek.setHours(0, 0, 0, 0)

        const count = checkins.filter(d => new Date(d) >= startOfWeek).length
        return { count, total: plan.frequency, label: '\u672C\u5468' }
      } else {
        // Month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const count = checkins.filter(d => new Date(d) >= startOfMonth).length
        return { count, total: plan.frequency, label: '\u672C\u6708' }
      }
    }

    const getPlanStreak = (plan) => {
      const checkins = (plan.checkins || []).sort()
      if (!checkins.length) return 0
      // Count unique dates
      const uniqueDates = [...new Set(checkins)].sort().reverse()
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateStr = checkDate.toISOString().slice(0, 10)
        if (uniqueDates.includes(dateStr)) {
          streak++
        } else {
          if (i === 0) continue
          break
        }
      }
      return streak
    }

    // ========================================
    // Watch tab changes
    // ========================================
    watch(activeTab, (val) => {
      if (val === 'weight') {
        nextTick(() => renderWeightChart())
      }
      if (val === 'skincare') {
        loadTodayRoutine()
      }
    })

    onMounted(() => {
      loadWeight()
      loadExercise()
      loadSkincare()
      loadTodayRoutine()
      nextTick(() => renderWeightChart())
    })

    return {
      activeTab,
      // Weight
      weightRecords, showWeightModal, weightFormValue, weightFormDate, weightChartRef,
      targetWeight, showTargetModal, targetFormValue,
      openTargetModal, saveTarget,
      sortedWeights, sortedWeightsDesc,
      startingWeight, currentWeight, weightProgress, weightGap, daysSinceLastRecord,
      openWeightModal, saveWeight, deleteWeight,
      // Exercise
      exerciseRecords, showExerciseModal,
      exerciseFormType, exerciseFormIcon, exerciseFormDuration, exerciseFormCalories, exerciseFormDate,
      exerciseTypes, selectExerciseType,
      calYear, calMonth, calMonthLabel, prevCalMonth, nextCalMonth,
      calendarDays, getHeatColor,
      monthExerciseDays, monthTotalDuration, monthTotalCalories, formatDuration,
      monthExerciseLog,
      openExerciseModal, saveExercise, deleteExercise,
      // Skincare
      skincareRecords, beautyPlans, skincareRoutine, skincareNotes,
      currentSteps, checkedSteps, toggleStep, saveSkincare,
      skincareStreak,
      showPlanModal, planFormName, planFormFrequency, planFormPeriod,
      openPlanModal, savePlan, deletePlan, checkinPlan,
      getPlanProgress, getPlanStreak,
      loadTodayRoutine
    }
  },
  template: `
    <div class="page beauty-page">
      <!-- Sub-tabs -->
      <div class="beauty-tabs">
        <button class="beauty-tab" :class="{ active: activeTab === 'weight' }" @click="activeTab = 'weight'">\u4F53\u91CD</button>
        <button class="beauty-tab" :class="{ active: activeTab === 'exercise' }" @click="activeTab = 'exercise'">\u8FD0\u52A8</button>
        <button class="beauty-tab" :class="{ active: activeTab === 'skincare' }" @click="activeTab = 'skincare'">\u7F8E\u5BB9</button>
      </div>

      <!-- ===================== Weight Tab ===================== -->
      <div v-if="activeTab === 'weight'" class="beauty-content">
        <!-- Target Weight -->
        <div class="weight-target-bar" @click="openTargetModal">
          <span class="target-label">\u76EE\u6807\u4F53\u91CD</span>
          <span class="target-value">{{ targetWeight ? targetWeight + ' kg' : '\u70B9\u51FB\u8BBE\u7F6E' }}</span>
          <span class="target-edit">\u270F\uFE0F</span>
        </div>

        <!-- Stats Cards -->
        <div class="weight-stats-grid">
          <div class="weight-stat-card">
            <div class="weight-stat-value">{{ startingWeight ? startingWeight + ' kg' : '--' }}</div>
            <div class="weight-stat-label">\u8D77\u59CB\u4F53\u91CD</div>
          </div>
          <div class="weight-stat-card">
            <div class="weight-stat-value weight-stat-current">{{ currentWeight ? currentWeight + ' kg' : '--' }}</div>
            <div class="weight-stat-label">\u5F53\u524D\u4F53\u91CD</div>
          </div>
          <div class="weight-stat-card">
            <div class="weight-stat-value">{{ targetWeight ? targetWeight + ' kg' : '--' }}</div>
            <div class="weight-stat-label">\u76EE\u6807\u4F53\u91CD</div>
          </div>
        </div>

        <!-- Progress -->
        <div v-if="weightProgress !== null" class="weight-progress-card card">
          <div class="weight-progress-header">
            <span>\u8FDB\u5EA6</span>
            <span class="weight-progress-pct">{{ weightProgress }}%</span>
          </div>
          <div class="progress-bar" style="height:8px;">
            <div class="progress-fill" :style="{ width: weightProgress + '%', background: 'linear-gradient(90deg, #ffd93d, #ff6b6b)' }"></div>
          </div>
          <div class="weight-gap-hint">\u8DDD\u79BB\u76EE\u6807\u8FD8\u5DEE {{ weightGap }} kg</div>
        </div>

        <!-- Log Button -->
        <button class="btn btn-primary btn-block beauty-log-btn" @click="openWeightModal">
          \u8BB0\u5F55\u4F53\u91CD
        </button>

        <!-- Weight Chart -->
        <div class="chart-card" v-if="sortedWeights.length > 0">
          <h3 class="chart-title">\u4F53\u91CD\u8D8B\u52BF</h3>
          <div class="chart-container">
            <canvas :ref="el => weightChartRef = el"></canvas>
          </div>
        </div>

        <div v-if="sortedWeights.length === 0" class="empty-state">
          <div class="empty-icon">\u2696\uFE0F</div>
          <div class="empty-text">\u8FD8\u6CA1\u6709\u4F53\u91CD\u8BB0\u5F55</div>
          <div class="empty-hint">\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u5F00\u59CB\u8BB0\u5F55\u5427\uFF01</div>
        </div>

        <!-- Weight Records List -->
        <div class="beauty-record-list" v-if="sortedWeightsDesc.length > 0">
          <h3 class="section-title">\u8BB0\u5F55\u5386\u53F2</h3>
          <div class="record-scroll">
            <div v-for="r in sortedWeightsDesc" :key="r.id" class="record-item">
              <div class="record-left">
                <span class="record-date">{{ r.date }}</span>
                <span class="record-weight">{{ r.weight }} kg</span>
              </div>
              <button class="transaction-delete" @click="deleteWeight(r.id)">&times;</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== Exercise Tab ===================== -->
      <div v-if="activeTab === 'exercise'" class="beauty-content">
        <!-- Check-in Button -->
        <button class="btn btn-secondary btn-block beauty-log-btn" @click="openExerciseModal">
          \u8FD0\u52A8\u6253\u5361
        </button>

        <!-- Monthly Calendar Heatmap -->
        <div class="card exercise-calendar-card">
          <div class="month-nav">
            <button class="month-arrow" @click="prevCalMonth">&lsaquo;</button>
            <span class="month-label">{{ calMonthLabel }}</span>
            <button class="month-arrow" @click="nextCalMonth">&rsaquo;</button>
          </div>
          <div class="calendar-weekdays">
            <span v-for="wd in ['\u65E5','\u4E00','\u4E8C','\u4E09','\u56DB','\u4E94','\u516D']" :key="wd" class="cal-weekday">{{ wd }}</span>
          </div>
          <div class="calendar-grid">
            <div v-for="(cell, idx) in calendarDays" :key="idx"
              class="cal-cell"
              :style="{ background: cell.day ? getHeatColor(cell.minutes) : 'transparent' }"
              :title="cell.day ? cell.day + '\u65E5: ' + cell.minutes + '\u5206\u949F' : ''"
            >
              <span v-if="cell.day" class="cal-day-num" :class="{ 'cal-has-exercise': cell.minutes > 0 }">{{ cell.day }}</span>
            </div>
          </div>
          <div class="cal-legend">
            <span class="cal-legend-label">\u5C11</span>
            <span class="cal-legend-box" style="background:#f0f0f0"></span>
            <span class="cal-legend-box" style="background:#c6efce"></span>
            <span class="cal-legend-box" style="background:#7bc96f"></span>
            <span class="cal-legend-box" style="background:#239a3b"></span>
            <span class="cal-legend-box" style="background:#196127"></span>
            <span class="cal-legend-label">\u591A</span>
          </div>
        </div>

        <!-- Monthly Stats -->
        <div class="exercise-stats-grid">
          <div class="exercise-stat-card">
            <div class="exercise-stat-value">{{ monthExerciseDays }}</div>
            <div class="exercise-stat-label">\u8FD0\u52A8\u5929\u6570</div>
          </div>
          <div class="exercise-stat-card">
            <div class="exercise-stat-value">{{ formatDuration(monthTotalDuration) }}</div>
            <div class="exercise-stat-label">\u603B\u65F6\u957F</div>
          </div>
          <div class="exercise-stat-card">
            <div class="exercise-stat-value">{{ monthTotalCalories }}</div>
            <div class="exercise-stat-label">\u5361\u8DEF\u91CC\u6D88\u8017</div>
          </div>
        </div>

        <!-- Exercise Log -->
        <div class="beauty-record-list" v-if="monthExerciseLog.length > 0">
          <h3 class="section-title">\u8FD0\u52A8\u8BB0\u5F55</h3>
          <div class="record-scroll">
            <div v-for="e in monthExerciseLog" :key="e.id" class="record-item exercise-record">
              <div class="record-left">
                <span class="exercise-type-icon">{{ e.typeIcon }}</span>
                <div class="exercise-record-info">
                  <span class="exercise-record-name">{{ e.type }}</span>
                  <span class="exercise-record-date">{{ e.date }}</span>
                </div>
              </div>
              <div class="record-right">
                <span class="exercise-record-detail">{{ e.duration }}\u5206\u949F</span>
                <span v-if="e.calories" class="exercise-record-cal">{{ e.calories }}kcal</span>
                <button class="transaction-delete" @click="deleteExercise(e.id)">&times;</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="monthExerciseLog.length === 0" class="empty-state">
          <div class="empty-icon">\uD83C\uDFC3</div>
          <div class="empty-text">\u672C\u6708\u8FD8\u6CA1\u6709\u8FD0\u52A8\u8BB0\u5F55</div>
          <div class="empty-hint">\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u5F00\u59CB\u8BB0\u5F55\u8FD0\u52A8\u5427\uFF01</div>
        </div>
      </div>

      <!-- ===================== Skincare Tab ===================== -->
      <div v-if="activeTab === 'skincare'" class="beauty-content">
        <!-- Skincare Streak -->
        <div class="skincare-streak-card card" v-if="skincareStreak > 0">
          <span class="streak-fire">\uD83D\uDD25</span>
          <span class="streak-text">\u8FDE\u7EED\u62A4\u80A4 <strong>{{ skincareStreak }}</strong> \u5929</span>
        </div>

        <!-- Daily Skincare Log -->
        <div class="card skincare-log-card">
          <h3 class="section-title">\u4ECA\u65E5\u62A4\u80A4</h3>
          <!-- Routine Toggle -->
          <div class="type-toggle" style="margin-bottom:16px;">
            <button class="type-btn" :class="{ 'type-morning-active': skincareRoutine === 'morning' }" @click="skincareRoutine = 'morning'">
              \u2600\uFE0F \u65E9\u95F4\u62A4\u80A4
            </button>
            <button class="type-btn" :class="{ 'type-evening-active': skincareRoutine === 'evening' }" @click="skincareRoutine = 'evening'">
              \uD83C\uDF19 \u665A\u95F4\u62A4\u80A4
            </button>
          </div>

          <!-- Steps Checklist -->
          <div class="skincare-checklist">
            <label v-for="step in currentSteps" :key="step" class="skincare-check-item" @click="toggleStep(step)">
              <span class="skincare-checkbox" :class="{ checked: checkedSteps.includes(step) }">
                <span v-if="checkedSteps.includes(step)" class="check-mark">\u2713</span>
              </span>
              <span class="skincare-step-name">{{ step }}</span>
            </label>
          </div>

          <!-- Notes -->
          <div class="form-group" style="margin-top:12px;">
            <label class="form-label">\u4EA7\u54C1\u5907\u6CE8</label>
            <textarea class="form-textarea" v-model="skincareNotes" placeholder="\u53EF\u9009\uFF0C\u8BB0\u5F55\u4F7F\u7528\u7684\u4EA7\u54C1..." rows="2"></textarea>
          </div>

          <button class="btn btn-primary btn-block" @click="saveSkincare">\u4FDD\u5B58</button>
        </div>

        <!-- Beauty Plans -->
        <div class="beauty-plans-section">
          <div class="section-header">
            <h3 class="section-title">\u7F8E\u4E3D\u8BA1\u5212</h3>
            <button class="btn btn-sm btn-outline" @click="openPlanModal">+ \u65B0\u589E</button>
          </div>

          <div v-if="beautyPlans.length === 0" class="empty-state" style="padding:24px;">
            <div class="empty-icon">\uD83C\uDF38</div>
            <p>\u8FD8\u6CA1\u6709\u7F8E\u4E3D\u8BA1\u5212\uFF0C\u6DFB\u52A0\u4E00\u4E2A\u5427</p>
          </div>

          <div v-for="plan in beautyPlans" :key="plan.id" class="beauty-plan-card card">
            <div class="plan-top">
              <span class="plan-name">{{ plan.name }}</span>
              <button class="transaction-delete" @click="deletePlan(plan.id)">&times;</button>
            </div>
            <div class="plan-progress-row">
              <span class="plan-progress-label">{{ getPlanProgress(plan).label }} {{ getPlanProgress(plan).count }}/{{ getPlanProgress(plan).total }} \u6B21</span>
              <div class="progress-bar plan-progress-bar">
                <div class="progress-fill" :style="{ width: Math.min(100, (getPlanProgress(plan).count / getPlanProgress(plan).total * 100)) + '%', background: 'linear-gradient(90deg, #fd79a8, #e84393)' }"></div>
              </div>
            </div>
            <div class="plan-bottom">
              <span class="plan-streak" v-if="getPlanStreak(plan) > 0">\uD83D\uDD25 \u5DF2\u575A\u6301 {{ getPlanStreak(plan) }} \u5929</span>
              <span class="plan-streak" v-else>\u8FD8\u6CA1\u6709\u5F00\u59CB</span>
              <button class="btn btn-sm btn-primary plan-checkin-btn" @click="checkinPlan(plan)">\u6253\u5361</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== Modals ===================== -->

      <!-- Weight Modal -->
      <div v-if="showWeightModal" class="modal-overlay" @click.self="showWeightModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">\u8BB0\u5F55\u4F53\u91CD</span>
            <button class="modal-close" @click="showWeightModal = false">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">\u4F53\u91CD (kg)</label>
            <input type="number" class="form-input" v-model="weightFormValue" placeholder="65.0" step="0.1" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">\u65E5\u671F</label>
            <input type="date" class="form-input" v-model="weightFormDate" />
          </div>
          <p class="form-hint">\u5EFA\u8BAE\u6BCF3\u5929\u8BB0\u5F55\u4E00\u6B21</p>
          <p v-if="daysSinceLastRecord !== null && daysSinceLastRecord > 3" class="form-hint form-hint-warn">
            \u8DDD\u79BB\u4E0A\u6B21\u8BB0\u5F55\u5DF2 {{ daysSinceLastRecord }} \u5929
          </p>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg" @click="saveWeight">\u4FDD\u5B58</button>
          </div>
        </div>
      </div>

      <!-- Target Weight Modal -->
      <div v-if="showTargetModal" class="modal-overlay" @click.self="showTargetModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">\u8BBE\u7F6E\u76EE\u6807\u4F53\u91CD</span>
            <button class="modal-close" @click="showTargetModal = false">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">\u76EE\u6807\u4F53\u91CD (kg)</label>
            <input type="number" class="form-input" v-model="targetFormValue" placeholder="55.0" step="0.1" min="0" />
          </div>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg" @click="saveTarget">\u4FDD\u5B58</button>
          </div>
        </div>
      </div>

      <!-- Exercise Modal -->
      <div v-if="showExerciseModal" class="modal-overlay" @click.self="showExerciseModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">\u8FD0\u52A8\u6253\u5361</span>
            <button class="modal-close" @click="showExerciseModal = false">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">\u8FD0\u52A8\u7C7B\u578B</label>
            <div class="exercise-type-grid">
              <div v-for="t in exerciseTypes" :key="t.name"
                class="exercise-type-cell"
                :class="{ 'exercise-type-selected': exerciseFormType === t.name }"
                @click="selectExerciseType(t)"
              >
                <span class="exercise-type-emoji">{{ t.icon }}</span>
                <span class="exercise-type-name">{{ t.name }}</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">\u65F6\u957F (\u5206\u949F)</label>
            <input type="number" class="form-input" v-model="exerciseFormDuration" placeholder="30" min="1" />
          </div>
          <div class="form-group">
            <label class="form-label">\u5361\u8DEF\u91CC\u6D88\u8017 (\u53EF\u9009)</label>
            <input type="number" class="form-input" v-model="exerciseFormCalories" placeholder="200" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">\u65E5\u671F</label>
            <input type="date" class="form-input" v-model="exerciseFormDate" />
          </div>
          <div class="modal-sticky-btn">
          <button class="btn btn-secondary btn-block btn-lg" @click="saveExercise">\u4FDD\u5B58</button>
          </div>
        </div>
      </div>

      <!-- Beauty Plan Modal -->
      <div v-if="showPlanModal" class="modal-overlay" @click.self="showPlanModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">\u65B0\u589E\u7F8E\u4E3D\u8BA1\u5212</span>
            <button class="modal-close" @click="showPlanModal = false">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">\u8BA1\u5212\u540D\u79F0</label>
            <input type="text" class="form-input" v-model="planFormName" placeholder="\u4F8B\u5982\uFF1A\u6BCF\u5468\u6577\u4E24\u6B21\u9762\u819C" />
          </div>
          <div class="form-group">
            <label class="form-label">\u9891\u7387</label>
            <div class="plan-freq-row">
              <input type="number" class="form-input plan-freq-input" v-model="planFormFrequency" min="1" max="30" />
              <span class="plan-freq-sep">\u6B21 /</span>
              <select class="form-select plan-freq-select" v-model="planFormPeriod">
                <option value="week">\u5468</option>
                <option value="month">\u6708</option>
              </select>
            </div>
          </div>
          <div class="modal-sticky-btn">
          <button class="btn btn-primary btn-block btn-lg" @click="savePlan">\u4FDD\u5B58</button>
          </div>
        </div>
      </div>
    </div>
  `
}
