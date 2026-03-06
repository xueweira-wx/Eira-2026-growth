const { createApp, ref, computed, onMounted } = Vue
const { createRouter, createWebHashHistory } = VueRouter

// ========================================
// Route Components (Placeholders)
// ========================================

const Dashboard = {
  template: `
    <div class="page">
      <div class="placeholder-page">
        <div class="icon">🏠</div>
        <h2>首页</h2>
        <p>成长仪表盘即将上线</p>
      </div>
    </div>
  `
}

const Finance = {
  template: `
    <div class="page">
      <div class="placeholder-page">
        <div class="icon">💰</div>
        <h2>财务中心</h2>
        <p>记账与资产管理即将上线</p>
      </div>
    </div>
  `
}

const Beauty = {
  template: `
    <div class="page">
      <div class="placeholder-page">
        <div class="icon">✨</div>
        <h2>变美计划</h2>
        <p>体重管理与护肤计划即将上线</p>
      </div>
    </div>
  `
}

const Learning = {
  template: `
    <div class="page">
      <div class="placeholder-page">
        <div class="icon">📚</div>
        <h2>技能学习</h2>
        <p>学习进度跟踪即将上线</p>
      </div>
    </div>
  `
}

const Business = {
  template: `
    <div class="page">
      <div class="placeholder-page">
        <div class="icon">📱</div>
        <h2>副业管理</h2>
        <p>内容创作与收入跟踪即将上线</p>
      </div>
    </div>
  `
}

const Reminders = {
  template: `
    <div class="page">
      <div class="placeholder-page">
        <div class="icon">⏰</div>
        <h2>提醒系统</h2>
        <p>日程提醒与习惯打卡即将上线</p>
      </div>
    </div>
  `
}

const Settings = {
  template: `
    <div class="page">
      <div class="placeholder-page">
        <div class="icon">⚙️</div>
        <h2>设置</h2>
        <p>数据备份与个性化设置即将上线</p>
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
