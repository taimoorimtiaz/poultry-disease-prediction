import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import CropperModal from '../components/CropperModal'
import AnimateAnalyzing from '../components/AnimateAnalyzing'
import { analysisService } from '../services/api'

export default function UploadCropAnalyze() {
  const navigate = useNavigate()
  const [originalImage, setOriginalImage] = useState(null)
  const [croppedBlob, setCroppedBlob] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('File size must be less than 8MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setOriginalImage(reader.result)
        setShowCropper(true)
        setError('')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    multiple: false,
  })

  const handleCropComplete = (blob) => {
    setCroppedBlob(blob)
    setShowCropper(false)
  }

  const handleAnalyze = async () => {
    if (!croppedBlob) {
      setError('Please crop the image first')
      return
    }

    setAnalyzing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', croppedBlob, 'sample.jpg')

      // Show animation for at least 1 second
      const [response] = await Promise.all([
        analysisService.upload(formData),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ])

      if (response.data.analysis_id) {
        navigate(`/result/${response.data.analysis_id}`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setOriginalImage(null)
    setCroppedBlob(null)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyze Chicken Feces Sample</h1>
        <p className="text-gray-600 mb-8">Upload an image to detect potential diseases</p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-danger px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {analyzing ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AnimateAnalyzing />
          </div>
        ) : !croppedBlob ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              isDragActive
                ? 'border-primary bg-green-50'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">or click to select a file</p>
            <p className="text-xs text-gray-400">Supported formats: JPEG, PNG (max 8MB)</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Cropped Image Preview</h2>
            <div className="mb-6 flex justify-center">
              <img
                src={URL.createObjectURL(croppedBlob)}
                alt="Cropped preview"
                className="max-w-md rounded-lg shadow"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAnalyze}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                🔬 Analyze Sample
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {showCropper && (
          <CropperModal
            image={originalImage}
            onComplete={handleCropComplete}
            onCancel={() => setShowCropper(false)}
          />
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Instructions</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
            <li>Take a clear, well-lit photograph of the chicken feces sample</li>
            <li>Upload the image using the area above</li>
            <li>Crop the image to focus on the relevant area (remove background noise)</li>
            <li>Click "Analyze Sample" to get disease predictions and treatment recommendations</li>
            <li>Results will include confidence scores and suggested medications</li>
          </ol>
        </motion.div>
      </motion.div>
    </div>
  )
}
