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
    { title: 'Upload Sample', description: 'Analyze a new feces image', link: '/upload', icon: '📤', color: 'bg-green-100 text-green-700' },
    { title: 'History', description: 'View past analyses', link: '/history', icon: '📊', color: 'bg-blue-100 text-blue-700' },
    { title: 'Inventory', description: 'Manage inventory & vaccines', link: '/admin', icon: '📦', color: 'bg-purple-100 text-purple-700' },
    { title: 'Find Vets', description: 'Locate nearby clinics', link: '/upload', icon: '🏥', color: 'bg-red-100 text-red-700' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mb-8">Manage your poultry health monitoring</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 skeleton h-32"></div>
              ))}
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Analyses</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.analyses}</p>
                  </div>
                  <div className="text-4xl">🔬</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Disease</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.lastDisease || 'None'}
                    </p>
                  </div>
                  <div className="text-4xl">🦠</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inventory Items</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.inventory}</p>
                  </div>
                  <div className="text-4xl">📦</div>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              {action.title === 'Find Vets' ? (
                <button
                  onClick={() => setShowMapModal(true)}
                  className="w-full block bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${action.color} mb-4`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              ) : (
                <Link
                  to={action.link}
                  className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${action.color} mb-4`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Map Modal */}
        {showMapModal && <MapNearestVets onClose={() => setShowMapModal(false)} />}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Upload clear, well-lit images for best analysis results</li>
            <li>Crop images to focus on the relevant area before analysis</li>
            <li>Check your inventory regularly to track vaccine and medicine expiry dates</li>
            <li>Download PDF reports for your records and veterinary consultations</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}
