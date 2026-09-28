import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, X } from 'lucide-react'

const STEPS = [
  'Reading the incident...',
  'Searching organizational memory...',
  'Comparing historical patterns...',
  'Tracing resolution history...',
  'Finding the likely owner...',
  'Memory found a likely path.',
]

interface AnalysisSequenceProps {
  onComplete: () => void
}

export default function AnalysisSequence({ onComplete }: AnalysisSequenceProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) {
      const done = setTimeout(onComplete, 380)
      return () => clearTimeout(done)
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), 260)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-strong rounded-2xl p-5 flex items-center justify-between gap-4 shadow-glow"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className="shrink-0 w-9 h-9 rounded-full bg-cyan-accent/10 border border-cyan-accent/30 flex items-center justify-center"
        >
          <BrainCircuit size={16} className="text-cyan-accent" />
        </motion.div>
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-white/85 truncate"
            >
              {STEPS[stepIndex]}
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-1 mt-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-6 rounded-full transition-colors ${
                  i <= stepIndex ? 'bg-cyan-accent' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onComplete}
        className="shrink-0 text-xs text-white/40 hover:text-white/80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
      >
        <X size={12} /> Skip
      </button>
    </motion.div>
  )
}
