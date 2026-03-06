// ========================================
// Cloud Sync via Firebase Realtime Database
// ========================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCLv9cVL-PVFZW9jFNjRg1OLfjwlr8__Sw",
  authDomain: "eira-growth-2026.firebaseapp.com",
  databaseURL: "https://eira-growth-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eira-growth-2026",
  storageBucket: "eira-growth-2026.firebasestorage.app",
  messagingSenderId: "343823371361",
  appId: "1:343823371361:web:079d9364c719601a02ae20"
}

const CloudSync = {
  db: null,
  syncKey: null,
  syncPath: null,
  enabled: false,
  _debounceTimer: null,
  _listeners: [],

  // Initialize Firebase
  init() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG)
      }
      this.db = firebase.database()

      // Restore sync key from localStorage
      const savedKey = localStorage.getItem('growth_sync_key')
      if (savedKey) {
        this.syncKey = savedKey
        this.syncPath = this._hashKey(savedKey)
        this.enabled = true
        this._startListening()
      }
    } catch (e) {
      console.warn('Firebase init failed:', e)
    }
  },

  // Set sync key and enable sync
  async connect(key) {
    if (!key || key.length < 2) {
      throw new Error('Sync key must be at least 2 characters')
    }
    this.syncKey = key
    this.syncPath = this._hashKey(key)
    localStorage.setItem('growth_sync_key', key)
    this.enabled = true

    // Check if cloud has data
    const snapshot = await this.db.ref(this.syncPath + '/data').once('value')
    const cloudData = snapshot.val()

    if (cloudData) {
      // Cloud has data — ask user what to do
      return { hasCloudData: true, cloudData }
    } else {
      // No cloud data — push local data up
      await this.pushToCloud()
      this._startListening()
      return { hasCloudData: false }
    }
  },

  // Pull cloud data and overwrite local
  async pullFromCloud() {
    if (!this.enabled || !this.syncPath) return false
    const snapshot = await this.db.ref(this.syncPath + '/data').once('value')
    const cloudData = snapshot.val()
    if (cloudData) {
      Object.entries(cloudData).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value))
      })
      this._startListening()
      return true
    }
    return false
  },

  // Push all local data to cloud
  async pushToCloud() {
    if (!this.enabled || !this.syncPath) return
    const data = {}
    Object.values(GrowthStore.KEYS).forEach(key => {
      const raw = localStorage.getItem(key)
      if (raw) {
        try { data[key] = JSON.parse(raw) } catch (e) {}
      }
    })
    data._lastSync = new Date().toISOString()
    await this.db.ref(this.syncPath + '/data').set(data)
    localStorage.setItem('growth_last_sync', new Date().toISOString())
  },

  // Debounced push — called after every store change
  schedulePush() {
    if (!this.enabled) return
    clearTimeout(this._debounceTimer)
    this._debounceTimer = setTimeout(() => {
      this.pushToCloud().catch(e => console.warn('Sync push failed:', e))
    }, 2000) // Wait 2 seconds after last change before syncing
  },

  // Listen for remote changes
  _startListening() {
    this._stopListening()
    if (!this.enabled || !this.syncPath) return
    const dataRef = this.db.ref(this.syncPath + '/data')
    const handler = dataRef.on('value', (snapshot) => {
      const cloudData = snapshot.val()
      if (!cloudData) return
      const cloudSync = cloudData._lastSync
      const localSync = localStorage.getItem('growth_last_sync')
      // Only apply if cloud is newer than local
      if (cloudSync && localSync && cloudSync > localSync) {
        Object.values(GrowthStore.KEYS).forEach(key => {
          if (cloudData[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(cloudData[key]))
          }
        })
        localStorage.setItem('growth_last_sync', cloudSync)
        // Notify listeners (for UI refresh)
        this._listeners.forEach(fn => fn())
      }
    })
    this._cleanupHandler = () => dataRef.off('value', handler)
  },

  _stopListening() {
    if (this._cleanupHandler) {
      this._cleanupHandler()
      this._cleanupHandler = null
    }
  },

  // Disconnect sync
  disconnect() {
    this._stopListening()
    clearTimeout(this._debounceTimer)
    this.syncKey = null
    this.syncPath = null
    this.enabled = false
    localStorage.removeItem('growth_sync_key')
    localStorage.removeItem('growth_last_sync')
  },

  // Register a callback for when remote data changes
  onRemoteChange(fn) {
    this._listeners.push(fn)
  },

  // Simple hash function for sync key → database path
  _hashKey(key) {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return 'user_' + Math.abs(hash).toString(36)
  }
}
