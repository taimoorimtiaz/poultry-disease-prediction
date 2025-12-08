import { motion } from 'framer-motion'

export default function ResultCard({ result }) {
  if (!result) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Results</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Predicted Diseases</h3>
        {result.predicted_diseases && result.predicted_diseases.length > 0 ? (
          <div className="space-y-3">
            {result.predicted_diseases.map((pred, idx) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{pred.name}</span>
                  <span className="text-sm font-semibold text-primary">
                    {(pred.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pred.confidence * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No diseases detected</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Recommended Medicines</h3>
        {result.medicines_recommended && result.medicines_recommended.length > 0 ? (
          <div className="space-y-4">
            {result.medicines_recommended.map((med, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{med.name}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Dosage:</span> {med.dosage}
                  </p>
                  <p>
                    <span className="font-medium">Administration:</span> {med.administration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No medicine recommendations</p>
        )}
      </div>
    </motion.div>
  )
}
