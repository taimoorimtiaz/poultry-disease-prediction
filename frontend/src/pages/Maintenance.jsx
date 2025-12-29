import { motion } from 'framer-motion'

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          🔧
        </motion.div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">🐔</span>
            <h1 className="text-3xl font-bold text-purple-600">PoultryAI</h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Under Maintenance</h2>
          <p className="text-xl text-purple-600 font-semibold mb-6">We're making things better!</p>
        </div>

        <p className="text-gray-600 text-lg mb-8">
          Our system is currently undergoing scheduled maintenance to improve your experience. 
          We're working hard to bring you enhanced features and better performance.
        </p>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <span>🚀</span>
            <span>What We're Working On</span>
          </h3>
          <ul className="text-left space-y-3 max-w-md mx-auto">
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-green-500 font-bold text-xl">✓</span>
              <span>System upgrades and optimizations</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-green-500 font-bold text-xl">✓</span>
              <span>Enhanced AI disease detection</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-green-500 font-bold text-xl">✓</span>
              <span>Performance improvements</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-green-500 font-bold text-xl">✓</span>
              <span>New features and capabilities</span>
            </li>
          </ul>
        </div>

        <p className="text-gray-600 mb-6">
          We apologize for any inconvenience. We'll be back online shortly!
        </p>

        <motion.div
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
        >
          ⚠️ Maintenance in Progress
        </motion.div>

        <div className="mt-8 pt-8 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500">
            Need urgent assistance? Contact our support team.<br />
            Thank you for your patience!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
