import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'
import { useToast } from '../hooks/useToast'
import { searchMemory, findLikelyOwner } from '../services/memoryService'
import { SEED_TEAM } from '../data/team'
import type { Incident, SimilarIncidentMatch, OwnerCandidate } from '../types'

import GlassPanel from '../components/GlassPanel'
import IncidentSearch from '../components/IncidentSearch'
import MemoryCore from '../components/MemoryCore'
import AnalysisSequence from '../components/AnalysisSequence'
import SimilarIncidents from '../components/SimilarIncidents'
import MatchExplanation from '../components/MatchExplanation'
import LikelyOwner from '../components/LikelyOwner'
import ResolutionPanel from '../components/ResolutionPanel'
import RecentActivity from '../components/RecentActivity'
import LiveMemoryStats from '../components/LiveMemoryStats'
import MemoryGrowthChart from '../components/MemoryGrowthChart'
import PulseEffect from '../components/PulseEffect'
import Modal from '../components/Modal'
import IncidentDetail from '../components/IncidentDetail'
import { formatDateTime } from '../utils/time'

type Phase = 'idle' | 'analyzing' | 'results'

export default function Home() {
  const { incidents, activity, stats, submitIncident, resolve, notify } = useIncidents()
  const { push } = useToast()

  const [phase, setPhase] = useState<Phase>('idle')
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null)
  const [matches, setMatches] = useState<SimilarIncidentMatch[]>([])
  const [selectedMatch, setSelectedMatch] = useState<SimilarIncidentMatch | null>(null)
  const [owner, setOwner] = useState<OwnerCandidate | null>(null)
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null)

  async function handleSubmit(text: string) {
    const incident = submitIncident(text)
    setActiveIncident(incident)
    setPhase('analyzing')
    const found = await searchMemory(incident)
    setMatches(found)
    setSelectedMatch(found[0] ?? null)
    setOwner(findLikelyOwner(found))
  }

  function completeAnalysis() {
    setPhase('results')
  }

  function handleResolve(resolution: Parameters<typeof resolve>[1]) {
    if (!activeIncident) return
    resolve(activeIncident.id, resolution)
    push('Memory Updated ✓ Pulse learned something new.', 'success')
  }

  function handleNotify() {
    if (!activeIncident || !owner) return
    notify(activeIncident.id, owner.name)
    push(`Incident routed to ${owner.name} ✓`, 'success')
  }

  function reset() {
    setPhase('idle')
    setActiveIncident(null)
    setMatches([])
    setSelectedMatch(null)
    setOwner(null)
  }

  const activeNodeIds = matches.map((m) => m.incident.id)

  return (
    <div className="space-y-6">
      {/* Greeting + hero */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <GlassPanel strong className="p-6 sm:p-8">
            <p className="text-sm text-cyan-soft/80 mb-2">Good evening, Prasanthi</p>
            <h1 className="font-serif text-3xl sm:text-4xl leading-tight text-white mb-4">
              Hey,
              <br />
              Let's find the <span className="text-cyan-accent">right solution.</span>
            </h1>
            <p className="text-sm sm:text-base text-white/50 max-w-xl mb-6 leading-relaxed">
              Describe the incident, and Pulse will search through past incidents, find similar
              issues, identify the likely owner, and help you resolve it faster.
            </p>
            <IncidentSearch onSubmit={handleSubmit} disabled={phase === 'analyzing'} />
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-6" delay={0.05}>
            <MemoryCore incidents={incidents} activeIncidentIds={activeNodeIds} onSelect={setDetailIncident} />
          </GlassPanel>

          <GlassPanel className="p-5" delay={0.1}>
            <LiveMemoryStats
              totalIncidents={stats.totalIncidents}
              uniqueSystems={stats.uniqueSystems}
              teamMembers={SEED_TEAM.length}
            />
          </GlassPanel>
        </div>

        <div className="space-y-5">
          <GlassPanel className="p-5" delay={0.05}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-white">Recent Activity</h3>
            </div>
            <RecentActivity
              activity={activity}
              onSelect={(id) => {
                const inc = incidents.find((i) => i.id === id)
                if (inc) setDetailIncident(inc)
              }}
            />
          </GlassPanel>
        </div>
      </div>

      {/* Investigation sequence + results */}
      <AnimatePresence mode="wait">
        {phase === 'analyzing' && (
          <motion.div key="analyzing" exit={{ opacity: 0 }}>
            <AnalysisSequence onComplete={completeAnalysis} />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'results' && activeIncident && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-white">Investigation</h2>
            <button onClick={reset} className="text-xs text-white/40 hover:text-white/80 transition-colors">
              Start a new incident
            </button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
            <GlassPanel className="p-5">
              <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                <AlertTriangle size={13} className="text-magenta" /> Current Incident
              </div>
              <div className="text-sm font-medium text-white mb-1">{activeIncident.id}</div>
              <div className="text-sm text-white/70 mb-3">{activeIncident.title}</div>
              <div className="space-y-1.5 text-xs text-white/40">
                <div>
                  Service: <span className="text-white/70">{activeIncident.system}</span>
                </div>
                <div>
                  Reported by: <span className="text-white/70">{activeIncident.reportedBy}</span>
                </div>
                <div>
                  Time: <span className="text-white/70">{formatDateTime(activeIncident.createdAt)}</span>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-5" delay={0.05}>
              <h3 className="text-xs text-white/40 mb-3">Similar Incidents Found</h3>
              <SimilarIncidents
                matches={matches}
                onSelect={(m) => setSelectedMatch(m)}
              />
            </GlassPanel>

            <GlassPanel className="p-5" delay={0.1}>
              <h3 className="text-xs text-white/40 mb-3">Why It Matched</h3>
              {selectedMatch ? (
                <MatchExplanation match={selectedMatch} />
              ) : (
                <p className="text-sm text-white/40">No match selected.</p>
              )}
            </GlassPanel>

            <GlassPanel className="p-5" delay={0.15}>
              <h3 className="text-xs text-white/40 mb-3">Likely Owner</h3>
              <LikelyOwner owner={owner} onNotify={handleNotify} />
            </GlassPanel>

            <GlassPanel className="p-5" delay={0.2}>
              <h3 className="text-xs text-white/40 mb-3">Resolve &amp; Teach</h3>
              <ResolutionPanel onResolve={handleResolve} />
            </GlassPanel>
          </div>
        </motion.div>
      )}

      {/* Growth + effect */}
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassPanel className="p-5 sm:p-6">
          <MemoryGrowthChart totalIncidents={stats.totalIncidents} />
        </GlassPanel>
        <GlassPanel className="p-5 sm:p-6 flex items-center">
          <PulseEffect activeStage={phase === 'analyzing' ? 1 : phase === 'results' ? 4 : -1} />
        </GlassPanel>
      </div>

      <Modal open={!!detailIncident} onClose={() => setDetailIncident(null)} title={detailIncident?.id}>
        {detailIncident && <IncidentDetail incident={detailIncident} />}
      </Modal>
    </div>
  )
}
