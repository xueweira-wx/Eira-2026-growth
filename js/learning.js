// ========================================
// Learning Component - Skill Learning Center
// ========================================

const LearningComponent = {
  setup() {
    const { ref, computed, onMounted, watch, nextTick } = Vue

    // View state: 'list' | 'detail' | 'lesson'
    const viewState = ref('list')
    const currentSkillId = ref(null)
    const currentLessonId = ref(null)

    // SQL sandbox state
    const sqlInput = ref('')
    const sqlResults = ref(null)
    const sqlError = ref('')
    const sqlShowHint = ref(false)
    const sqlShowAnswer = ref(false)
    const sqlLoading = ref(false)

    // Available skill tutorials
    const skills = computed(() => {
      const list = []
      if (typeof SQL_TUTORIAL !== 'undefined') list.push(SQL_TUTORIAL)
      if (typeof TAROT_TUTORIAL !== 'undefined') list.push(TAROT_TUTORIAL)
      if (typeof EDITING_TUTORIAL !== 'undefined') list.push(EDITING_TUTORIAL)

      // Fallback placeholders for tutorials not yet created
      const ids = list.map(s => s.id)
      if (!ids.includes('tarot')) {
        list.push({ id: 'tarot', name: '\u5854\u7F57\u724C\u5165\u95E8', icon: '\uD83D\uDD2E', color: '#6c5ce7', chapters: [] })
      }
      if (!ids.includes('editing')) {
        list.push({ id: 'editing', name: '\u89C6\u9891\u526A\u8F91\u5165\u95E8', icon: '\uD83C\uDFAC', color: '#e17055', chapters: [] })
      }
      return list
    })

    // Progress data
    const progressData = ref({})

    const loadProgress = () => {
      progressData.value = GrowthStore.getObj(GrowthStore.KEYS.LEARNING_PROGRESS)
    }

    const getSkillProgress = (skillId) => {
      return progressData.value[skillId] || { completedLessons: [] }
    }

    const isLessonCompleted = (skillId, lessonId) => {
      const sp = getSkillProgress(skillId)
      return sp.completedLessons.includes(lessonId)
    }

    const markLessonCompleted = (skillId, lessonId) => {
      const data = { ...progressData.value }
      if (!data[skillId]) data[skillId] = { completedLessons: [] }
      if (!data[skillId].completedLessons.includes(lessonId)) {
        data[skillId].completedLessons.push(lessonId)
      }
      GrowthStore.set(GrowthStore.KEYS.LEARNING_PROGRESS, data)
      progressData.value = data
    }

    const getTotalLessons = (skill) => {
      let count = 0
      skill.chapters.forEach(ch => { count += ch.lessons.length })
      return count
    }

    const getCompletedLessons = (skill) => {
      const sp = getSkillProgress(skill.id)
      return sp.completedLessons.length
    }

    const getSkillProgressPct = (skill) => {
      const total = getTotalLessons(skill)
      if (total === 0) return 0
      return Math.round((getCompletedLessons(skill) / total) * 100)
    }

    const getChapterCompletedCount = (skill, chapter) => {
      const sp = getSkillProgress(skill.id)
      return chapter.lessons.filter(l => sp.completedLessons.includes(l.id)).length
    }

    // Current skill & lesson
    const currentSkill = computed(() => {
      return skills.value.find(s => s.id === currentSkillId.value) || null
    })

    const currentLesson = computed(() => {
      if (!currentSkill.value || !currentLessonId.value) return null
      for (const ch of currentSkill.value.chapters) {
        const found = ch.lessons.find(l => l.id === currentLessonId.value)
        if (found) return found
      }
      return null
    })

    // Chapter accordion state
    const expandedChapters = ref({})

    const toggleChapter = (chapterId) => {
      expandedChapters.value = {
        ...expandedChapters.value,
        [chapterId]: !expandedChapters.value[chapterId]
      }
    }

    const isChapterExpanded = (chapterId) => {
      return !!expandedChapters.value[chapterId]
    }

    // Navigation
    const openSkillDetail = (skillId) => {
      currentSkillId.value = skillId
      viewState.value = 'detail'
      // Expand first chapter by default
      const skill = skills.value.find(s => s.id === skillId)
      if (skill && skill.chapters.length > 0) {
        expandedChapters.value = { [skill.chapters[0].id]: true }
      }
    }

    const openLesson = (lessonId) => {
      currentLessonId.value = lessonId
      viewState.value = 'lesson'
      // Reset sandbox state
      sqlInput.value = ''
      sqlResults.value = null
      sqlError.value = ''
      sqlShowHint.value = false
      sqlShowAnswer.value = false
    }

    const goBackToList = () => {
      viewState.value = 'list'
      currentSkillId.value = null
      currentLessonId.value = null
    }

    const goBackToDetail = () => {
      viewState.value = 'detail'
      currentLessonId.value = null
    }

    const completeLesson = () => {
      if (currentSkillId.value && currentLessonId.value) {
        markLessonCompleted(currentSkillId.value, currentLessonId.value)
      }
      goBackToDetail()
    }

    // ========================================
    // SQL Sandbox
    // ========================================
    let sqlPromise = null

    function getSqlJs() {
      if (!sqlPromise) {
        sqlPromise = initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        })
      }
      return sqlPromise
    }

    const runSQL = async () => {
      if (!currentLesson.value || !currentLesson.value.exercise) return
      const exercise = currentLesson.value.exercise
      const userSQL = sqlInput.value.trim()
      if (!userSQL) {
        sqlError.value = '\u8BF7\u8F93\u5165SQL\u8BED\u53E5'
        sqlResults.value = null
        return
      }

      sqlLoading.value = true
      sqlError.value = ''
      sqlResults.value = null

      try {
        const SQL = await getSqlJs()
        const db = new SQL.Database()

        // Run setup SQL
        db.run(exercise.setupSQL)

        // Run user SQL - handle multiple statements
        const statements = userSQL.split(';').map(s => s.trim()).filter(s => s.length > 0)
        let lastResult = null

        for (const stmt of statements) {
          try {
            const result = db.exec(stmt)
            if (result && result.length > 0) {
              lastResult = result[result.length - 1]
            }
          } catch (e) {
            db.close()
            throw e
          }
        }

        if (lastResult) {
          sqlResults.value = {
            columns: lastResult.columns,
            values: lastResult.values
          }
        } else {
          // For INSERT/UPDATE/DELETE that don't return rows,
          // run a SELECT to show the result
          const check = db.exec('SELECT * FROM ' + getMainTableName(exercise.setupSQL))
          if (check && check.length > 0) {
            sqlResults.value = {
              columns: check[0].columns,
              values: check[0].values
            }
          } else {
            sqlResults.value = { columns: [], values: [] }
          }
        }

        sqlError.value = ''
        db.close()
      } catch (e) {
        sqlError.value = e.message || '\u6267\u884CSQL\u65F6\u51FA\u9519'
        sqlResults.value = null
      } finally {
        sqlLoading.value = false
      }
    }

    const getMainTableName = (setupSQL) => {
      const match = setupSQL.match(/CREATE TABLE (\w+)/)
      return match ? match[1] : 'data'
    }

    const resetSQL = () => {
      sqlInput.value = ''
      sqlResults.value = null
      sqlError.value = ''
      sqlShowHint.value = false
      sqlShowAnswer.value = false
    }

    // Init
    onMounted(() => {
      loadProgress()
    })

    return {
      viewState,
      skills,
      currentSkill,
      currentLesson,
      currentSkillId,
      currentLessonId,
      progressData,
      getSkillProgress,
      isLessonCompleted,
      getTotalLessons,
      getCompletedLessons,
      getSkillProgressPct,
      getChapterCompletedCount,
      expandedChapters,
      toggleChapter,
      isChapterExpanded,
      openSkillDetail,
      openLesson,
      goBackToList,
      goBackToDetail,
      completeLesson,
      // SQL sandbox
      sqlInput,
      sqlResults,
      sqlError,
      sqlShowHint,
      sqlShowAnswer,
      sqlLoading,
      runSQL,
      resetSQL
    }
  },
  template: `
    <div class="page learning-page">

      <!-- =================== Skill List View =================== -->
      <div v-if="viewState === 'list'">
        <div class="learning-header">
          <h1 class="learning-title">\u5B66\u4E60\u4E2D\u5FC3</h1>
          <p class="learning-subtitle">\u6BCF\u5929\u8FDB\u6B65\u4E00\u70B9\u70B9\uFF0C\u79EF\u7D2F\u6210\u957F\u7684\u529B\u91CF</p>
        </div>

        <div class="skill-cards-grid">
          <div
            v-for="skill in skills"
            :key="skill.id"
            class="skill-card"
            :style="{ borderLeftColor: skill.color }"
            @click="openSkillDetail(skill.id)"
          >
            <div class="skill-card-icon">{{ skill.icon }}</div>
            <div class="skill-card-body">
              <div class="skill-card-name">{{ skill.name }}</div>
              <div class="skill-card-progress-bar">
                <div class="skill-card-progress-fill" :style="{ width: getSkillProgressPct(skill) + '%', background: skill.color }"></div>
              </div>
              <div class="skill-card-status">{{ getCompletedLessons(skill) }}/{{ getTotalLessons(skill) }} \u8BFE\u65F6\u5B8C\u6210</div>
            </div>
            <div class="skill-card-arrow">\u203A</div>
          </div>
        </div>
      </div>

      <!-- =================== Skill Detail View =================== -->
      <div v-if="viewState === 'detail' && currentSkill">
        <button class="learning-back-btn" @click="goBackToList">\u2190 \u8FD4\u56DE</button>

        <div class="skill-detail-header" :style="{ background: 'linear-gradient(135deg, ' + currentSkill.color + ', ' + currentSkill.color + '99)' }">
          <div class="skill-detail-icon">{{ currentSkill.icon }}</div>
          <div class="skill-detail-name">{{ currentSkill.name }}</div>
          <div class="skill-detail-progress">
            \u5DF2\u5B8C\u6210 {{ getCompletedLessons(currentSkill) }}/{{ getTotalLessons(currentSkill) }} \u8BFE\u65F6
          </div>
        </div>

        <div v-if="currentSkill.chapters.length === 0" class="learning-empty">
          <div class="learning-empty-icon">\uD83D\uDCDA</div>
          <p>\u8BFE\u7A0B\u5185\u5BB9\u5373\u5C06\u4E0A\u7EBF\uFF0C\u656C\u8BF7\u671F\u5F85\uFF01</p>
        </div>

        <div class="chapter-list">
          <div v-for="chapter in currentSkill.chapters" :key="chapter.id" class="chapter-item">
            <div class="chapter-header" @click="toggleChapter(chapter.id)">
              <div class="chapter-header-left">
                <span class="chapter-expand-icon" :class="{ expanded: isChapterExpanded(chapter.id) }">\u203A</span>
                <span class="chapter-title">{{ chapter.title }}</span>
              </div>
              <span class="chapter-completion">{{ getChapterCompletedCount(currentSkill, chapter) }}/{{ chapter.lessons.length }} \u5DF2\u5B8C\u6210</span>
            </div>
            <div class="chapter-lessons" v-show="isChapterExpanded(chapter.id)">
              <div
                v-for="lesson in chapter.lessons"
                :key="lesson.id"
                class="lesson-item"
                @click="openLesson(lesson.id)"
              >
                <span
                  class="lesson-checkbox"
                  :class="{ completed: isLessonCompleted(currentSkill.id, lesson.id) }"
                  :style="isLessonCompleted(currentSkill.id, lesson.id) ? { background: currentSkill.color, borderColor: currentSkill.color } : {}"
                >
                  <span v-if="isLessonCompleted(currentSkill.id, lesson.id)" class="lesson-check-mark">\u2713</span>
                </span>
                <span class="lesson-title">{{ lesson.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- =================== Lesson Content View =================== -->
      <div v-if="viewState === 'lesson' && currentLesson" class="lesson-viewer">
        <button class="learning-back-btn" @click="goBackToDetail">\u2190 \u8FD4\u56DE</button>

        <h1 class="lesson-viewer-title">{{ currentLesson.title }}</h1>

        <div class="lesson-content" v-html="currentLesson.content"></div>

        <!-- SQL Sandbox -->
        <div v-if="currentLesson.exercise" class="sql-sandbox">
          <div class="sql-sandbox-header">
            <span class="sql-sandbox-icon">\uD83D\uDCBB</span>
            <span class="sql-sandbox-title">\u52A8\u624B\u7EC3\u4E60</span>
          </div>

          <div class="sql-exercise-desc">{{ currentLesson.exercise.description }}</div>

          <div class="sql-editor-wrap">
            <textarea
              class="sql-editor"
              v-model="sqlInput"
              placeholder="\u5728\u8FD9\u91CC\u8F93\u5165\u4F60\u7684 SQL \u8BED\u53E5..."
              rows="4"
              spellcheck="false"
            ></textarea>
          </div>

          <div class="sql-actions">
            <button class="sql-btn sql-btn-run" @click="runSQL" :disabled="sqlLoading">
              {{ sqlLoading ? '\u6267\u884C\u4E2D...' : '\u25B6 \u8FD0\u884C SQL' }}
            </button>
            <button class="sql-btn sql-btn-reset" @click="resetSQL">\u91CD\u7F6E</button>
          </div>

          <div class="sql-help-actions">
            <button class="sql-help-btn" @click="sqlShowHint = !sqlShowHint">
              {{ sqlShowHint ? '\u9690\u85CF\u63D0\u793A' : '\uD83D\uDCA1 \u663E\u793A\u63D0\u793A' }}
            </button>
            <button class="sql-help-btn" @click="sqlShowAnswer = !sqlShowAnswer">
              {{ sqlShowAnswer ? '\u9690\u85CF\u7B54\u6848' : '\u2705 \u67E5\u770B\u7B54\u6848' }}
            </button>
          </div>

          <div v-if="sqlShowHint" class="sql-hint-box">
            <strong>\u63D0\u793A\uFF1A</strong>{{ currentLesson.exercise.hint }}
          </div>

          <div v-if="sqlShowAnswer" class="sql-answer-box">
            <strong>\u53C2\u8003\u7B54\u6848\uFF1A</strong>
            <div class="sql-answer-code">{{ currentLesson.exercise.answer }}</div>
          </div>

          <!-- Results -->
          <div v-if="sqlError" class="sql-error-box">
            <strong>\u274C \u9519\u8BEF\uFF1A</strong>{{ sqlError }}
          </div>

          <div v-if="sqlResults" class="sql-results">
            <div class="sql-results-header">\u67E5\u8BE2\u7ED3\u679C</div>
            <div class="sql-results-table-wrap">
              <table class="sql-results-table">
                <thead>
                  <tr>
                    <th v-for="col in sqlResults.columns" :key="col">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in sqlResults.values" :key="idx">
                    <td v-for="(val, cidx) in row" :key="cidx">{{ val === null ? 'NULL' : val }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="sql-results-count">\u5171 {{ sqlResults.values.length }} \u6761\u8BB0\u5F55</div>
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-lg lesson-complete-btn" @click="completeLesson" :style="currentSkill ? { background: currentSkill.color } : {}">
          \u2714 \u5B8C\u6210\u672C\u8BFE
        </button>
      </div>
    </div>
  `
}
