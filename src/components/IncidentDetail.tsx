import type { Incident } from '../types'
import { formatDateTime, formatDate } from '../utils/time'
import { findSimilarIncidents } from '../services/memoryService'
import SimilarIncidents from './SimilarIncidents'

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'text-magenta bg-magenta/10 border-magenta/30',
  high: 'text-magenta bg-magenta/10 border-magenta/30',
  medium: 'text-lavender-soft bg-lavender/10 border-lavender/30',
  low: 'text-white/50 bg-white/5 border-white/15',
}

const STATUS_STYLES: Record<string, string> = {
  resolved: 'text-cyan-accent bg-cyan-accent/10 border-cyan-accent/30',
  investigating: 'text-lavender-soft bg-lavender/10 border-lavender/30',
  open: 'text-magenta bg-magenta/10 border-magenta/30',
}

interface IncidentDetailProps {
  incident: Incident
}

export default function IncidentDetail({ incident }: IncidentDetailProps) {
  const similar = incident.status === 'resolved' ? [] : findSimilarIncidents(incident, 3)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full border capitalize ${STATUS_STYLES[incident.status]}`}>
          {incident.status}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full border capitalize ${PRIORITY_STYLES[incident.priority]}`}>
          {incident.priority} priority
        </span>
        <span className="text-xs px-2 py-1 rounded-full border border-white/15 text-white/50">{incident.system}</span>
      </div>

      <div>
        <div className="text-xs text-white/40 mb-1">Description</div>
        <p className="text-sm text-white/80 leading-relaxed">{incident.description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-xs text-white/40 mb-0.5">Owner</div>
          <div className="text-white/85">{incident.owner}</div>
        </div>
        <div>
          <div className="text-xs text-white/40 mb-0.5">Reported by</div>
          <div className="text-white/85">{incident.reportedBy}</div>
        </div>
        <div>
          <div className="text-xs text-white/40 mb-0.5">Reported</div>
          <div className="text-white/85">{formatDateTime(incident.createdAt)}</div>
        </div>
        {incident.resolution && (
          <div>
            <div className="text-xs text-white/40 mb-0.5">Resolved</div>
            <div className="text-white/85">{formatDate(incident.resolution.resolvedOn)}</div>
          </div>
        )}
      </div>

      {incident.resolution ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
          <div className="text-xs text-cyan-accent font-medium mb-1">Resolution &amp; Memory Entry</div>
          <div>
            <div className="text-xs text-white/40 mb-0.5">Root Cause</div>
            <div className="text-sm text-white/85">{incident.resolution.rootCause}</div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-0.5">Fix Applied</div>
            <div className="text-sm text-white/85">{incident.resolution.fixApplied}</div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-0.5">Resolved By</div>
            <div className="text-sm text-white/85">{incident.resolution.resolvedBy}</div>
          </div>
          {incident.resolution.tags && incident.resolution.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {incident.resolution.tags.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-xs text-white/40 mb-2">Similar incidents in memory</div>
          <SimilarIncidents matches={similar} />
        </div>
      )}
    </div>
  )
}
