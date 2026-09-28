import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { useIncidents } from '../hooks/useIncidents'
import { findSimilarIncidents } from '../services/memoryService'
import { SEED_TEAM } from '../data/team'
import GlassPanel from '../components/GlassPanel'
import AnimatedCounter from '../components/AnimatedCounter'
import MemoryGrowthChart from '../components/MemoryGrowthChart'

const CYAN = '#4ee8ff'
const LAVENDER = '#a9a6ff'
const MAGENTA = '#e558c9'
const VIOLET = '#7c6cf0'

export default function Analytics() {
  const { incidents, stats } = useIncidents()

  const resolved = incidents.filter((i) => i.resolution)

  const avgResolutionHours = useMemo(() => {
    if (resolved.length === 0) return 0
    const total = resolved.reduce((acc, i) => {
      const created = new Date(i.createdAt).getTime()
      const done = new Date(i.resolution!.resolvedOn).getTime()
      return acc + Math.max(0, done - created) / 3_600_000
    }, 0)
    return Math.round((total / resolved.length) * 10) / 10
  }, [resolved])

  const volumeBySystem = useMemo(() => {
    const map = new Map<string, number>()
    incidents.forEach((i) => map.set(i.system, (map.get(i.system) ?? 0) + 1))
    return Array.from(map.entries()).map(([system, count]) => ({ system, count }))
  }, [incidents])

  const resolutionRateData = useMemo(() => {
    const resolvedCount = stats.resolvedCount
    const openCount = stats.openCount
    return [
      { name: 'Resolved', value: resolvedCount, color: CYAN },
      { name: 'Open / Investigating', value: openCount, color: MAGENTA },
    ]
  }, [stats])

  const matchAccuracyTrend = useMemo(() => {
    const sorted = [...resolved].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    return sorted.map((incident, i) => {
      const matches = findSimilarIncidents(incident, 1)
      return { label: incident.id, match: matches[0]?.matchPercent ?? 0, index: i + 1 }
    })
  }, [resolved])

  const ownershipConfidence = useMemo(() => {
    const total = resolved.length || 1
    return SEED_TEAM.filter((m) => m.resolvedCount > 0 || resolved.some((i) => i.resolution?.resolvedBy === m.name)).map((m) => {
      const count = resolved.filter((i) => i.resolution?.resolvedBy === m.name).length
      return { name: m.name, confidence: Math.round((count / total) * 100) }
    })
  }, [resolved])

  const avgMatch = matchAccuracyTrend.length
    ? Math.round(matchAccuracyTrend.reduce((a, b) => a + b.match, 0) / matchAccuracyTrend.length)
    : 0
  const avgConfidence = ownershipConfidence.length
    ? Math.round(ownershipConfidence.reduce((a, b) => a + b.confidence, 0) / ownershipConfidence.length)
    : 0

  const metrics = [
    { label: 'Total Incidents', value: stats.totalIncidents },
    { label: 'Resolved Incidents', value: stats.resolvedCount },
    { label: 'Avg. Resolution Time', value: avgResolutionHours, suffix: 'h' },
    { label: 'Memory Matches', value: matchAccuracyTrend.length },
    { label: 'Ownership Confidence', value: avgConfidence, suffix: '%' },
    { label: 'Memory Match Avg.', value: avgMatch, suffix: '%' },
  ]

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-white">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {metrics.map((m, i) => (
          <GlassPanel key={m.label} className="p-4" delay={i * 0.03}>
            <div className="text-2xl font-semibold text-white">
              <AnimatedCounter value={m.value} suffix={m.suffix ?? ''} />
            </div>
            <div className="text-[11px] text-white/40 mt-1 leading-tight">{m.label}</div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <GlassPanel className="p-5">
          <h3 className="font-serif text-base text-white mb-1">Incident Volume by System</h3>
          <p className="text-xs text-white/40 mb-4">Where incidents concentrate across services</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeBySystem} margin={{ left: -20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="system" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#151920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="count" fill={CYAN} radius={[6, 6, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="font-serif text-base text-white mb-1">Resolution Rate</h3>
          <p className="text-xs text-white/40 mb-4">Resolved vs. still open across all incidents</p>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionRateData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  animationDuration={800}
                >
                  {resolutionRateData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#151920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="font-serif text-base text-white mb-1">Memory Match Accuracy</h3>
          <p className="text-xs text-white/40 mb-4">Top similarity score found for each resolved incident, over time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={matchAccuracyTrend} margin={{ left: -20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="index" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#151920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
                  formatter={(v: number) => [`${v}%`, 'Top match']}
                />
                <Line type="monotone" dataKey="match" stroke={LAVENDER} strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="font-serif text-base text-white mb-1">Ownership Inference</h3>
          <p className="text-xs text-white/40 mb-4">Share of resolved incidents attributed per engineer</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ownershipConfidence} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#151920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Confidence']} />
                <Bar dataKey="confidence" fill={VIOLET} radius={[0, 6, 6, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-5 sm:p-6">
        <MemoryGrowthChart totalIncidents={stats.totalIncidents} />
      </GlassPanel>
    </div>
  )
}
