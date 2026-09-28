import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'
import GlassPanel from '../components/GlassPanel'
import Modal from '../components/Modal'
import IncidentDetail from '../components/IncidentDetail'
import type { Incident, IncidentPriority, IncidentStatus } from '../types'
import { timeAgo } from '../utils/time'

const STATUS_STYLES: Record<string, string> = {
  resolved: 'text-cyan-accent bg-cyan-accent/10 border-cyan-accent/30',
  investigating: 'text-lavender-soft bg-lavender/10 border-lavender/30',
  open: 'text-magenta bg-magenta/10 border-magenta/30',
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'text-magenta',
  high: 'text-magenta',
  medium: 'text-lavender-soft',
  low: 'text-white/40',
}

export default function Incidents() {
  const { incidents } = useIncidents()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<IncidentStatus | 'all'>('all')
  const [priority, setPriority] = useState<IncidentPriority | 'all'>('all')
  const [system, setSystem] = useState<string>('all')
  const [owner, setOwner] = useState<string>('all')
  const [selected, setSelected] = useState<Incident | null>(null)

  const systems = useMemo(() => Array.from(new Set(incidents.map((i) => i.system))).sort(), [incidents])
  const owners = useMemo(() => Array.from(new Set(incidents.map((i) => i.owner))).sort(), [incidents])

  const filtered = useMemo(() => {
    return incidents
      .filter((i) => (status === 'all' ? true : i.status === status))
      .filter((i) => (priority === 'all' ? true : i.priority === priority))
      .filter((i) => (system === 'all' ? true : i.system === system))
      .filter((i) => (owner === 'all' ? true : i.owner === owner))
      .filter((i) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [incidents, status, priority, system, owner, query])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-white">Incidents</h1>
        <span className="text-xs text-white/40">{filtered.length} of {incidents.length} shown</span>
      </div>

      <GlassPanel className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <Search size={15} className="text-white/40 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, title, or description..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none min-w-0"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select label="Status" value={status} onChange={setStatus} options={['all', 'open', 'investigating', 'resolved']} />
            <Select label="Priority" value={priority} onChange={setPriority} options={['all', 'low', 'medium', 'high', 'critical']} />
            <Select label="System" value={system} onChange={setSystem} options={['all', ...systems]} />
            <Select label="Owner" value={owner} onChange={setOwner} options={['all', ...owners]} />
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-white/40 border-b border-white/[0.06]">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">System</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((incident, i) => (
                <motion.tr
                  key={incident.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                  onClick={() => setSelected(incident)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-white/70 font-mono text-xs">{incident.id}</td>
                  <td className="px-4 py-3 text-white/85 max-w-[280px] truncate">{incident.title}</td>
                  <td className="px-4 py-3 text-white/50">{incident.system}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[incident.status]}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 capitalize font-medium ${PRIORITY_STYLES[incident.priority]}`}>
                    {incident.priority}
                  </td>
                  <td className="px-4 py-3 text-white/50">{incident.owner}</td>
                  <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{timeAgo(incident.createdAt)}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/30 text-sm">
                    No incidents match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id}>
        {selected && <IncidentDetail incident={selected} />}
      </Modal>
    </div>
  )
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: string[]
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 outline-none focus:border-cyan-accent/40 capitalize"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-charcoal-800 capitalize">
          {opt === 'all' ? `All ${label}` : opt}
        </option>
      ))}
    </select>
  )
}
