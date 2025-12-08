import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const ANALYZING_MESSAGES = [
  'Analyzing color patterns...',
  'Comparing with knowledge base...',
  'Detecting anomalies...',
  'Generating recommendations...',
]

export default function AnimateAnalyzing() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-8" role="status" aria-live="polite">
      <motion.div
        className="relative w-24 h-24 mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"></div>
      </motion.div>
      <motion.div
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-lg text-gray-700 font-medium"
      >
        {ANALYZING_MESSAGES[messageIndex]}
      </motion.div>
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
