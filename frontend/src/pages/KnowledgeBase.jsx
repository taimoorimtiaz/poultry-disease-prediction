import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { diseaseService } from '../services/api'

export default function KnowledgeBase() {
  const [diseases, setDiseases] = useState([])
  const [selectedDisease, setSelectedDisease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const { data } = await diseaseService.list()
        setDiseases(data.results || data)
      } catch (err) {
        console.error('Failed to load diseases:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDiseases()
  }, [])

  const filteredDiseases = diseases.filter((disease) =>
    disease.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Disease Knowledge Base</h1>
        <p className="text-gray-600 mb-8">Learn about common poultry diseases</p>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search diseases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow skeleton h-48"></div>
            ))}
          </div>
        ) : (
          <>
            {filteredDiseases.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No diseases found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDiseases.map((disease, index) => (
                  <motion.div
                    key={disease.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDisease(disease)}
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{disease.name}</h3>
                      <span className="text-2xl">🦠</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{disease.description}</p>
                    <button className="mt-4 text-sm text-primary hover:text-green-700 font-medium">
                      Read more →
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Disease Detail Modal */}
      {selectedDisease && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDisease(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedDisease.name}</h2>
              <button
                onClick={() => setSelectedDisease(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{selectedDisease.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Symptoms</h3>
                <p className="text-gray-600 whitespace-pre-line">{selectedDisease.symptoms}</p>
              </div>

              {selectedDisease.medicines && selectedDisease.medicines.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Common Treatments</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedDisease.medicines.map((med) => (
                      <li key={med.id}>{med.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedDisease(null)}
              className="mt-6 w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
