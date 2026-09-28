import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Database, Rocket, Cpu, CreditCard, Sparkles } from 'lucide-react'
import type { Incident } from '../types'
import { timeAgo } from '../utils/time'

const ICONS: Record<string, typeof Shield> = {
  Authentication: Shield,
  Database: Database,
  'CI/CD': Rocket,
  Compute: Cpu,
  'Payment API': CreditCard,
}

interface MemoryCoreProps {
  incidents: Incident[]
  activeIncidentIds?: string[]
  onSelect?: (incident: Incident) => void
}

const ORBIT_POSITIONS = [
  { x: -190, y: -95 },
  { x: 175, y: -120 },
  { x: -215, y: 55 },
  { x: 205, y: 70 },
  { x: 0, y: -190 },
  { x: -30, y: 185 },
]

export default function MemoryCore({ incidents, activeIncidentIds = [], onSelect }: MemoryCoreProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  const nodes = useMemo(() => {
    return incidents
      .filter((i) => i.status === 'resolved')
      .slice(0, 6)
      .map((incident, idx) => ({
        incident,
        pos: ORBIT_POSITIONS[idx % ORBIT_POSITIONS.length],
      }))
  }, [incidents])

  return (
    <div className="relative w-full h-[420px] sm:h-[460px] flex items-center justify-center select-none">
      <svg
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        viewBox="-260 -220 520 440"
        preserveAspectRatio="xMidYMid meet"
      >
        {nodes.map(({ incident, pos }) => {
          const isActive = activeIncidentIds.includes(incident.id) || hovered === incident.id
          return (
            <g key={incident.id}>
              <line
                x1={0}
                y1={0}
                x2={pos.x}
                y2={pos.y}
                stroke={isActive ? '#4ee8ff' : 'rgba(255,255,255,0.12)'}
                strokeWidth={isActive ? 1.4 : 1}
                strokeDasharray="4 6"
              >
                {isActive && (
                  <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                )}
              </line>
              {isActive && (
                <circle r={3} fill="#4ee8ff">
                  <animateMotion dur="1.6s" repeatCount="indefinite" path={`M0,0 L${pos.x},${pos.y}`} />
                </circle>
              )}
            </g>
          )
        })}
      </svg>

      {/* Central core */}
      <div className="relative z-10 flex flex-col items-center justify-center w-40 h-40 rounded-full">
        <motion.span
          className="absolute inset-0 rounded-full border border-cyan-accent/30"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="absolute -inset-6 rounded-full border border-violet/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.05, 0.35] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
        <div className="w-full h-full rounded-full bg-gradient-to-br from-charcoal-800 to-midnight-900 border border-cyan-accent/40 shadow-glow-lg flex flex-col items-center justify-center text-center px-4">
          <Sparkles size={18} className="text-cyan-accent mb-1.5" />
          <div className="font-serif text-sm leading-tight text-white">Pulse<br />Memory Core</div>
          <div className="text-[11px] text-white/40 mt-1.5">{incidents.length} incidents stored</div>
        </div>
      </div>

      {/* Orbiting incident nodes */}
      {nodes.map(({ incident, pos }, idx) => {
        const Icon = ICONS[incident.system] ?? Database
        const isActive = activeIncidentIds.includes(incident.id) || hovered === incident.id
        return (
          <motion.button
            key={incident.id}
            onMouseEnter={() => setHovered(incident.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(incident.id)}
            onBlur={() => setHovered(null)}
            onClick={() => onSelect?.(incident)}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [pos.x, pos.x + (idx % 2 === 0 ? 5 : -5), pos.x],
              y: [pos.y, pos.y - (idx % 2 === 0 ? 6 : -6), pos.y],
            }}
            transition={{
              opacity: { duration: 0.5, delay: idx * 0.08 },
              scale: { duration: 0.5, delay: idx * 0.08 },
              x: { duration: 5 + idx, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 6 + idx, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ position: 'absolute' }}
            className={`z-20 group text-left w-[132px] rounded-xl px-3 py-2 border transition-colors ${
              isActive
                ? 'bg-cyan-accent/10 border-cyan-accent/50 shadow-glow'
                : 'bg-white/[0.04] border-white/10 hover:border-white/25'
            }`}
            aria-label={`${incident.id}: ${incident.title}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={12} className={isActive ? 'text-cyan-accent' : 'text-white/50'} />
              <span className="text-[11px] font-medium text-white/80">{incident.id}</span>
            </div>
            <div className="text-[11px] text-white/60 leading-snug line-clamp-2">{incident.title}</div>
            <div className="text-[10px] text-white/30 mt-1">{timeAgo(incident.createdAt)}</div>
          </motion.button>
        )
      })}
    </div>
  )
}
