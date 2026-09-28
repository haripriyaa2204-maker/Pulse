import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { SimilarIncidentMatch } from '../types'
import { formatDate } from '../utils/time'

interface MatchExplanationProps {
  match: SimilarIncidentMatch
}

export default function MatchExplanation({ match }: MatchExplanationProps) {
  const { incident, matchPercent, reasons } = match
  const resolution = incident.resolution

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40">{incident.id}</span>
        <span className="text-xs font-semibold text-cyan-accent bg-cyan-accent/10 border border-cyan-accent/30 rounded-full px-2.5 py-1">
          {matchPercent}% similarity
        </span>
      </div>

      {resolution && (
        <div className="space-y-2.5 text-sm mb-4">
          <div>
            <div className="text-white/40 text-xs mb-0.5">Root Cause</div>
            <div className="text-white/85">{resolution.rootCause}</div>
          </div>
          <div>
            <div className="text-white/40 text-xs mb-0.5">Previous Fix</div>
            <div className="text-white/85">{resolution.fixApplied}</div>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-white/40 text-xs mb-0.5">Resolved By</div>
              <div className="text-white/85">{resolution.resolvedBy}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-0.5">Resolved On</div>
              <div className="text-white/85">{formatDate(resolution.resolvedOn)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-white/40 mb-2">Evidence</div>
      <ul className="space-y-1.5">
        {reasons.map((reason, i) => (
          <motion.li
            key={reason}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 text-sm text-white/70"
          >
            <CheckCircle2 size={14} className="text-cyan-accent shrink-0" />
            {reason}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
