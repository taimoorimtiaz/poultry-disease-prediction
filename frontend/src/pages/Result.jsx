import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ResultCard from '../components/ResultCard'
import MapNearestVets from '../components/MapNearestVets'
import PrescriptionModal from '../components/PrescriptionModal'
import { analysisService, reportService } from '../services/api'

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await analysisService.getResult(id)
        setResult(data)
      } catch (err) {
        setError('Failed to load analysis result')
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  const handleDownloadReport = async () => {
    try {
      setGeneratingReport(true)
      const { data: reportData } = await reportService.generate(id)
      const { data: pdfBlob } = await reportService.download(reportData.report_id)
      const url = window.URL.createObjectURL(new Blob([pdfBlob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analysis_${id}_report.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-danger px-4 py-3 rounded-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <button
            onClick={() => navigate('/history')}
            className="text-primary hover:text-green-700 font-medium flex items-center gap-2"
          >
            ← Back to History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Result Card */}
          <div className="lg:col-span-2">
            <ResultCard result={result} />
          </div>

          {/* Sample Image */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Image</h3>
            {result?.sample?.image && (
              <img
                src={result.sample.thumbnail || result.sample.image}
                alt="Sample"
                className="w-full rounded-lg shadow"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">
              Uploaded: {new Date(result?.sample?.uploaded_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button
            onClick={handleDownloadReport}
            disabled={generatingReport}
            className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50"
          >
            {generatingReport ? 'Generating...' : '📄 Download PDF Report'}
          </button>
          <button
            onClick={() => setShowMap(true)}
            className="px-6 py-3 bg-danger text-white rounded-lg hover:bg-red-600 transition font-medium"
          >
            🏥 Find Nearest Vets
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            📤 New Analysis
          </button>
        </motion.div>

        {/* Medicine Details */}
        {result?.medicines_recommended && result.medicines_recommended.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Medicine Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.medicines_recommended.map((med, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMedicine(med)}
                  className="text-left border border-gray-200 rounded-lg p-4 hover:border-primary hover:bg-green-50 transition"
                >
                  <h4 className="font-semibold text-gray-800">{med.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">Click for detailed prescription</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {showMap && <MapNearestVets onClose={() => setShowMap(false)} />}
      {selectedMedicine && <PrescriptionModal medicine={selectedMedicine} onClose={() => setSelectedMedicine(null)} />}
    </div>
  )
}
