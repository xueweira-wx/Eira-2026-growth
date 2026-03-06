const GrowthStore = {
  KEYS: {
    TRANSACTIONS: 'growth_transactions',
    ASSETS: 'growth_assets',
    ASSET_SNAPSHOTS: 'growth_asset_snapshots',
    WEIGHT: 'growth_weight',
    EXERCISE: 'growth_exercise',
    SKINCARE: 'growth_skincare',
    BEAUTY_PLANS: 'growth_beauty_plans',
    LEARNING_PROGRESS: 'growth_learning_progress',
    CONTENT: 'growth_content',
    CONTENT_PLANS: 'growth_content_plans',
    FOLLOWERS: 'growth_followers',
    BUSINESS_INCOME: 'growth_business_income',
    REMINDERS: 'growth_reminders',
    SETTINGS: 'growth_settings'
  },

  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || [] }
    catch (e) { return [] }
  },

  getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {} }
    catch (e) { return {} }
  },

  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
    // Trigger cloud sync if enabled
    if (typeof CloudSync !== 'undefined' && CloudSync.enabled) {
      CloudSync.schedulePush()
    }
  },

  add(key, item) {
    const list = this.get(key)
    item.id = this.generateId()
    item.createdAt = new Date().toISOString()
    list.push(item)
    this.set(key, list)
    return item
  },

  update(key, id, updates) {
    const list = this.get(key)
    const idx = list.findIndex(item => item.id === id)
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() }
      this.set(key, list)
    }
  },

  remove(key, id) {
    const list = this.get(key).filter(item => item.id !== id)
    this.set(key, list)
  },

  exportAll() {
    const data = {}
    Object.values(this.KEYS).forEach(key => {
      const raw = localStorage.getItem(key)
      if (raw) data[key] = JSON.parse(raw)
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `growth-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    localStorage.setItem('growth_last_backup', new Date().toISOString())
  },

  importAll(jsonString) {
    const data = JSON.parse(jsonString)
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }
}
