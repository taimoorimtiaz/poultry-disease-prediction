import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { analysisService } from '../services/api'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await analysisService.getHistory()
        setHistory(data)
      } catch (err) {
        setError('Failed to load history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analysis History</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow skeleton h-64"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-danger px-4 py-3 rounded-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
            <p className="text-gray-600 mt-2">View all your past analyses</p>
          </div>
          <Link
            to="/upload"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            + New Analysis
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No analyses yet</h3>
            <p className="text-gray-500 mb-6">Upload your first sample to get started</p>
            <Link
              to="/upload"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition"
            >
              Upload Sample
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              >
                <Link
                  to={`/result/${item.id}`}
                  className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                >
                  {item.sample?.thumbnail || item.sample?.image ? (
                    <img
                      src={item.sample.thumbnail || item.sample.image}
                      alt="Sample thumbnail"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">🔬</span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(item.processed_at).toLocaleDateString()} at{' '}
                      {new Date(item.processed_at).toLocaleTimeString()}
                    </p>
                    <h3 className="font-semibold text-gray-800 mb-2">Analysis #{item.id}</h3>
                    {item.predicted_diseases && item.predicted_diseases.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {item.predicted_diseases[0].name}
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {(item.predicted_diseases[0].confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${item.predicted_diseases[0].confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {item.medicines_recommended && item.medicines_recommended.length > 0 && (
                      <p className="text-xs text-gray-600">
                        {item.medicines_recommended.length} medicine(s) recommended
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
