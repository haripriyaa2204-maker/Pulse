import { motion } from 'framer-motion'
import type { SimilarIncidentMatch } from '../types'
import { timeAgo } from '../utils/time'

interface SimilarIncidentsProps {
  matches: SimilarIncidentMatch[]
  onSelect?: (match: SimilarIncidentMatch) => void
}

function matchColor(pct: number) {
  if (pct >= 85) return 'text-cyan-accent border-cyan-accent/40 bg-cyan-accent/10'
  if (pct >= 65) return 'text-lavender-soft border-lavender/40 bg-lavender/10'
  return 'text-white/60 border-white/20 bg-white/5'
}

export default function SimilarIncidents({ matches, onSelect }: SimilarIncidentsProps) {
  if (matches.length === 0) {
    return <p className="text-sm text-white/40">No sufficiently similar incidents found in memory yet.</p>
  }

  return (
    <div className="space-y-2">
      {matches.map((m, idx) => (
        <motion.button
          key={m.incident.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08 }}
          onClick={() => onSelect?.(m)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.03] transition-colors text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white/85 font-medium truncate">
              {m.incident.id} <span className="text-white/40 font-normal">— {m.incident.title}</span>
            </div>
            <div className="text-xs text-white/35 mt-0.5">{timeAgo(m.incident.createdAt)}</div>
          </div>
          <div className={`shrink-0 text-xs font-semibold rounded-full border px-2.5 py-1 ${matchColor(m.matchPercent)}`}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.08 + 0.15 }}
            >
              {m.matchPercent}% match
            </motion.span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
