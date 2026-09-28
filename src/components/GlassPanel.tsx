import type { ReactNode, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  strong?: boolean
  glow?: boolean
  className?: string
  delay?: number
}

export default function GlassPanel({
  children,
  strong = false,
  glow = false,
  className = '',
  delay = 0,
  ...rest
}: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`${strong ? 'glass-strong' : 'glass'} rounded-2xl ${glow ? 'shadow-glow' : ''} ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  )
}
