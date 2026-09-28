import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  className?: string
  suffix?: string
}

export default function AnimatedCounter({ value, className = '', suffix = '' }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value)
  const prefersReducedMotion = useReducedMotion()
  const fromRef = useRef(value)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }
    const from = fromRef.current
    const to = value
    if (from === to) return
    const duration = 600
    const start = performance.now()

    let raf = 0
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (to - from) * eased)
      setDisplay(current)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, prefersReducedMotion])

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {display}
      {suffix}
    </motion.span>
  )
}
