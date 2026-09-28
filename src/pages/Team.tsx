import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useIncidents } from '../hooks/useIncidents'
import { SEED_TEAM } from '../data/team'
import GlassPanel from '../components/GlassPanel'
import Modal from '../components/Modal'
import IncidentDetail from '../components/IncidentDetail'
import type { Incident } from '../types'
import { timeAgo } from '../utils/time'

export default function Team() {
  const { incidents } = useIncidents()
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [detail, setDetail] = useState<Incident | null>(null)

  const resolvedByMember = useMemo(() => {
    const map = new Map<string, Incident[]>()
    incidents.forEach((inc) => {
      if (inc.resolution) {
        const owner = inc.resolution.resolvedBy
        map.set(owner, [...(map.get(owner) ?? []), inc])
      }
    })
    return map
  }, [incidents])

  const activeMember = SEED_TEAM.find((m) => m.name === selectedMember)
  const activeIncidents = activeMember ? resolvedByMember.get(activeMember.name) ?? [] : []

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-white">Team</h1>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {SEED_TEAM.map((member, i) => {
          const resolved = resolvedByMember.get(member.name) ?? []
          return (
            <motion.button
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedMember(member.name)}
              className="text-left"
            >
              <GlassPanel className="p-5 h-full hover:border-cyan-accent/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet to-cyan-accent flex items-center justify-center text-sm font-semibold text-charcoal-950 shrink-0">
                    {member.avatarSeed}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{member.name}</div>
                    <div className="text-xs text-white/40">{member.role}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-white/40 text-xs">Resolved incidents</span>
                  <span className="text-cyan-accent font-semibold">{resolved.length}</span>
                </div>
                <div className="mb-3">
                  <div className="text-xs text-white/40 mb-1.5">Systems</div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.systems.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  Recent resolution: <span className="text-white/70">{member.recentResolution}</span>
                </div>
              </GlassPanel>
            </motion.button>
          )
        })}
      </div>

      <Modal open={!!activeMember} onClose={() => setSelectedMember(null)} title={activeMember?.name}>
        {activeMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet to-cyan-accent flex items-center justify-center text-base font-semibold text-charcoal-950">
                {activeMember.avatarSeed}
              </div>
              <div>
                <div className="text-white font-medium">{activeMember.name}</div>
                <div className="text-xs text-white/40">{activeMember.role}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40 mb-2">Incident history ({activeIncidents.length})</div>
              <div className="space-y-2">
                {activeIncidents.length === 0 && (
                  <p className="text-sm text-white/40">No resolved incidents yet.</p>
                )}
                {activeIncidents
                  .sort((a, b) => new Date(b.resolution!.resolvedOn).getTime() - new Date(a.resolution!.resolvedOn).getTime())
                  .map((inc) => (
                    <button
                      key={inc.id}
                      onClick={() => setDetail(inc)}
                      className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-white/85 truncate">{inc.id} — {inc.title}</div>
                        <div className="text-xs text-white/35">{inc.system}</div>
                      </div>
                      <span className="text-xs text-white/30 shrink-0 ml-2">{timeAgo(inc.resolution!.resolvedOn)}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.id}>
        {detail && <IncidentDetail incident={detail} />}
      </Modal>
    </div>
  )
}
