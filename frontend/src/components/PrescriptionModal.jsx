import { motion } from 'framer-motion'

export default function PrescriptionModal({ medicine, onClose }) {
  if (!medicine) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{medicine.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Dosage Guidelines</h3>
            <p className="text-gray-600">{medicine.dosage}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Administration</h3>
            <p className="text-gray-600">{medicine.administration}</p>
          </div>

          {medicine.notes && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Additional Notes</h3>
              <p className="text-gray-600">{medicine.notes}</p>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500">
              ⚠️ Always consult with a veterinarian before administering any medication.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition"
        >
          Close
        </button>
      </div>
    </motion.div>
  )
}
