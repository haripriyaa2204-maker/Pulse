import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useToast } from '../hooks/useToast'

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: XCircle,
}

const COLORS = {
  success: 'text-cyan-accent border-cyan-accent/30',
  info: 'text-lavender border-lavender/30',
  error: 'text-magenta border-magenta/30',
}

export default function ToastStack() {
  const { toasts } = useToast()
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className={`glass-strong rounded-xl px-4 py-3 flex items-center gap-2 shadow-glow border ${COLORS[t.variant]}`}
            >
              <Icon size={16} />
              <span className="text-sm text-white/90">{t.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
