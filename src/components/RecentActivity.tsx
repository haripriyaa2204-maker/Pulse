import { motion } from 'framer-motion'
import type { ActivityItem } from '../types'
import { timeAgo } from '../utils/time'

interface RecentActivityProps {
  activity: ActivityItem[]
  onSelect?: (incidentId: string) => void
}

const STATUS_STYLES: Record<string, string> = {
  resolved: 'text-cyan-accent bg-cyan-accent/10 border-cyan-accent/30',
  investigating: 'text-lavender-soft bg-lavender/10 border-lavender/30',
  open: 'text-magenta bg-magenta/10 border-magenta/30',
}

export default function RecentActivity({ activity, onSelect }: RecentActivityProps) {
  if (activity.length === 0) {
    return <p className="text-sm text-white/40">No activity yet — resolve an incident to get started.</p>
  }

  return (
    <div className="relative">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
      <div className="space-y-3">
        {activity.slice(0, 6).map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect?.(item.incidentId)}
            className="relative w-full text-left pl-6 group"
          >
            <span
              className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 ${
                item.status === 'resolved'
                  ? 'bg-cyan-accent border-cyan-accent'
                  : item.status === 'open'
                  ? 'bg-magenta border-magenta'
                  : 'bg-lavender border-lavender'
              }`}
            />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm text-white/85 truncate group-hover:text-white">
                  {item.incidentId} <span className="text-white/40 font-normal">— {item.title}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[item.status]}`}>
                {item.status}
              </span>
              <span className="text-[11px] text-white/30">{timeAgo(item.timestamp)}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
