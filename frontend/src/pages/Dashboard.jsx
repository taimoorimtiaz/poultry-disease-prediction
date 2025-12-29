import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { analysisService, inventoryService } from '../services/api'
import MapNearestVets from '../components/MapNearestVets'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ analyses: 0, inventory: 0, lastDisease: null })
  const [loading, setLoading] = useState(true)
  const [showMapModal, setShowMapModal] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [historyRes, inventoryRes] = await Promise.all([
          analysisService.getHistory(),
          inventoryService.list(),
        ])
        const lastAnalysis = historyRes.data[0]
        setStats({
          analyses: historyRes.data.length,
          inventory: inventoryRes.data.length,
          lastDisease: lastAnalysis?.predicted_diseases?.[0]?.name || null,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const quickActions = [
    { 
      title: 'Upload Sample', 
      description: 'Analyze a new feces image', 
      link: '/upload', 
      icon: '📤', 
      gradient: 'from-emerald-400 to-teal-500',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100'
    },
    { 
      title: 'History', 
      description: 'View past analyses', 
      link: '/history', 
      icon: '📊', 
      gradient: 'from-blue-400 to-indigo-500',
      iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100'
    },
    { 
      title: 'Inventory', 
      description: 'Track feed, vaccines & supplies', 
      link: '/inventory', 
      icon: '📦', 
      gradient: 'from-purple-400 to-pink-500',
      iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100'
    },
    { 
      title: 'Find Vets', 
      description: 'Locate nearby clinics', 
      link: '/upload', 
      icon: '🏥', 
      gradient: 'from-red-400 to-orange-500',
      iconBg: 'bg-gradient-to-br from-red-100 to-orange-100'
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.div 
            variants={itemVariants}
            className="mb-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative glass-panel rounded-3xl p-8 sm:p-12 border-2 border-white/60">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="pill mb-4 inline-flex">
                      <span className="animate-pulse">●</span>
                      <span className="ml-2">AI-Powered Diagnostics</span>
                    </div>
                  </motion.div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                    Welcome back,
                    <br />
                    <span className="accent-gradient">{user?.name}!</span>
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Your intelligent poultry health monitoring system. Get instant disease predictions and manage your farm efficiently.
                  </p>
                </div>
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="text-9xl opacity-20 lg:opacity-100"
                >
                  🐔
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-panel rounded-2xl p-6 h-40 animate-pulse"></div>
                ))}
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="glass-panel rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white/80 to-emerald-50/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">🔬</span>
                    </div>
                    <span className="soft-badge bg-emerald-100 text-emerald-700">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Total Analyses</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.analyses}</p>
                  <div className="mt-4 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="glass-panel rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white/80 to-blue-50/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">🦠</span>
                    </div>
                    <span className="soft-badge bg-blue-100 text-blue-700">Latest</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Recent Detection</p>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {stats.lastDisease || 'No detections yet'}
                  </p>
                  <div className="mt-4 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="glass-panel rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white/80 to-purple-50/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">📦</span>
                    </div>
                    <span className="soft-badge bg-purple-100 text-purple-700">Tracked</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Inventory Items</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.inventory}</p>
                  <div className="mt-4 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Quick Actions</h2>
              <div className="soft-badge">🚀 Ready to go</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.08, 
                    rotate: [0, -1, 1, 0],
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.title === 'Find Vets' ? (
                    <button
                      onClick={() => setShowMapModal(true)}
                      className="w-full group relative overflow-hidden glass-panel rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 text-left"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      <div className="relative">
                        <div className={`${action.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-orange-500 transition-all duration-300">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                        <div className="mt-4 flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
                          <span>Open</span>
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <Link
                      to={action.link}
                      className="block group relative overflow-hidden glass-panel rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      <div className="relative">
                        <div className={`${action.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${action.gradient} transition-all duration-300">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                        <div className="mt-4 flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
                          <span>Go to</span>
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Info Cards Grid */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Tips Card */}
            <div className="glass-panel rounded-2xl p-8 border-2 border-blue-100/60 bg-gradient-to-br from-blue-50/50 to-white/80">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Pro Tips</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Upload clear, well-lit images for accurate analysis',
                  'Crop images to focus on the relevant area',
                  'Track inventory to monitor vaccine expiry dates',
                  'Download PDF reports for veterinary consultations'
                ].map((tip, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3 text-blue-800"
                  >
                    <span className="text-blue-500 font-bold mt-0.5">→</span>
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Features Card */}
            <div className="glass-panel rounded-2xl p-8 border-2 border-purple-100/60 bg-gradient-to-br from-purple-50/50 to-white/80">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-2xl font-bold text-purple-900">Features</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🤖', label: 'AI Analysis' },
                  { icon: '📈', label: 'Smart Reports' },
                  { icon: '🔔', label: 'Alerts' },
                  { icon: '🌍', label: 'Vet Locator' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="bg-white/70 rounded-xl p-4 text-center border border-purple-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <span className="text-3xl block mb-2">{feature.icon}</span>
                    <span className="text-xs font-semibold text-purple-900">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Map Modal */}
        {showMapModal && <MapNearestVets onClose={() => setShowMapModal(false)} />}
    </div>
  )
}
